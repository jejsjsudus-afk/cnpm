"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { enrollmentSchema } from "@/lib/schemas";

export async function enrollClass(classSectionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Không có quyền thực hiện thao tác này." };
  }

  const parsedInput = enrollmentSchema.safeParse({ classSectionId });
  if (!parsedInput.success) {
    return { error: "Mã lớp học phần không hợp lệ." };
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) return { error: "Student profile not found" };

  try {
    const section = await prisma.classSection.findUnique({
      where: { id: parsedInput.data.classSectionId },
      include: {
        semester: true,
        schedules: true,
        course: {
          include: {
            prerequisiteLinks: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: "ENROLLED" },
            },
          },
        },
      },
    });

    if (!section || section.status !== "OPEN") {
      return { error: "Lớp học phần này hiện không mở đăng ký." };
    }

    if (!section.semester.registrationOpen) {
      return { error: "Kỳ đăng ký hiện chưa mở." };
    }

    if (section._count.enrollments >= section.capacity) {
      return { error: "Lớp học phần đã đủ sĩ số." };
    }

    const currentEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: "ENROLLED",
      },
      include: {
        classSection: {
          include: {
            course: true,
            schedules: true,
          },
        },
      },
    });

    const hasScheduleConflict = currentEnrollments.some((enrollment) =>
      enrollment.classSection.schedules.some((schedule) =>
        section.schedules.some(
          (candidate) =>
            candidate.dayOfWeek === schedule.dayOfWeek &&
            candidate.startTime < schedule.endTime &&
            schedule.startTime < candidate.endTime,
        ),
      ),
    );

    if (hasScheduleConflict) {
      return { error: "Lớp học phần bị trùng lịch với môn bạn đang học." };
    }

    const prerequisiteIds = section.course.prerequisiteLinks.map((link) => link.prerequisiteId);
    if (prerequisiteIds.length > 0) {
      const completedCourses = new Set(currentEnrollments.map((enrollment) => enrollment.classSection.course.id));
      const missingPrerequisite = prerequisiteIds.some((courseId) => !completedCourses.has(courseId));

      if (missingPrerequisite) {
        return { error: "Bạn chưa đáp ứng môn học tiên quyết." };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.enrollment.create({
        data: {
          studentId: student.id,
          classSectionId: section.id,
          status: "ENROLLED",
        },
      });

      const tuitionFee = section.course.credits * 500000;

      await tx.tuitionInvoice.create({
        data: {
          studentId: student.id,
          semesterId: section.semesterId,
          totalAmount: tuitionFee,
          status: "PENDING",
        },
      });
    });

    revalidatePath("/dashboard/student/courses");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Bạn đã đăng ký lớp học phần này rồi!" };
    }
    return { error: "Lỗi hệ thống khi đăng ký." };
  }
}

