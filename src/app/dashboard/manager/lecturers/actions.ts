"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createLecturerSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/password";

export async function createLecturerAccount(data: {
  email: string;
  name: string;
  password: string;
  lecturerCode: string;
  facultyId?: string;
  departmentId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const parsedInput = createLecturerSchema.safeParse(data);
    if (!parsedInput.success) {
      return { error: "Dữ liệu tài khoản giảng viên không hợp lệ." };
    }

    const lecturerData = parsedInput.data;

    // Check duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email: lecturerData.email } });
    if (existingEmail) return { error: `Email "${lecturerData.email}" đã tồn tại trong hệ thống.` };

    const existingCode = await prisma.lecturer.findUnique({ where: { lecturerCode: lecturerData.lecturerCode } });
    if (existingCode) return { error: `Mã giảng viên "${lecturerData.lecturerCode}" đã tồn tại trong hệ thống.` };

    const hashedPassword = await hashPassword(lecturerData.password);

    await prisma.user.create({
      data: {
        email: lecturerData.email,
        password: hashedPassword,
        role: "LECTURER",
        name: lecturerData.name,
        lecturer: {
          create: {
            lecturerCode: lecturerData.lecturerCode,
            facultyId: lecturerData.facultyId || null,
            departmentId: lecturerData.departmentId || null,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "LECTURER",
        newData: JSON.stringify({ email: lecturerData.email, lecturerCode: lecturerData.lecturerCode, name: lecturerData.name }),
      },
    });

    revalidatePath("/dashboard/manager/lecturers");
    return { success: true };
  } catch (error) {
    console.error("Create lecturer error:", error);
    return { error: "Lỗi hệ thống khi tạo tài khoản." };
  }
}
