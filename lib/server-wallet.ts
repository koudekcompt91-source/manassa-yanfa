import { Role } from "@prisma/client";
import { getPackageAcademicLevel } from "@/lib/academic-levels";
import { defaultDemoData } from "@/lib/demo-data/defaults";
import { getPackagePriceMad } from "@/lib/wallet-ops";
import { prisma } from "@/lib/prisma";

/**
 * Resolve a package from the server catalog (bundled defaults — source of truth for pricing on the server).
 * Accepts canonical `id` or URL `slug` so purchases stay aligned with enrollments.
 */
export async function resolveCatalogPackage(packageRef: string) {
  const ref = String(packageRef ?? "").trim();
  if (!ref) return null;

  const dbCourse = await prisma.course.findFirst({
    where: {
      OR: [{ id: ref }, { slug: decodeURIComponent(ref).trim() }],
      status: "PUBLISHED",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      categoryId: true,
      teacherId: true,
      thumbnailUrl: true,
      isFeatured: true,
      accessType: true,
      price: true,
      order: true,
      academicLevel: true,
      level: true,
    },
  });
  if (dbCourse) {
    return {
      id: dbCourse.id,
      slug: dbCourse.slug,
      title: dbCourse.title,
      description: dbCourse.description,
      categoryId: dbCourse.categoryId,
      teacherId: dbCourse.teacherId,
      coverImage: dbCourse.thumbnailUrl,
      isFeatured: dbCourse.isFeatured,
      isPublished: true,
      priceType: dbCourse.accessType === "PAID" ? "premium" : "free",
      priceMad: dbCourse.price,
      order: dbCourse.order,
      academicLevel: dbCourse.academicLevel,
      level: dbCourse.level,
    };
  }

  const list = defaultDemoData.packages || [];
  const decoded = decodeURIComponent(ref).trim();
  const byId = list.find((p) => String(p.id) === ref);
  if (byId) return byId;
  return list.find((p) => decodeURIComponent(String(p.slug ?? "")).trim() === decoded) ?? null;
}

/** @deprecated use resolveCatalogPackage — kept for any external imports */
export async function getCatalogPackageById(packageId: string) {
  return resolveCatalogPackage(packageId);
}

export async function submitRechargeRequestDb(
  userId: string,
  payload: {
    paymentMethod: string;
    firstName: string;
    lastName: string;
    wilaya: string;
    baladiya: string;
    phone: string;
    amount: number;
    receiptImage: string;
    note: string;
  }
) {
  const amount = Math.round(Number(payload.amount) || 0);
  if (amount <= 0) return { ok: false as const, message: "أدخل مبلغًا صالحًا أكبر من صفر." };
  if (!payload.firstName?.trim() || !payload.lastName?.trim() || !payload.wilaya?.trim() || !payload.baladiya?.trim() || !payload.phone?.trim()) {
    return { ok: false as const, message: "يرجى تعبئة جميع الحقول المطلوبة." };
  }
  if (!payload.receiptImage?.trim()) return { ok: false as const, message: "يرجى إرفاق صورة الإيصال." };

  const pm =
    payload.paymentMethod === "e_payment" || payload.paymentMethod === "recharge_card" ? payload.paymentMethod : "ccp";

  await prisma.rechargeRequest.create({
    data: {
      userId,
      paymentMethod: pm,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      wilaya: payload.wilaya.trim(),
      baladiya: payload.baladiya.trim(),
      phone: payload.phone.trim(),
      amount,
      receiptImage: payload.receiptImage,
      note: payload.note?.trim() || "",
    },
  });
  return { ok: true as const };
}

export async function approveRechargeRequestDb(requestId: string) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.rechargeRequest.findFirst({
      where: { id: requestId, status: "pending" },
    });
    if (!req) return { ok: false as const, message: "الطلب غير موجود أو تمت معالجته مسبقًا." };

    const amount = Math.round(req.amount);
    if (amount <= 0) return { ok: false as const, message: "مبلغ الطلب غير صالح." };

    const user = await tx.user.findUnique({ where: { id: req.userId } });
    if (!user) return { ok: false as const, message: "المستخدم غير موجود." };

    const nextBal = Math.max(0, user.walletBalance + amount);

    await tx.rechargeRequest.update({
      where: { id: req.id },
      data: { status: "approved", reviewedAt: new Date() },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { walletBalance: nextBal },
    });

    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        type: "recharge_approved",
        amount,
        labelAr: "شحن رصيد (مقبول)",
        balanceAfter: nextBal,
        rechargeRequestId: req.id,
      },
    });

    return { ok: true as const };
  });
}

export async function rejectRechargeRequestDb(requestId: string, rejectionNote: string) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.rechargeRequest.findFirst({
      where: { id: requestId, status: "pending" },
    });
    if (!req) return { ok: false as const, message: "الطلب غير موجود أو تمت معالجته مسبقًا." };

    const user = await tx.user.findUnique({ where: { id: req.userId } });
    const balanceAfter = user?.walletBalance ?? 0;

    await tx.rechargeRequest.update({
      where: { id: req.id },
      data: {
        status: "rejected",
        reviewedAt: new Date(),
        rejectionNote: rejectionNote.trim() || null,
      },
    });

    const note = rejectionNote.trim();
    await tx.walletTransaction.create({
      data: {
        userId: req.userId,
        type: "recharge_rejected",
        amount: 0,
        labelAr: note ? `رفض طلب شحن: ${note}` : "رفض طلب شحن",
        balanceAfter,
        rechargeRequestId: req.id,
        note: note || null,
      },
    });

    return { ok: true as const };
  });
}

export async function purchaseOrEnrollPackageDb(userId: string, packageRef: string) {
  const pkg = await resolveCatalogPackage(packageRef);
  if (!pkg?.id) return { ok: false as const, message: "الدورة غير موجودة." };

  const canonicalPackageId = String(pkg.id);
  const price = getPackagePriceMad(pkg);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.enrollment.findUnique({
      where: { userId_packageId: { userId, packageId: canonicalPackageId } },
    });
    if (existing) return { ok: false as const, code: "already_enrolled" as const, message: "أنت مسجّل في هذه الدورة مسبقًا." };

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false as const, message: "المستخدم غير موجود." };

    if (user.role === Role.STUDENT) {
      const pkgItemLevel = String((pkg as { level?: string | null }).level ?? "").trim();
      if (pkgItemLevel) {
        const userCode = String(user.level ?? "").trim() || "unknown";
        if (userCode !== "unknown" && userCode !== pkgItemLevel) {
          return { ok: false as const, code: "wrong_level" as const, message: "هذه الدورة لا تخص مستواك الدراسي." };
        }
      } else {
        const studentLevel = String(user.academicLevel ?? "").trim();
        if (!studentLevel) {
          return { ok: false as const, code: "no_academic_level" as const, message: "يرجى إكمال المستوى الدراسي في ملفك." };
        }
        const pkgLevel = getPackageAcademicLevel(pkg);
        if (pkgLevel !== studentLevel) {
          return { ok: false as const, code: "wrong_level" as const, message: "هذه الدورة لا تخص مستواك الدراسي." };
        }
      }
    }

    const title = String(pkg.title || canonicalPackageId);

    if (price <= 0) {
      await tx.enrollment.create({
        data: { userId, packageId: canonicalPackageId, source: "free" },
      });
      await tx.walletTransaction.create({
        data: {
          userId,
          type: "package_enrolled_free",
          amount: 0,
          labelAr: `تسجيل مجاني: ${title}`,
          balanceAfter: user.walletBalance,
          packageId: canonicalPackageId,
        },
      });
      return { ok: true as const, code: "free_enrolled" as const };
    }

    if (user.walletBalance < price) {
      return { ok: false as const, code: "insufficient" as const, message: "رصيدك غير كافٍ" };
    }

    const nextBal = user.walletBalance - price;
    if (nextBal < 0) return { ok: false as const, code: "insufficient" as const, message: "رصيدك غير كافٍ" };

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: nextBal },
    });

    await tx.enrollment.create({
      data: { userId, packageId: canonicalPackageId, source: "wallet", paidMad: price },
    });

    await tx.walletTransaction.create({
      data: {
        userId,
        type: "package_purchase",
        amount: -price,
        labelAr: `شراء دورة: ${title}`,
        balanceAfter: nextBal,
        packageId: canonicalPackageId,
      },
    });

    return { ok: true as const, code: "purchased" as const };
  });
}
