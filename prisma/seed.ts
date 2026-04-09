import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.tuitionInvoice.deleteMany()
  await prisma.regradeRequest.deleteMany()
  await prisma.score.deleteMany()
  await prisma.scoreSettings.deleteMany()
  await prisma.notificationRecipient.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.attendanceSession.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.classSection.deleteMany()
  await prisma.semester.deleteMany()
  await prisma.course.deleteMany()
  await prisma.academicProgram.deleteMany()
  await prisma.student.deleteMany()
  await prisma.lecturer.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const defaultPassword = await hashPassword('ChangeMe123!')

  await prisma.user.create({
    data: {
      email: 'admin@utt.edu.vn',
      password: defaultPassword,
      role: 'ADMIN',
      name: 'System Admin',
    },
  })

  await prisma.user.create({
    data: {
      email: 'manager@utt.edu.vn',
      password: defaultPassword,
      role: 'MANAGER',
      name: 'Phòng Đào Tạo',
    },
  })

  const lecturerUser1 = await prisma.user.create({
    data: {
      email: 'lecturer1@utt.edu.vn',
      password: defaultPassword,
      role: 'LECTURER',
      name: 'Nguyễn Văn Giảng Viên',
      lecturer: {
        create: {
          departmentId: 'CNTT',
          facultyId: 'F_CNTT',
          lecturerCode: 'GV001',
        }
      }
    },
  })

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student1@utt.edu.vn',
      password: defaultPassword,
      role: 'STUDENT',
      name: 'Trần Sinh Viên Một',
      student: {
        create: {
          mssv: '71DCHT20001',
          cohort: '71',
          facultyId: 'F_CNTT',
          majorId: 'M_KHMT',
          currentGPA: 3.2,
          totalCredits: 125,
          dateOfBirth: new Date('2002-05-15'),
          idCardNumber: '001202012345',
          address: 'Hà Nội',
          phone: '0987654321',
        }
      }
    },
  })

  // Đủ tín chỉ (130), GPA đủ (2.8), NHƯNG còn nợ học phí -> Không đủ điều kiện
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student2@utt.edu.vn',
      password: defaultPassword,
      role: 'STUDENT',
      name: 'Lê Sinh Viên Hai',
      student: {
        create: {
          mssv: '71DCHT20002',
          cohort: '71',
          facultyId: 'F_CNTT',
          majorId: 'M_KHMT',
          currentGPA: 2.8,
          totalCredits: 130,
          idCardNumber: '001202054321',
          address: 'Hải Phòng',
        }
      }
    },
  })

  // Không đủ điều kiện do GPA thấp < 2.0
  const studentUser3 = await prisma.user.create({
    data: {
      email: 'student3@utt.edu.vn',
      password: defaultPassword,
      role: 'STUDENT',
      name: 'Phạm Sinh Viên Ba',
      student: {
        create: {
          mssv: '71DCHT20003',
          cohort: '71',
          facultyId: 'F_CNTT',
          majorId: 'M_KHMT',
          currentGPA: 1.8,
          totalCredits: 125,
        }
      }
    },
  })

  // Không đủ điều kiện do thiếu tín chỉ (< 120)
  const studentUser4 = await prisma.user.create({
    data: {
      email: 'student4@utt.edu.vn',
      password: defaultPassword,
      role: 'STUDENT',
      name: 'Hoàng Sinh Viên Bốn',
      student: {
        create: {
          mssv: '71DCHT20004',
          cohort: '71',
          facultyId: 'F_CNTT',
          majorId: 'M_KHMT',
          currentGPA: 3.5,
          totalCredits: 110,
        }
      }
    },
  })

  // Đã tốt nghiệp
  const studentUser5 = await prisma.user.create({
    data: {
      email: 'student5@utt.edu.vn',
      password: defaultPassword,
      role: 'STUDENT',
      name: 'Vũ Sinh Viên Năm',
      student: {
        create: {
          mssv: '70DCHT20005',
          cohort: '70',
          facultyId: 'F_CNTT',
          majorId: 'M_KHMT',
          currentGPA: 3.8,
          totalCredits: 140,
          isGraduated: true,
          graduationDate: new Date('2025-08-15'),
        }
      }
    },
  })

  // 2. Create Courses & Programs
  const course1 = await prisma.course.create({
    data: {
      code: 'INT1050',
      name: 'Nhập môn Lập trình',
      credits: 3,
      scoreSettings: {
        create: [
          { componentName: 'Chuyên cần', percentage: 10 },
          { componentName: 'Giữa kỳ', percentage: 30 },
          { componentName: 'Cuối kỳ', percentage: 60 },
        ]
      }
    }
  })

  const course2 = await prisma.course.create({
    data: {
      code: 'INT2020',
      name: 'Cấu trúc dữ liệu và giải thuật',
      credits: 3,
      scoreSettings: {
        create: [
          { componentName: 'Chuyên cần', percentage: 10 },
          { componentName: 'Giữa kỳ', percentage: 20 },
          { componentName: 'Cuối kỳ', percentage: 70 },
        ]
      }
    }
  })

  await prisma.coursePrerequisite.create({
    data: {
      courseId: course2.id,
      prerequisiteId: course1.id,
    },
  })

  // 3. Create Semester
  const semester = await prisma.semester.create({
    data: {
      name: 'Học kỳ 1 Năm học 2023-2024',
      startDate: new Date('2023-09-05'),
      endDate: new Date('2024-01-15'),
      isCurrent: true,
      registrationOpen: true,
    }
  })

  // 4. Create Class Sections
  const lecturerRecord = await prisma.lecturer.findUnique({ where: { userId: lecturerUser1.id } })
  const student1Record = await prisma.student.findUnique({ where: { userId: studentUser1.id } })
  const student2Record = await prisma.student.findUnique({ where: { userId: studentUser2.id } })

  if(lecturerRecord && student1Record && student2Record) {
      const section1 = await prisma.classSection.create({
        data: {
          courseId: course1.id,
          semesterId: semester.id,
          lecturerId: lecturerRecord.id,
          capacity: 40,
          status: 'OPEN',
          schedules: {
            create: [
              {
                dayOfWeek: 2, // Thứ 2
                room: '301-A2',
                startTime: '07:30',
                endTime: '09:30',
                type: 'LECTURE'
              }
            ]
          }
        }
      })

      // 5. Create Enrollments
      await prisma.enrollment.create({
        data: {
          studentId: student1Record.id,
          classSectionId: section1.id,
          status: 'ENROLLED',
        }
      })

      await prisma.enrollment.create({
        data: {
          studentId: student2Record.id,
          classSectionId: section1.id,
          status: 'ENROLLED',
        }
      })

      await prisma.tuitionInvoice.createMany({
        data: [
          // SV1: Đã đóng học phí -> Quá trình xét duyệt OK
          {
            studentId: student1Record.id,
            semesterId: semester.id,
            totalAmount: 4500000,
            status: 'PAID',
          },
          // SV2: Chưa đóng học phí -> Không đủ điều kiện xét duyệt
          {
            studentId: student2Record.id,
            semesterId: semester.id,
            totalAmount: 4500000,
            status: 'PENDING',
          },
        ],
      })

      const attendanceSession = await prisma.attendanceSession.create({
        data: {
          classSectionId: section1.id,
          date: new Date('2023-09-11T07:30:00Z'),
          qrCodeToken: 'INT-ATTEND',
          expiresAt: new Date('2023-09-11T07:45:00Z'),
        },
      })

      await prisma.attendanceRecord.create({
        data: {
          sessionId: attendanceSession.id,
          studentId: student1Record.id,
          status: 'PRESENT',
        },
      })

      const invoice1 = await prisma.tuitionInvoice.findFirstOrThrow({
        where: { studentId: student1Record.id, semesterId: semester.id },
      })

      await prisma.payment.create({
        data: {
          invoiceId: invoice1.id,
          amount: 4500000,
          transactionId: 'VNPAY-SEED-0001',
          method: 'VNPAY',
          status: 'SUCCESS',
        },
      })

      // 6. Create Mock Notification
      const notification = await prisma.notification.create({
        data: {
          title: "Thông báo lịch nghỉ bù",
          content: "Lớp nghỉ học buổi tới do giảng viên đi công tác. Sẽ học bù vào tuần sau.",
          senderId: lecturerRecord.id,
          classSectionId: section1.id,
        }
      })
      await prisma.notificationRecipient.createMany({
        data: [
          { notificationId: notification.id, studentId: student1Record.id },
          { notificationId: notification.id, studentId: student2Record.id },
        ]
      })

      // ============================================
      // COMPLETE STUDENT FOR GRADUATION TEST
      // ============================================
      const superStudentUser = await prisma.user.create({
        data: {
          email: 'grad_student@utt.edu.vn',
          password: defaultPassword,
          role: 'STUDENT',
          name: 'Nguyễn Đủ Điều Kiện',
          student: {
            create: {
              mssv: '70DCHT_GRAD',
              cohort: '70',
              facultyId: 'F_CNTT',
              majorId: 'M_KHMT',
              currentGPA: 3.5,
              totalCredits: 120, // 40 học phần * 3 tín
            }
          }
        }
      });

      const superStudent = await prisma.student.findUniqueOrThrow({ where: { userId: superStudentUser.id } });

      console.log('Đang tạo 40 học phần và điểm sinh viên...');
      // Create 40 dummy courses dynamically
      for (let i = 1; i <= 40; i++) {
        const dummyCourse = await prisma.course.create({
          data: {
            code: `GRAD${Math.floor(i / 10)}${i % 10}00`, // e.g. GRAD0100
            name: `Học phần bắt buộc ${i}`,
            credits: 3,
            scoreSettings: {
              create: [
                { componentName: 'Chuyên cần', percentage: 10 },
                { componentName: 'Giữa kỳ', percentage: 30 },
                { componentName: 'Cuối kỳ', percentage: 60 },
              ]
            }
          }
        });

        const dummySection = await prisma.classSection.create({
          data: {
            courseId: dummyCourse.id,
            semesterId: semester.id,
            lecturerId: lecturerRecord.id,
            capacity: 50,
            status: 'CLOSED', // Already finished
          }
        });

        // Enroll
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: superStudent.id,
            classSectionId: dummySection.id,
            status: 'ENROLLED',
          }
        });

        const ccSetting = await prisma.scoreSettings.findUnique({
          where: { courseId_componentName: { courseId: dummyCourse.id, componentName: 'Chuyên cần' } }
        });
        const gkSetting = await prisma.scoreSettings.findUnique({
          where: { courseId_componentName: { courseId: dummyCourse.id, componentName: 'Giữa kỳ' } }
        });
        const ckSetting = await prisma.scoreSettings.findUnique({
          where: { courseId_componentName: { courseId: dummyCourse.id, componentName: 'Cuối kỳ' } }
        });

        // Add scores
        if (ccSetting && gkSetting && ckSetting) {
          await prisma.score.createMany({
            data: [
              { enrollmentId: enrollment.id, componentId: ccSetting.id, scoreValue: 10, isFinalized: true },
              { enrollmentId: enrollment.id, componentId: gkSetting.id, scoreValue: 8.5, isFinalized: true },
              { enrollmentId: enrollment.id, componentId: ckSetting.id, scoreValue: 8.0, isFinalized: true },
            ]
          });
        }
      }

      // Add a single massive tuition invoice and pay it so they have no debts
      const megaInvoice = await prisma.tuitionInvoice.create({
        data: {
          studentId: superStudent.id,
          semesterId: semester.id,
          totalAmount: 40 * 3 * 450000, // 40 courses * 3 credits * 450k
          status: 'PAID',
        }
      });

      await prisma.payment.create({
        data: {
          invoiceId: megaInvoice.id,
          amount: megaInvoice.totalAmount,
          transactionId: 'VNPAY-GRAD-TEST',
          method: 'TRANSFER',
          status: 'SUCCESS',
        }
      });

      console.log('Seed data successfully created!');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
