/**
 * Production DB bootstrap for Railway (PostgreSQL only).
 *
 * Handles:
 * - Normal `prisma migrate deploy`
 * - Non-empty DB without history (baseline init)
 * - Corrupted legacy sqlite migration history (reset `_prisma_migrations`, then baseline)
 *
 * Never uses sqlite or `db push`.
 */
import { execSync } from "node:child_process";

const INIT_MIGRATION = "20260906120000_init";

function run(cmd, { allowFail = false } = {}) {
  console.log(`[db-deploy] $ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
    return true;
  } catch {
    if (allowFail) {
      console.warn(`[db-deploy] command failed (continuing): ${cmd}`);
      return false;
    }
    throw new Error(`Command failed: ${cmd}`);
  }
}

function baselineInit() {
  console.warn(`[db-deploy] baselining ${INIT_MIGRATION}`);
  return run(`npx prisma migrate resolve --applied "${INIT_MIGRATION}"`, { allowFail: true });
}

function clearLegacyMigrationRows() {
  console.warn("[db-deploy] clearing legacy _prisma_migrations rows");
  const sql =
    'CREATE TABLE IF NOT EXISTS "_prisma_migrations" ("id" VARCHAR(36) PRIMARY KEY, "checksum" VARCHAR(64) NOT NULL, "finished_at" TIMESTAMPTZ, "migration_name" VARCHAR(255) NOT NULL, "logs" TEXT, "rolled_back_at" TIMESTAMPTZ, "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "applied_steps_count" INTEGER NOT NULL DEFAULT 0); DELETE FROM "_prisma_migrations";';
  try {
    execSync("npx prisma db execute --stdin", {
      input: sql,
      stdio: ["pipe", "inherit", "inherit"],
      env: process.env,
    });
    return true;
  } catch {
    console.warn("[db-deploy] could not clear _prisma_migrations");
    return false;
  }
}

function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[db-deploy] DATABASE_URL is missing");
    process.exit(1);
  }

  if (run("npx prisma migrate deploy", { allowFail: true })) {
    console.log("[db-deploy] migrations applied");
    return;
  }

  // Schema already exists (prior db push) — mark init as applied.
  baselineInit();
  if (run("npx prisma migrate deploy", { allowFail: true })) {
    console.log("[db-deploy] migrations applied after baseline");
    return;
  }

  // `_prisma_migrations` still references deleted sqlite migrations.
  clearLegacyMigrationRows();
  baselineInit();
  if (run("npx prisma migrate deploy", { allowFail: true })) {
    console.log("[db-deploy] migrations applied after history reset");
    return;
  }

  // Do not block boot forever — FREE/admin APIs have try/catch fallbacks.
  console.error(
    "[db-deploy] WARNING: migrate deploy still failing. Starting app anyway; check Railway logs / schema."
  );
}

main();
