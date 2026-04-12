import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { isValidAcademicLevel } from "@/lib/academic-levels";
import {
  isValidStudentLevelCode,
  mapArabicLabelToStudentLevelCode,
  mapStudentLevelCodeToArabic,
} from "@/lib/student-level-codes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let step = "init";
  try {
    step = "parse-body";
    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    const levelRaw = String(body.level || "").trim();
    const academicLevelLegacy = String(body.academicLevel || "").trim();

    step = "validate";
    if (!fullName || !email) {
      return NextResponse.json({ ok: false, message: "البيانات غير مكتملة." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "كلمة المرور يجب ألا تقل عن 6 أحرف." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ ok: false, message: "كلمتا المرور غير متطابقتين." }, { status: 400 });
    }

    let level = levelRaw;
    if (!isValidStudentLevelCode(level)) {
      if (isValidAcademicLevel(academicLevelLegacy)) {
        const mapped = mapArabicLabelToStudentLevelCode(academicLevelLegacy);
        if (mapped) level = mapped;
      }
    }
    if (!isValidStudentLevelCode(level)) {
      return NextResponse.json({ ok: false, message: "اختر المستوى الدراسي من القائمة." }, { status: 400 });
    }

    const academicLevel = mapStudentLevelCodeToArabic(level) || academicLevelLegacy;
    if (!isValidAcademicLevel(academicLevel)) {
      return NextResponse.json({ ok: false, message: "مستوى غير صالح." }, { status: 400 });
    }

    step = "check-existing";
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ ok: false, message: "البريد مستخدم مسبقًا." }, { status: 409 });
    }

    step = "hash-password";
    const passwordHash = await hashPassword(password);

    step = "create-user";
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: "STUDENT",
        level,
        academicLevel,
        walletBalance: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "تم إنشاء الحساب بنجاح. سجّل دخولك الآن.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[register] FAILED at step="${step}":`, msg);
    if (e instanceof Error && e.stack) console.error("[register] stack:", e.stack);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء الحساب." }, { status: 500 });
  }
}
