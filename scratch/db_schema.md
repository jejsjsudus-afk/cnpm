### Bảng: User

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| email | String |  |
| password | String |  |
| role | String | STUDENT, LECTURER, ADMIN, MANAGER |
| status | String | ACTIVE, INACTIVE |
| name | String |  |
| createdAt | DateTime |  |
| updatedAt | DateTime |  |
| student | Student? |  |
| lecturer | Lecturer? |  |

### Bảng: Student

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| mssv | String |  |
| userId | String |  |
| user | User |  |
| cohort | String |  |
| facultyId | String? |  |
| majorId | String? |  |
| currentGPA | Float |  |
| totalCredits | Int |  |
| dateOfBirth | DateTime? |  |
| idCardNumber | String? |  |
| address | String? |  |
| ethnicity | String? |  |
| phone | String? |  |
| isGraduated | Boolean |  |
| graduationDate | DateTime? |  |
| enrollments | Enrollment[] |  |
| attendance | AttendanceRecord[] |  |
| regradeReqs | RegradeRequest[] |  |
| invoices | TuitionInvoice[] |  |
| notifications | NotificationRecipient[] |  |

### Bảng: Lecturer

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| lecturerCode | String |  |
| userId | String |  |
| user | User |  |
| facultyId | String? |  |
| departmentId | String? |  |
| classSections | ClassSection[] |  |
| sentNotifications | Notification[] |  |

### Bảng: AcademicProgram

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| name | String |  |
| majorId | String? |  |
| startCohort | String |  |

### Bảng: Course

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| code | String |  |
| name | String |  |
| credits | Int |  |
| prerequisiteLinks | CoursePrerequisite[] |  |
| requiredFor | CoursePrerequisite[] |  |
| classSections | ClassSection[] |  |
| scoreSettings | ScoreSettings[] |  |

### Bảng: CoursePrerequisite

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| courseId | String |  |
| prerequisiteId | String |  |
| course | Course |  |
| prerequisite | Course |  |

### Bảng: Semester

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| name | String |  |
| startDate | DateTime |  |
| endDate | DateTime |  |
| isCurrent | Boolean |  |
| registrationOpen | Boolean |  |
| classSections | ClassSection[] |  |
| invoices | TuitionInvoice[] |  |

### Bảng: ClassSection

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| courseId | String |  |
| course | Course |  |
| semesterId | String |  |
| semester | Semester |  |
| lecturerId | String |  |
| lecturer | Lecturer |  |
| capacity | Int |  |
| status | String | OPEN, CLOSED, CANCELLED |
| schedules | Schedule[] |  |
| enrollments | Enrollment[] |  |
| attendanceSessions | AttendanceSession[] |  |
| regradeReqs | RegradeRequest[] |  |
| notifications | Notification[] |  |

### Bảng: Schedule

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| classSectionId | String |  |
| classSection | ClassSection |  |
| dayOfWeek | Int |  |
| room | String |  |
| startTime | String |  |
| endTime | String |  |
| type | String | LECTURE, EXAM |

### Bảng: Enrollment

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| studentId | String |  |
| student | Student |  |
| classSectionId | String |  |
| classSection | ClassSection |  |
| status | String | ENROLLED, DROPPED |
| scores | Score[] |  |

### Bảng: AttendanceSession

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| classSectionId | String |  |
| classSection | ClassSection |  |
| date | DateTime |  |
| qrCodeToken | String? |  |
| expiresAt | DateTime? |  |
| records | AttendanceRecord[] |  |

### Bảng: AttendanceRecord

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| sessionId | String |  |
| session | AttendanceSession |  |
| studentId | String |  |
| student | Student |  |
| status | String | PRESENT, ABSENT, LATE |

### Bảng: ScoreSettings

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| courseId | String |  |
| course | Course |  |
| componentName | String |  |
| percentage | Float |  |
| scores | Score[] |  |
| regradeReqs | RegradeRequest[] |  |

### Bảng: Score

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| enrollmentId | String |  |
| enrollment | Enrollment |  |
| componentId | String |  |
| component | ScoreSettings |  |
| scoreValue | Float? |  |
| isFinalized | Boolean |  |
| updatedAt | DateTime |  |

### Bảng: RegradeRequest

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| studentId | String |  |
| student | Student |  |
| classSectionId | String |  |
| classSection | ClassSection |  |
| componentId | String? |  |
| component | ScoreSettings? |  |
| currentScore | Float |  |
| requestedScore | Float? |  |
| approvedScore | Float? |  |
| reason | String |  |
| lecturerComment | String? |  |
| status | String | PENDING, EVALUATING, APPROVED, REJECTED |
| evidenceUrl | String? |  |
| createdAt | DateTime |  |
| updatedAt | DateTime |  |

### Bảng: TuitionInvoice

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| studentId | String |  |
| student | Student |  |
| semesterId | String |  |
| semester | Semester |  |
| totalAmount | Float |  |
| status | String | PENDING, PAID, CANCELLED |
| createdAt | DateTime |  |
| payments | Payment[] |  |

### Bảng: Payment

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| invoiceId | String |  |
| invoice | TuitionInvoice |  |
| amount | Float |  |
| transactionId | String? |  |
| method | String | VNPAY, CASH, TRANSFER |
| status | String | SUCCESS, FAILED, PENDING |
| timestamp | DateTime |  |

### Bảng: AuditLog

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| userId | String |  |
| action | String | CREATE, UPDATE, DELETE, PUBLISH |
| entity | String | STUDENT, COURSE, CLASS_SECTION, SCORE, REGRADE_REQUEST |
| oldData | String? |  |
| newData | String? |  |
| ip | String? |  |
| timestamp | DateTime |  |

### Bảng: Notification

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| title | String |  |
| content | String |  |
| date | DateTime |  |
| senderId | String |  |
| sender | Lecturer |  |
| classSectionId | String? |  |
| classSection | ClassSection? |  |
| recipients | NotificationRecipient[] |  |

### Bảng: NotificationRecipient

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | String |  |
| notificationId | String |  |
| notification | Notification |  |
| studentId | String |  |
| student | Student |  |
| isRead | Boolean |  |
| readAt | DateTime? |  |

