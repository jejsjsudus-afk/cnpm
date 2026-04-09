"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { paymentSchema } from "@/lib/schemas";

export async function processPaymentSimulation(invoiceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Không có quyền thực hiện thao tác này." };
  }

  const parsedInput = paymentSchema.safeParse({ invoiceId });
  if (!parsedInput.success) {
    return { error: "Mã hóa đơn không hợp lệ." };
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) return { error: "Không tìm thấy hồ sơ sinh viên" };

    const invoice = await prisma.tuitionInvoice.findFirst({
      where: { id: parsedInput.data.invoiceId, studentId: student.id },
    });

    if (!invoice) return { error: "Không tìm thấy hóa đơn" };
    if (invoice.status === "PAID") return { error: "Hóa đơn này đã được thanh toán" };

    // Simulate payment process (In real world: Redirect to VNPAY/MoMo -> Webhook -> Update DB)
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          method: "VNPAY",
          status: "SUCCESS",
          transactionId: `VNPAY-${randomUUID()}`,
        },
      }),
      prisma.tuitionInvoice.update({
        where: { id: invoice.id },
        data: { status: "PAID" },
      }),
    ]);

    revalidatePath("/dashboard/student/finance");
    return { success: true, message: "Thanh toán thành công qua VNPAY giả lập!" };
  } catch {
    return { error: "Lỗi hệ thống giao dịch." };
  }
}

