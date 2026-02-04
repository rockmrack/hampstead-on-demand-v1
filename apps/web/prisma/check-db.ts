import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database connectivity...\n");

  // Extract and show DB host (hide credentials)
  const dbUrl = process.env.DATABASE_URL || "";
  const hostMatch = dbUrl.match(/@([^:\/]+)/);
  const dbHost = hostMatch ? hostMatch[1] : "unknown";
  console.log(`Database host: ${dbHost}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}\n`);

  try {
    // Test basic connectivity
    const versionResult = await prisma.$queryRaw<[{ version: string }]>`SELECT version()`;
    console.log("✓ Database connected successfully");
    console.log(`  PostgreSQL: ${versionResult[0].version.split(",")[0]}`);

    // List tables
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    console.log(`\n✓ Found ${tables.length} tables:`);
    tables.forEach((t) => console.log(`  - ${t.tablename}`));

    // Count records in key tables
    const userCount = await prisma.user.count();
    const membershipCount = await prisma.membership.count();
    const householdCount = await prisma.household.count();
    const requestCount = await prisma.request.count();

    console.log("\nRecord counts:");
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Memberships: ${membershipCount}`);
    console.log(`  - Households: ${householdCount}`);
    console.log(`  - Requests: ${requestCount}`);

    console.log("\n✓ All checks passed");
  } catch (error) {
    console.error("✗ Database check failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
