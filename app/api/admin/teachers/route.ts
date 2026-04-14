import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { validateTeacherCreateInput } from "@/lib/teacher-validation";

export const runtime = "nodejs";

function teacherRoleOrFallback(): Role {
  const hasTeacherRole = Object.values(Role).includes("TEACHER" as Role);
  return hasTeacherRole ? ("TEACHER" as Role) : Role.STUDENT;
}

function mapTeacher(user: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: "ACTIVE" | "DISABLED";
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function GET() {
  let step = "init";
  try {
    step = "check-session";
    const session = await getAdminSessionFromCookies();
    if (!session) {
      console.warn("[admin/teachers][GET] REJECT: no admin session");
      return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
    }

    step = "list-teachers";
    const role = teacherRoleOrFallback();
    const teachers = await prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      teachers: teachers.map(mapTeacher),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[admin/teachers][GET] FAILED at step="${step}":`, msg);
    if (e instanceof Error && e.stack) console.error("[admin/teachers][GET] stack:", e.stack);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل قائمة الأساتذة." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let step = "init";
  try {
    step = "check-session";
    const session = await getAdminSessionFromCookies();
    if (!session) {
      console.warn("[admin/teachers][POST] REJECT: no admin session");
      return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
    }

    step = "parse-body";
    const body = await req.json();
    const validation = validateTeacherCreateInput(body || {});
    if (!validation.ok || !validation.value) {
      console.warn("[admin/teachers][POST] REJECT: validation failed", validation.message);
      return NextResponse.json({ ok: false, message: validation.message || "بيانات غير صالحة." }, { status: 400 });
    }

    const { fullName, email, password, phone } = validation.value;
    console.log(`[admin/teachers][POST] create requested for email=${email}`);

    step = "check-duplicate-email";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.warn(`[admin/teachers][POST] REJECT: duplicate email=${email}`);
      return NextResponse.json({ ok: false, message: "البريد مستخدم مسبقًا." }, { status: 409 });
    }

    step = "hash-password";
    const passwordHash = await hashPassword(password);

    step = "create-teacher";
    const role = teacherRoleOrFallback();
    const teacher = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    console.log(`[admin/teachers][POST] SUCCESS: teacherId=${teacher.id} email=${teacher.email}`);
    return NextResponse.json({
      ok: true,
      message: "تم إنشاء حساب الأستاذ بنجاح.",
      teacher: mapTeacher(teacher),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[admin/teachers][POST] FAILED at step="${step}":`, msg);
    if (e instanceof Error && e.stack) console.error("[admin/teachers][POST] stack:", e.stack);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء حساب الأستاذ." }, { status: 500 });
  }
}
