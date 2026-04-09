import { z } from "zod";

export const enrollmentSchema = z.object({
  classSectionId: z.uuid(),
});

export const attendanceCheckInSchema = z.object({
  token: z.string().trim().min(3).max(64),
});

export const paymentSchema = z.object({
  invoiceId: z.uuid(),
});

export const regradeSubmissionSchema = z.object({
  classSectionId: z.uuid(),
  componentId: z.uuid(),
  currentScore: z.number().min(0).max(10),
  reason: z.string().trim().min(10).max(1000),
  requestedScore: z.number().min(0).max(10).optional(),
});

export const createStudentSchema = z.object({
  email: z.email().trim(),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
  mssv: z.string().trim().min(5).max(20),
  cohort: z.string().trim().min(1).max(20),
  facultyId: z.string().trim().max(50).optional().or(z.literal("")),
  majorId: z.string().trim().max(50).optional().or(z.literal("")),
});

export const createLecturerSchema = z.object({
  email: z.email().trim(),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
  lecturerCode: z.string().trim().min(3).max(20),
  facultyId: z.string().trim().max(50).optional().or(z.literal("")),
  departmentId: z.string().trim().max(50).optional().or(z.literal("")),
});

export const createCourseSchema = z.object({
  code: z.string().trim().min(3).max(20),
  name: z.string().trim().min(2).max(200),
  credits: z.number().int().min(1).max(10),
});

export const createSectionSchema = z
  .object({
    courseId: z.uuid(),
    semesterId: z.uuid(),
    lecturerId: z.uuid(),
    capacity: z.number().int().min(1).max(500),
    dayOfWeek: z.number().int().min(2).max(8),
    room: z.string().trim().min(2).max(50),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Giờ kết thúc phải sau giờ bắt đầu.",
    path: ["endTime"],
  });
