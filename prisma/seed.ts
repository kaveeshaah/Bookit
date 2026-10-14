import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const base = new Date(Date.now() + daysFromNow * 86_400_000);
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(base); // YYYY-MM-DD
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${day}T${hh}:${mm}:00+05:30`);
}

async function main() {
  console.log("Seeding database...");

  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@example.com", password_hash: "placeholder", role: "admin" },
  });
  const nimal = await prisma.user.create({
    data: { name: "Nimal Perera", email: "nimal@example.com", password_hash: "placeholder", role: "member" },
  });
  const sara = await prisma.user.create({
    data: { name: "Sara Fernando", email: "sara@example.com", password_hash: "placeholder", role: "member" },
  });

  const [boardroom, roomA, projector, van] = await Promise.all(
    [
      { name: "Boardroom", type: "room", description: "Large meeting room with a conference table", capacity: 12 },
      { name: "Meeting Room A", type: "room", description: "Small meeting room", capacity: 6 },
      { name: "Portable Projector", type: "equipment", description: "HD projector with HDMI cable", capacity: 1 },
      { name: "Company Van", type: "vehicle", description: "9-seat van for site visits", capacity: 9 },
    ].map((data) => prisma.resource.create({ data })),
  );

  await prisma.reservation.createMany({
    data: [
      // Past booking
      { resource_id: boardroom.id, user_id: nimal.id, title: "Sprint review", start_time: at(-2, 10), end_time: at(-2, 11) },
      // Upcoming bookings
      { resource_id: boardroom.id, user_id: sara.id, title: "Client presentation", start_time: at(1, 9), end_time: at(1, 10, 30) },
      { resource_id: boardroom.id, user_id: nimal.id, title: "Design workshop", start_time: at(1, 14), end_time: at(1, 16) },
      { resource_id: roomA.id, user_id: nimal.id, title: "Team standup", start_time: at(1, 11), end_time: at(1, 12) },
      { resource_id: projector.id, user_id: sara.id, title: "Training session", start_time: at(2, 14), end_time: at(2, 16) },
      { resource_id: van.id, user_id: admin.id, title: "Site visit", start_time: at(3, 8), end_time: at(3, 17) },
      // Cancelled booking overlapping a confirmed one: shows cancelled slots don't block
      { resource_id: boardroom.id, user_id: nimal.id, title: "Cancelled workshop", start_time: at(1, 9, 30), end_time: at(1, 10), status: "cancelled" },
    ],
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());