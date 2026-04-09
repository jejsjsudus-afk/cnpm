import { PrismaClient, Prisma } from "@prisma/client";

const defaultPrisma = new PrismaClient();

function convertTo4Scale(score10: number): number {
  if (score10 >= 8.5) return 4.0;
  if (score10 >= 7.0) return 3.0;
  if (score10 >= 5.5) return 2.0;
  if (score10 >= 4.0) return 1.0;
  return 0.0;
}

export async function updateStudentGPA(studentId: string, tx?: Prisma.TransactionClient) {
  const prismaClient = tx || defaultPrisma;

  const student = await prismaClient.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        include: {
          classSection: {
            include: {
              course: {
                include: {
                  scoreSettings: true,
                },
              },
            },
          },
          scores: {
            include: {
              component: true,
            },
          },
        },
      },
    },
  });

  if (!student) return;

  let totalWeightedScore = 0;
  let totalCredits = 0;

  student.enrollments.forEach((enroll) => {
    const settings = enroll.classSection.course.scoreSettings;
    if (settings.length === 0) return;

    let totalScore = 0;
    let hasAllFinalized = true;

    enroll.scores.forEach((score) => {
      if (!score.isFinalized) hasAllFinalized = false;
      const val = score.scoreValue;
      if (val !== null) {
        totalScore += val * (score.component.percentage / 100);
      } else {
        hasAllFinalized = false;
      }
    });

    if (
      hasAllFinalized &&
      enroll.scores.length === settings.length &&
      enroll.scores.length > 0
    ) {
      const credits = enroll.classSection.course.credits;
      const score4 = convertTo4Scale(totalScore);
      totalWeightedScore += score4 * credits;
      totalCredits += credits;
    }
  });

  const currentGPA = totalCredits > 0 ? totalWeightedScore / totalCredits : 0.0;

  await prismaClient.student.update({
    where: { id: studentId },
    data: {
      currentGPA,
      totalCredits,
    },
  });
}
