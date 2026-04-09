import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GraduationClient } from "./GraduationClient";

export default async function ManagerGraduationPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return <div>Không có quyền truy cập</div>;
  }

  // Fetch eligible students
  const eligibleStudents = await prisma.student.findMany({
    where: {
      totalCredits: { gte: 120 },
      currentGPA: { gte: 2.0 },
      isGraduated: false,
      invoices: {
        every: { status: "PAID" },
      },
    },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { currentGPA: 'desc' }
  });

  // Fetch already graduated students
  const graduatedStudents = await prisma.student.findMany({
    where: {
      isGraduated: true,
    },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { graduationDate: 'desc' }
  });

  return (
    <GraduationClient 
      eligibleStudents={eligibleStudents} 
      graduatedStudents={graduatedStudents} 
    />
  );
}
