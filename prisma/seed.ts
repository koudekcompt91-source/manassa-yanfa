import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@yanfa.app" },
    create: {
      email: "admin@yanfa.app",
      passwordHash: adminHash,
      fullName: "مدير المنصة",
      role: "ADMIN",
      walletBalance: 0,
      status: "ACTIVE",
    },
    update: {
      passwordHash: adminHash,
      fullName: "مدير المنصة",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const studentHash = await bcrypt.hash("student123", 10);
  await prisma.user.upsert({
    where: { email: "student@yanfa.app" },
    create: {
      email: "student@yanfa.app",
      passwordHash: studentHash,
      fullName: "طالب تجريبي",
      role: "STUDENT",
      level: "4AM",
      academicLevel: "الرابعة متوسط",
      walletBalance: 2500,
      status: "ACTIVE",
    },
    update: {
      passwordHash: studentHash,
      fullName: "طالب تجريبي",
      role: "STUDENT",
      level: "4AM",
      academicLevel: "الرابعة متوسط",
      status: "ACTIVE",
      walletBalance: 2500,
    },
  });

  console.log("Seed OK: admin@yanfa.app / admin123 , student@yanfa.app / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
