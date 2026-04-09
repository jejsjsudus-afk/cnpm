"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { verifyPassword, hashPassword } from "@/lib/password";

export async function updateStudentProfile(data: {
  phone: string;
  address: string;
  idCardNumber: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) throw new Error("Student not found");

    await prisma.student.update({
      where: { id: student.id },
      data: {
        phone: data.phone,
        address: data.address,
        idCardNumber: data.idCardNumber
      }
    });

    // Logging
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "STUDENT_PROFILE",
        newData: `Updated phone/address/idCard`
      }
    });

    revalidatePath("/dashboard/student/profile");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile" };
  }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) throw new Error("User not found");

    const isValid = await verifyPassword(data.currentPassword, user.password);
    if (!isValid) throw new Error("Mật khẩu hiện tại không đúng");

    const newHashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHashedPassword }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "USER",
        newData: `Changed password`
      }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to change password" };
  }
}
