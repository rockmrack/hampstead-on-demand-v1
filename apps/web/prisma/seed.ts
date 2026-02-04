import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "alinari.ross@gmail.com" },
    update: {},
    create: {
      email: "alinari.ross@gmail.com",
      name: "Ross Alinari",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // Create member user
  const memberUser = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      email: "member@example.com",
      name: "Demo Member",
      role: "MEMBER",
      emailVerified: new Date(),
    },
  });
  console.log(`Created member user: ${memberUser.email}`);

  // Create ACTIVE membership for member user
  const membership = await prisma.membership.upsert({
    where: { userId: memberUser.id },
    update: { status: "ACTIVE" },
    create: {
      userId: memberUser.id,
      status: "ACTIVE",
      approvedById: adminUser.id,
      approvedAt: new Date(),
    },
  });
  console.log(`Created membership: ${membership.id} (status: ${membership.status})`);

  // Create demo household
  const household = await prisma.household.upsert({
    where: { id: "demo-household" },
    update: {},
    create: {
      id: "demo-household",
      name: "Demo Household",
      primaryUserId: memberUser.id,
    },
  });
  console.log(`Created household: ${household.name}`);

  // Link member to household
  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: household.id,
        userId: memberUser.id,
      },
    },
    update: {},
    create: {
      householdId: household.id,
      userId: memberUser.id,
      role: "OWNER",
      canPay: true,
    },
  });
  console.log(`Linked member to household`);

  // Create demo property in NW3
  const property = await prisma.property.upsert({
    where: { id: "demo-property" },
    update: {},
    create: {
      id: "demo-property",
      householdId: household.id,
      label: "Main Residence",
      address1: "42 Hampstead High Street",
      city: "London",
      postcode: "NW3 1QE",
      borough: "Camden",
    },
  });
  console.log(`Created property: ${property.address1}, ${property.postcode}`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
