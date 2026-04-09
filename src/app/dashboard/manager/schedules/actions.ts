"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createSectionSchema } from "@/lib/schemas";

export async function createClassSectionWithSchedule(data: {
  courseId: string;
  semesterId: string;
  lecturerId: string;
  capacity: number;
  dayOfWeek: number;
  room: string;
  startTime: string;
  endTime: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const parsedInput = createSectionSchema.safeParse(data);
    if (!parsedInput.success) {
      return { error: "Thông tin lớp học phần hoặc lịch học không hợp lệ." };
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const section = await tx.classSection.create({
        data: {
          courseId: parsedInput.data.courseId,
          semesterId: parsedInput.data.semesterId,
          lecturerId: parsedInput.data.lecturerId,
          capacity: parsedInput.data.capacity,
          status: "OPEN",
          schedules: {
            create: {
              dayOfWeek: parsedInput.data.dayOfWeek,
              room: parsedInput.data.room,
              startTime: parsedInput.data.startTime,
              endTime: parsedInput.data.endTime,
              type: "LECTURE",
            },
          },
        },
        include: {
          course: true,
          semester: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE",
          entity: "CLASS_SECTION",
          newData: JSON.stringify({
            sectionId: section.id,
            course: section.course.name,
            semester: section.semester.name,
          }),
        },
      });

      return section;
    });

    revalidatePath("/dashboard/manager/schedules");
    return { success: true };
  } catch (error) {
    console.error("Create section error:", error);
    return { error: "Lỗi hệ thống khi tạo lớp học phần." };
  }
}

export async function getMetadataForScheduling() {
  const [courses, semesters, lecturers] = await Promise.all([
    prisma.course.findMany({ select: { id: true, name: true, code: true } }),
    prisma.semester.findMany({ select: { id: true, name: true } }),
    prisma.lecturer.findMany({ include: { user: { select: { name: true } } } }),
  ]);

  return { courses, semesters, lecturers };
}

export async function updateSectionSchedules(
  sectionId: string,
  schedules: { type: string; dayOfWeek: number; room: string; startTime: string; endTime: string }[]
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    if (!sectionId || !Array.isArray(schedules) || schedules.length === 0) {
      return { error: "Dữ liệu không hợp lệ." };
    }

    await prisma.$transaction(async (tx) => {
      // Xoá tất cả lịch hiện tại của lớp học phần
      await tx.schedule.deleteMany({
        where: { classSectionId: sectionId }
      });

      // Tạo mới bằng schedules được gửi lên
      await tx.classSection.update({
        where: { id: sectionId },
        data: {
          schedules: {
            create: schedules
          }
        }
      });

      // Ghi audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          entity: "SCHEDULE",
          newData: `Updated schedules for section ${sectionId} with ${schedules.length} periods`,
        },
      });
    });

    revalidatePath("/dashboard/manager/schedules");
    revalidatePath("/dashboard/student/schedule"); // make sure student schedule is also revalidated
    return { success: true };
  } catch (error) {
    console.error("Update schedule error:", error);
    return { error: "Lỗi hệ thống khi cập nhật lịch." };
  }
}

