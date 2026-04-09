import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const eligible = await prisma.student.findMany({
    where: {
      totalCredits: { gte: 120 },
      currentGPA: { gte: 2.0 },
      isGraduated: false,
      invoices: {
         every: { status: 'PAID' }
      }
    }
  });
  console.log("Eligible:", eligible.length);
  
  const superStudent = await prisma.student.findUnique({
    where: { mssv: '70DCHT_GRAD' },
    include: { invoices: true }
  });
  console.log("SuperStudent:", superStudent);
}
main().finally(() => prisma.$disconnect());
