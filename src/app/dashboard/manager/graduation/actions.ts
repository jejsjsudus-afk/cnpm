"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveGraduation(studentId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.student.update({
      where: { id: studentId },
      data: {
        isGraduated: true,
        graduationDate: new Date(),
      },
    });

    revalidatePath("/dashboard/manager/graduation");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi hệ thống khi đánh dấu tốt nghiệp." };
  }
}

export async function autoApproveGraduation() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    // Find eligible students
    const eligibleStudents = await prisma.student.findMany({
      where: {
        totalCredits: { gte: 120 },
        currentGPA: { gte: 2.0 },
        isGraduated: false,
        invoices: {
          every: { status: "PAID" },
        },
      },
      select: { id: true },
    });

    if (eligibleStudents.length === 0) {
      return { success: true, count: 0, message: "Không có sinh viên nào mới thỏa điều kiện." };
    }

    const studentIds = eligibleStudents.map((s) => s.id);

    await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: {
        isGraduated: true,
        graduationDate: new Date(),
      },
    });

    revalidatePath("/dashboard/manager/graduation");
    return { success: true, count: studentIds.length };
  } catch (error) {
    console.error(error);
    return { error: "Lỗi hệ thống khi chạy xét tự động." };
  }
}
