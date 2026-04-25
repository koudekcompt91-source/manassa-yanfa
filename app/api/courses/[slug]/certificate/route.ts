import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { resolveStudentCourseAccessByRef } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";
import { issueCertificateIfEligible, serializeCertificate } from "@/lib/certificates";

async function loadCertificate(slugRef: string, studentId: string, allowIssue: boolean) {
  const access = await resolveStudentCourseAccessByRef(slugRef, studentId);
  if (!access.ok) {
    const status = access.code === 403 ? 403 : 404;
    return {
      response: NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى شهادة هذه الدورة." }, { status }),
    };
  }

  const progress = await getCourseProgressForStudent(access.course.id, studentId);
  let certificate = await prisma.certificate.findUnique({
    where: { studentId_courseId: { studentId, courseId: access.course.id } },
    include: {
      student: { select: { fullName: true, email: true } },
      course: { select: { title: true, slug: true, teacherId: true } },
    },
  });

  if (!certificate && allowIssue) {
    certificate = await issueCertificateIfEligible(access.course.id, studentId);
  }

  return {
    response: NextResponse.json({
      ok: true,
      progress: {
        progressPercent: progress.progressPercent,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
      },
      certificate: certificate ? serializeCertificate(certificate) : null,
      canIssue: progress.isCompleted,
    }),
  };
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
    const { response } = await loadCertificate(ref, guard.session.sub, true);
    return response;
  } catch (e) {
    console.error("[courses/:slug/certificate][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل بيانات الشهادة." }, { status: 500 });
  }
}

export async function POST(_: Request, { params }: { params: { slug: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
    const { response } = await loadCertificate(ref, guard.session.sub, true);
    return response;
  } catch (e) {
    console.error("[courses/:slug/certificate][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إصدار الشهادة." }, { status: 500 });
  }
}
