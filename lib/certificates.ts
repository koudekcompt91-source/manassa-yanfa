import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";
import { createNotificationsForUsers } from "@/lib/server-notifications";

const DEFAULT_TEACHER_NAME = "يوسف مادن";

function makeCode() {
  const part = randomBytes(6).toString("hex").toUpperCase();
  return `YNF-${new Date().getFullYear()}-${part}`;
}

async function generateUniqueCertificateCode() {
  for (let i = 0; i < 8; i += 1) {
    const code = makeCode();
    const exists = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  return `YNF-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function serializeCertificate(certificate: {
  id: string;
  certificateCode: string;
  studentId: string;
  courseId: string;
  issuedAt: Date;
  completedAt: Date;
  status: "ACTIVE" | "REVOKED";
  revokedAt: Date | null;
  student?: { fullName: string; email: string };
  course?: { title: string; slug: string; teacherId: string | null };
}) {
  return {
    id: certificate.id,
    certificateCode: certificate.certificateCode,
    studentId: certificate.studentId,
    courseId: certificate.courseId,
    issuedAt: certificate.issuedAt.toISOString(),
    completedAt: certificate.completedAt.toISOString(),
    status: certificate.status,
    revokedAt: certificate.revokedAt ? certificate.revokedAt.toISOString() : null,
    studentName: certificate.student?.fullName || "",
    studentEmail: certificate.student?.email || "",
    courseTitle: certificate.course?.title || "",
    courseSlug: certificate.course?.slug || "",
    teacherName: DEFAULT_TEACHER_NAME,
    platformNameAr: "منصة ينفع",
    platformNameEn: "Yanfa Education",
    verificationLink: `/verify-certificate/${encodeURIComponent(certificate.certificateCode)}`,
  };
}

export async function issueCertificateIfEligible(courseId: string, studentId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: {
      student: { select: { fullName: true, email: true } },
      course: { select: { title: true, slug: true, teacherId: true } },
    },
  });
  if (existing) return existing;

  const progress = await getCourseProgressForStudent(courseId, studentId);
  if (!progress.isCompleted || !progress.completedAt) return null;

  const code = await generateUniqueCertificateCode();
  const certificate = await prisma.certificate.create({
    data: {
      certificateCode: code,
      studentId,
      courseId,
      completedAt: progress.completedAt,
      issuedAt: new Date(),
      status: "ACTIVE",
    },
    include: {
      student: { select: { fullName: true, email: true } },
      course: { select: { title: true, slug: true, teacherId: true } },
    },
  });

  await createNotificationsForUsers([studentId], {
    title: "تم إصدار شهادتك",
    message: "مبروك! أصبحت شهادتك متاحة بعد إكمال الدورة.",
    type: "GENERAL",
    link: `/dashboard/certificates/${encodeURIComponent(certificate.certificateCode)}`,
  });

  return certificate;
}
