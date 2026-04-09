"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createCourseSchema } from "@/lib/schemas";

export async function createCourse(data: {
  code: string;
  name: string;
  credits: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const parsedInput = createCourseSchema.safeParse(data);
    if (!parsedInput.success) {
      return { error: "Thông tin học phần không hợp lệ." };
    }

    const courseData = parsedInput.data;

    const existingCourse = await prisma.course.findUnique({
      where: { code: courseData.code },
    });
    if (existingCourse) {
      return { error: `Mã học phần "${courseData.code}" đã tồn tại.` };
    }

    await prisma.course.create({
      data: {
        code: courseData.code,
        name: courseData.name,
        credits: courseData.credits,
        scoreSettings: {
          create: [
            { componentName: "Chuyên cần", percentage: 10 },
            { componentName: "Giữa kỳ", percentage: 30 },
            { componentName: "Cuối kỳ", percentage: 60 },
          ],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "COURSE",
        newData: JSON.stringify({ code: courseData.code, name: courseData.name, credits: courseData.credits }),
      },
    });

    revalidatePath("/dashboard/manager/programs");
    return { success: true };
  } catch (error) {
    console.error("Create course error:", error);
    return { error: "Lỗi hệ thống khi tạo học phần." };
  }
}

