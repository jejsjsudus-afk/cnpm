import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const section = await prisma.classSection.findFirst();
  if (section) {
    // Check if DEMO-123 already exists
    const existing = await prisma.attendanceSession.findFirst({
        where: { qrCodeToken: "DEMO-123" }
    });
    if (!existing) {
        await prisma.attendanceSession.create({
        data: {
            classSectionId: section.id,
            date: new Date(),
            qrCodeToken: "DEMO-123",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Valid for 24h
        }
        });
        console.log("Created demo session with token: DEMO-123");
    }
  }
}

main().then(() => prisma.$disconnect());
