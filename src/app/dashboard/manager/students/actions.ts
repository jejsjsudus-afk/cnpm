"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createStudentSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/password";

export async function createStudentAccount(data: {
  email: string;
  name: string;
  password: string;
  mssv: string;
  cohort: string;
  facultyId?: string;
  majorId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const parsedInput = createStudentSchema.safeParse(data);
    if (!parsedInput.success) {
      return { error: "Dữ liệu tài khoản sinh viên không hợp lệ." };
    }

    const studentData = parsedInput.data;

    // Check duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email: studentData.email } });
    if (existingEmail) return { error: `Email "${studentData.email}" đã tồn tại trong hệ thống.` };

    const existingMssv = await prisma.student.findUnique({ where: { mssv: studentData.mssv } });
    if (existingMssv) return { error: `MSSV "${studentData.mssv}" đã tồn tại trong hệ thống.` };

    const hashedPassword = await hashPassword(studentData.password);

    await prisma.user.create({
      data: {
        email: studentData.email,
        password: hashedPassword,
        role: "STUDENT",
        name: studentData.name,
        student: {
          create: {
            mssv: studentData.mssv,
            cohort: studentData.cohort,
            facultyId: studentData.facultyId || null,
            majorId: studentData.majorId || null,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "STUDENT",
        newData: JSON.stringify({ email: studentData.email, mssv: studentData.mssv, name: studentData.name }),
      },
    });

    revalidatePath("/dashboard/manager/students");
    return { success: true };
  } catch (error) {
    console.error("Create student error:", error);
    return { error: "Lỗi hệ thống khi tạo tài khoản." };
  }
}

