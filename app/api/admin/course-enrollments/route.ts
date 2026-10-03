import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isPlausibleEmail, normalizeStudentEmail } from "@/lib/teacher-course-enrollment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_ENROLL_SOURCE = "ADMIN";

async function loadPaidCourse(courseId: string) {
  const id = String(courseId || "").trim();
  if (!id) return null;
  return prisma.course.findFirst({
    where: { id, system: "PAID" },
    select: { id: true, title: true, system: true },
  });
}

export async function GET(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const courseId = String(new URL(req.url).searchParams.get("courseId") || "").trim();
    const course = await loadPaidCourse(courseId);
    if (!course) {
      return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
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
  } catch {
    console.error("[admin/course-enrollments][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الطلاب." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-course-enroll:${ip}:${guard.session.sub}`,
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
    const body = await req.json().catch(() => ({}));
    const courseId = String(body?.courseId || "").trim();
    const email = normalizeStudentEmail(body?.email);

    if (!courseId) {
      return NextResponse.json({ ok: false, message: "اختر الدورة." }, { status: 400 });
    }
    if (!isPlausibleEmail(email)) {
      return NextResponse.json({ ok: false, message: "أدخل بريدًا إلكترونيًا صالحًا." }, { status: 400 });
    }

    const course = await loadPaidCourse(courseId);
    if (!course) {
      return NextResponse.json({ ok: false, message: "الدورة غير موجودة أو ليست ضمن النظام المدفوع." }, { status: 404 });
    }

    const student = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, role: true },
    });
    if (!student) {
      return NextResponse.json(
        { ok: false, message: "لم يتم العثور على طالب بهذا البريد الإلكتروني." },
        { status: 404 }
      );
    }
    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { ok: false, message: "يمكن تفعيل الدورات لحسابات الطلاب فقط." },
        { status: 403 }
      );
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
        student: { id: student.id, fullName: student.fullName, email: student.email },
        course: { id: course.id, title: course.title },
      });
    }

    try {
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          packageId: course.id,
          source: ADMIN_ENROLL_SOURCE,
          paidMad: null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({
          ok: true,
          alreadyEnrolled: true,
          message: "هذا الطالب مفعّل بالفعل في هذه الدورة.",
          student: { id: student.id, fullName: student.fullName, email: student.email },
          course: { id: course.id, title: course.title },
        });
      }
      throw err;
    }

    console.info(`[ADMIN_COURSE_ENROLLED] admin=${guard.session.sub} course=${course.id} student=${student.id}`);

    return NextResponse.json({
      ok: true,
      alreadyEnrolled: false,
      message: "تم تفعيل الدورة للطالب بنجاح.",
      student: { id: student.id, fullName: student.fullName, email: student.email },
      course: { id: course.id, title: course.title },
    });
  } catch {
    console.error("[admin/course-enrollments][POST] error");
    return NextResponse.json({ ok: false, message: "تعذّر تفعيل الدورة." }, { status: 500 });
  }
}
