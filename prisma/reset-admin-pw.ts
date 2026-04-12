import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@yanfa.app";
  const newPassword = "Admin123456!";

  const hash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash, role: "ADMIN", status: "ACTIVE" },
  });

  console.log(`OK: password reset for ${user.email} (role=${user.role})`);
}

main()
  .catch((e) => {
    console.error("FAILED:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
