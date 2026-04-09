# Tài liệu Cấu trúc Cơ sở dữ liệu

Dưới đây là thông tin chi tiết các bảng trong cơ sở dữ liệu dựa trên schema hiện tại.

## 1. Bảng: User
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID duy nhất (UUID) | Không |
| email | String | Email đăng nhập | Không |
| password | String | Mật khẩu đã mã hóa | Không |
| role | String | Vai trò: STUDENT, LECTURER, ADMIN, MANAGER | Không |
| status | String | Trạng thái: ACTIVE, INACTIVE | Không |
| name | String | Họ và tên | Không |
| createdAt | DateTime | Thời điểm tạo | Không |
| updatedAt | DateTime | Thời điểm cập nhật cuối | Không |

## 2. Bảng: Student
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID duy nhất | Không |
| mssv | String | Mã số sinh viên | Không |
| userId | String | Liên kết tới tài khoản User | Có (User) |
| cohort | String | Khóa học | Không |
| facultyId | String? | ID khoa | Không |
| majorId | String? | ID ngành | Không |
| currentGPA | Float | Điểm trung bình hiện tại | Không |
| totalCredits | Int | Tổng số tín chỉ tích lũy | Không |
| dateOfBirth | DateTime? | Ngày sinh | Không |
| idCardNumber | String? | Số CMND/CCCD | Không |
| address | String? | Địa chỉ liên lạc | Không |
| ethnicity | String? | Dân tộc | Không |
| phone | String? | Số điện thoại | Không |
| isGraduated | Boolean | Trạng thái tốt nghiệp | Không |
| graduationDate | DateTime? | Ngày tốt nghiệp | Không |

## 3. Bảng: Lecturer
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID duy nhất | Không |
| lecturerCode | String | Mã giảng viên | Không |
| userId | String | Liên kết tới tài khoản User | Có (User) |
| facultyId | String? | ID khoa | Không |
| departmentId | String? | ID bộ môn | Không |

## 4. Bảng: AcademicProgram
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID chương trình | Không |
| name | String | Tên chương trình | Không |
| majorId | String? | ID ngành | Không |
| startCohort | String | Khóa áp dụng | Không |

## 5. Bảng: Course
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID môn học | Không |
| code | String | Mã môn học | Không |
| name | String | Tên môn học | Không |
| credits | Int | Số tín chỉ | Không |

## 6. Bảng: CoursePrerequisite
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| courseId | String | ID môn học hiện tại | Có (Course) |
| prerequisiteId | String | ID môn học tiên quyết | Có (Course) |

## 7. Bảng: Semester
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID học kỳ | Không |
| name | String | Tên học kỳ (VD: HK1 2023-2024) | Không |
| startDate | DateTime | Ngày bắt đầu | Không |
| endDate | DateTime | Ngày kết thúc | Không |
| isCurrent | Boolean | Học kỳ hiện tại | Không |
| registrationOpen | Boolean | Trạng thái mở đăng ký | Không |

## 8. Bảng: ClassSection
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID lớp học phần | Không |
| courseId | String | ID môn học | Có (Course) |
| semesterId | String | ID học kỳ | Có (Semester) |
| lecturerId | String | ID giảng viên phụ trách | Có (Lecturer) |
| capacity | Int | Sĩ số tối đa | Không |
| status | String | Trạng thái: OPEN, CLOSED, CANCELLED | Không |

## 9. Bảng: Schedule
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID lịch học | Không |
| classSectionId | String | ID lớp học phần | Có (ClassSection) |
| dayOfWeek | Int | Thứ trong tuần | Không |
| room | String | Phòng học | Không |
| startTime | String | Giờ bắt đầu | Không |
| endTime | String | Giờ kết thúc | Không |
| type | String | Loại: LECTURE, EXAM | Không |

## 10. Bảng: Enrollment
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID đăng ký | Không |
| studentId | String | ID sinh viên | Có (Student) |
| classSectionId | String | ID lớp học phần | Có (ClassSection) |
| status | String | Trạng thái: ENROLLED, DROPPED | Không |

## 11. Bảng: AttendanceSession
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID buổi điểm danh | Không |
| classSectionId | String | ID lớp học phần | Có (ClassSection) |
| date | DateTime | Ngày điểm danh | Không |
| qrCodeToken | String? | Mã QR điểm danh | Không |
| expiresAt | DateTime? | Thời gian hết hạn QR | Không |

## 12. Bảng: AttendanceRecord
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID bản ghi điểm danh | Không |
| sessionId | String | ID buổi điểm danh | Có (AttendanceSession) |
| studentId | String | ID sinh viên | Có (Student) |
| status | String | Trạng thái: PRESENT, ABSENT, LATE | Không |

## 13. Bảng: ScoreSettings
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID cài đặt điểm | Không |
| courseId | String | ID môn học | Có (Course) |
| componentName | String | Tên thành phần điểm (GK, CK...) | Không |
| percentage | Float | Tỉ lệ phần trăm | Không |

## 14. Bảng: Score
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID điểm | Không |
| enrollmentId | String | ID lượt đăng ký | Có (Enrollment) |
| componentId | String | ID thành phần điểm | Có (ScoreSettings) |
| scoreValue | Float? | Giá trị điểm | Không |
| isFinalized | Boolean | Đã chốt điểm chưa | Không |
| updatedAt | DateTime | Ngày cập nhật | Không |

## 15. Bảng: RegradeRequest
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID yêu cầu phúc khảo | Không |
| studentId | String | ID sinh viên | Có (Student) |
| classSectionId | String | ID lớp học phần | Có (ClassSection) |
| componentId | String? | ID thành phần điểm | Có (ScoreSettings) |
| currentScore | Float | Điểm hiện tại | Không |
| requestedScore | Float? | Điểm mong muốn | Không |
| approvedScore | Float? | Điểm sau phê duyệt | Không |
| reason | String | Lý do phúc khảo | Không |
| lecturerComment | String? | Phản hồi của giảng viên | Không |
| status | String | Trạng thái: PENDING, EVALUATING, APPROVED, REJECTED | Không |
| evidenceUrl | String? | Link bằng chứng | Không |
| createdAt | DateTime | Ngày tạo | Không |
| updatedAt | DateTime | Ngày cập nhật | Không |

## 16. Bảng: TuitionInvoice
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID hóa đơn | Không |
| studentId | String | ID sinh viên | Có (Student) |
| semesterId | String | ID học kỳ | Có (Semester) |
| totalAmount | Float | Tổng tiền học phí | Không |
| status | String | Trạng thái: PENDING, PAID, CANCELLED | Không |
| createdAt | DateTime | Ngày tạo | Không |

## 17. Bảng: Payment
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID thanh toán | Không |
| invoiceId | String | ID hóa đơn | Có (TuitionInvoice) |
| amount | Float | Số tiền thanh toán | Không |
| transactionId | String? | Mã giao dịch | Không |
| method | String | Phương thức: VNPAY, CASH, TRANSFER | Không |
| status | String | Trạng thái: SUCCESS, FAILED, PENDING | Không |
| timestamp | DateTime | Thời gian giao dịch | Không |

## 18. Bảng: AuditLog
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID nhật ký | Không |
| userId | String | ID người thực hiện | Không |
| action | String | Hành động: CREATE, UPDATE, DELETE... | Không |
| entity | String | Đối tượng bị tác động | Không |
| oldData | String? | Dữ liệu cũ (JSON) | Không |
| newData | String? | Dữ liệu mới (JSON) | Không |
| ip | String? | Địa chỉ IP | Không |
| timestamp | DateTime | Thời gian ghi nhận | Không |

## 19. Bảng: Notification
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID thông báo | Không |
| title | String | Tiêu đề | Không |
| content | String | Nội dung | Không |
| date | DateTime | Ngày gửi | Không |
| senderId | String | ID người gửi | Có (Lecturer) |
| classSectionId | String? | ID lớp liên quan (nếu có) | Có (ClassSection) |

## 20. Bảng: NotificationRecipient
| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |
| :--- | :--- | :--- | :--- |
| id | String | ID bản ghi người nhận | Không |
| notificationId | String | ID thông báo | Có (Notification) |
| studentId | String | ID sinh viên nhận | Có (Student) |
| isRead | Boolean | Trạng thái đã đọc | Không |
| readAt | DateTime? | Thời điểm đọc | Không |
