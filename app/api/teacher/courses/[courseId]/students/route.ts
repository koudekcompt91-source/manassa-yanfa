import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireTeacherApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  isPlausibleEmail,
  loadTeacherOwnedPaidCourse,
  normalizeStudentEmail,
  TEACHER_ENROLL_SOURCE,
} from "@/lib/teacher-course-enrollment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { courseId: string } };

const NOT_OWNED = "لا يمكنك إدارة هذه الدورة.";
const STUDENT_NOT_FOUND = "لم يتم العثور على طالب بهذا البريد الإلكتروني.";

async function assertActiveTeacher(teacherId: string) {
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { id: true, role: true, status: true },
  });
  return Boolean(teacher && teacher.role === "TEACHER" && teacher.status === "ACTIVE");
}

export async function GET(_req: Request, { params }: RouteCtx) {
  const guard = await requireTeacherApiSession();
  if (!guard.ok) return guard.response;

  try {
    if (!(await assertActiveTeacher(guard.session.sub))) {
      return NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 });
    }

    const course = await loadTeacherOwnedPaidCourse(guard.session.sub, params.courseId);
    if (!course) {
      return NextResponse.json({ ok: false, message: NOT_OWNED }, { status: 403 });
    }

    const rows = await prisma.enrollment.findMany({
      where: { packageId: course.id },
      orderBy: { enrolledAt: "desc" },
      select: {
        enrolledAt: true,
        source: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            academicLevel: true,
            level: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      course: { id: course.id, title: course.title },
      students: rows
        .filter((row) => row.user.role === "STUDENT")
        .map((row) => ({
          id: row.user.id,
          fullName: row.user.fullName,
          email: row.user.email,
          academicLevel: row.user.academicLevel,
          level: row.user.level,
          enrolledAt: row.enrolledAt.toISOString(),
          source: row.source,
        })),
    });
  } catch (e) {
    console.error("[teacher/courses/:id/students][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الطلاب." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteCtx) {
  const guard = await requireTeacherApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `teacher-enroll:${ip}:${guard.session.sub}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد الطلبات كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    if (!(await assertActiveTeacher(guard.session.sub))) {
      return NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 });
    }

    const course = await loadTeacherOwnedPaidCourse(guard.session.sub, params.courseId);
    if (!course) {
      return NextResponse.json({ ok: false, message: NOT_OWNED }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const email = normalizeStudentEmail(body?.email);
    if (!isPlausibleEmail(email)) {
      return NextResponse.json({ ok: false, message: "أدخل بريدًا إلكترونيًا صالحًا." }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, role: true },
    });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ ok: false, message: STUDENT_NOT_FOUND }, { status: 404 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_packageId: { userId: student.id, packageId: course.id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyEnrolled: true,
        message: "هذا الطالب مفعّل بالفعل في هذه الدورة.",
      });
    }

    try {
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          packageId: course.id,
          source: TEACHER_ENROLL_SOURCE,
          paidMad: null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({
          ok: true,
          alreadyEnrolled: true,
          message: "هذا الطالب مفعّل بالفعل في هذه الدورة.",
        });
      }
      throw err;
    }

    console.info(
      `[TEACHER_COURSE_ENROLLED] teacher=${guard.session.sub} course=${course.id} student=${student.id}`
    );

    return NextResponse.json({
      ok: true,
      alreadyEnrolled: false,
      message: "تم تفعيل الدورة للطالب بنجاح.",
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
      },
      course: {
        id: course.id,
        title: course.title,
      },
    });
  } catch (e) {
    console.error("[teacher/courses/:id/students][POST] error");
    return NextResponse.json({ ok: false, message: "تعذّر تفعيل الدورة." }, { status: 500 });
  }
}
