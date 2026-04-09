"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export async function createUserAccount(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  // Lecturer-specific
  lecturerCode?: string;
  facultyId?: string;
  departmentId?: string;
  // Student-specific
  mssv?: string;
  cohort?: string;
  majorId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Only ADMIN and MANAGER can create accounts
  const callerRole = session.user.role;
  if (callerRole !== "ADMIN" && callerRole !== "MANAGER") {
    return { error: "Bạn không có quyền thực hiện chức năng này." };
  }

  // MANAGER can create MANAGER, LECTURER, and STUDENT (but not ADMIN)
  if (callerRole === "MANAGER" && data.role === "ADMIN") {
    return { error: "Phòng Đào tạo không có quyền cấp tài khoản Quản trị kỹ thuật." };
  }

  try {
    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { error: "Email này đã tồn tại trong hệ thống." };

    const hashedPassword = await hashPassword(data.password);

    if (data.role === "LECTURER") {
      if (!data.lecturerCode) return { error: "Mã giảng viên không được để trống." };

      const existingCode = await prisma.lecturer.findUnique({ where: { lecturerCode: data.lecturerCode } });
      if (existingCode) return { error: "Mã giảng viên đã tồn tại." };

      await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: "LECTURER",
          name: data.name,
          lecturer: {
            create: {
              lecturerCode: data.lecturerCode,
              facultyId: data.facultyId || null,
              departmentId: data.departmentId || null,
            }
          }
        }
      });
    } else if (data.role === "STUDENT") {
      if (!data.mssv) return { error: "MSSV không được để trống." };

      const existingMssv = await prisma.student.findUnique({ where: { mssv: data.mssv } });
      if (existingMssv) return { error: "MSSV đã tồn tại." };

      await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: "STUDENT",
          name: data.name,
          student: {
            create: {
              mssv: data.mssv,
              cohort: data.cohort || "",
              facultyId: data.facultyId || null,
              majorId: data.majorId || null,
            }
          }
        }
      });
    } else {
      // ADMIN or MANAGER
      await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
          name: data.name,
        }
      });
    }

    // Log it
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "USER",
        newData: `Created ${data.role} account: ${data.email}`
      }
    });

    revalidatePath("/dashboard/manager/users");
    revalidatePath("/dashboard/manager/students");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Lỗi hệ thống khi tạo tài khoản." };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return { error: "Không có quyền thực hiện." };
  }

  // Safety check: MANAGER cannot change someone to ADMIN
  if (session.user.role === "MANAGER" && newRole === "ADMIN") {
     return { error: "Bạn không thể gán quyền Quản trị kỹ thuật." };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "USER",
        newData: `Changed role of user ${user.email} to ${newRole}`
      }
    });

    revalidatePath("/dashboard/manager/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Lỗi khi cập nhật quyền." };
  }
}

export async function toggleUserStatus(userId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Người dùng không tồn tại." };

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "USER",
        newData: `${newStatus === "INACTIVE" ? "Locked" : "Unlocked"} user ${user.email}`
      }
    });

    revalidatePath("/dashboard/manager/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Lỗi khi cập nhật trạng thái tài khoản." };
  }
}
