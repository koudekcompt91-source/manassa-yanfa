import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@yanfa.app";
  const plainPassword = "Admin2026";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      fullName: "Admin",
    },
    create: {
      email,
      passwordHash,
      fullName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      level: "unknown",
      academicLevel: "إدارة",
      walletBalance: 0,
    },
  });

  console.log("SUCCESS");
  console.log("EMAIL:", admin.email);
  console.log("PASSWORD_RESET:", "done");
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });