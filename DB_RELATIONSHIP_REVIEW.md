# Rà soát kết nối bảng trong cơ sở dữ liệu

## Kết quả tổng quan
- `prisma/schema.prisma` hợp lệ khi chạy `npx prisma validate`.
- Các quan hệ chính đã được khai báo khá đầy đủ cho luồng user, học phần, điểm danh, điểm số, học phí.
- Có một số điểm cần lưu ý về tính toàn vẹn quan hệ và đồng bộ tài liệu SQL.

## 1. Sơ đồ quan hệ chính

### Nhóm tài khoản
- `User` 1 - 0..1 `Student`
  - khóa: `Student.userId -> User.id`
  - ràng buộc: `@unique`, `onDelete: Cascade`
- `User` 1 - 0..1 `Lecturer`
  - khóa: `Lecturer.userId -> User.id`
  - ràng buộc: `@unique`, `onDelete: Cascade`

Nhận xét:
- Mô hình này đúng nếu mỗi user chỉ là một trong hai vai trò nghiệp vụ `Student` hoặc `Lecturer`.
- `ADMIN` và `MANAGER` hiện không có bảng profile riêng, chỉ nằm ở `User`.

### Nhóm học phần và lớp học phần
- `Course` 1 - n `ClassSection`
  - `ClassSection.courseId -> Course.id`
- `Semester` 1 - n `ClassSection`
  - `ClassSection.semesterId -> Semester.id`
- `Lecturer` 1 - n `ClassSection`
  - `ClassSection.lecturerId -> Lecturer.id`
- `ClassSection` 1 - n `Schedule`
  - `Schedule.classSectionId -> ClassSection.id`
  - `onDelete: Cascade`

Nhận xét:
- Đây là trục quan hệ trung tâm của hệ thống và đang thiết kế hợp lý.
- `Schedule` cascade theo `ClassSection` là đúng.

### Nhóm đăng ký học và điểm
- `Student` n - n `ClassSection` thông qua `Enrollment`
  - `Enrollment.studentId -> Student.id`
  - `Enrollment.classSectionId -> ClassSection.id`
  - unique kép: `@@unique([studentId, classSectionId])`
- `Course` 1 - n `ScoreSettings`
  - `ScoreSettings.courseId -> Course.id`
  - `onDelete: Cascade`
- `Enrollment` 1 - n `Score`
  - `Score.enrollmentId -> Enrollment.id`
  - `onDelete: Cascade`
- `ScoreSettings` 1 - n `Score`
  - `Score.componentId -> ScoreSettings.id`
- unique kép ở `Score`
  - `@@unique([enrollmentId, componentId])`

Nhận xét:
- Mô hình điểm thành phần đang ổn.
- Thiết kế `Score` gắn với `Enrollment` và `ScoreSettings` là đúng.
- Quan hệ này cho phép mỗi sinh viên có đúng một điểm cho mỗi thành phần của mỗi lớp học phần.

### Nhóm điểm danh
- `ClassSection` 1 - n `AttendanceSession`
  - `AttendanceSession.classSectionId -> ClassSection.id`
  - `onDelete: Cascade`
- `AttendanceSession` 1 - n `AttendanceRecord`
  - `AttendanceRecord.sessionId -> AttendanceSession.id`
  - `onDelete: Cascade`
- `Student` 1 - n `AttendanceRecord`
  - `AttendanceRecord.studentId -> Student.id`
- unique kép:
  - `@@unique([sessionId, studentId])`

Nhận xét:
- Thiết kế đúng cho bài toán check-in theo từng buổi học.
- Cascade từ `AttendanceSession` xuống `AttendanceRecord` là hợp lý.

### Nhóm phúc khảo
- `Student` 1 - n `RegradeRequest`
  - `RegradeRequest.studentId -> Student.id`
- `ClassSection` 1 - n `RegradeRequest`
  - `RegradeRequest.classSectionId -> ClassSection.id`
- `ScoreSettings` 1 - n `RegradeRequest`
  - `RegradeRequest.componentId -> ScoreSettings.id`
  - optional

Nhận xét:
- Về mô hình nghiệp vụ, quan hệ này đúng.
- Tuy nhiên cần thêm ràng buộc logic để đảm bảo `componentId` thực sự thuộc `Course` của `ClassSection`.
  - Hiện DB chưa ép được điều này bằng FK đơn giản.
  - Đang phải kiểm tra bằng application logic.

### Nhóm học phí
- `Student` 1 - n `TuitionInvoice`
  - `TuitionInvoice.studentId -> Student.id`
- `Semester` 1 - n `TuitionInvoice`
  - `TuitionInvoice.semesterId -> Semester.id`
- `TuitionInvoice` 1 - n `Payment`
  - `Payment.invoiceId -> TuitionInvoice.id`
  - `onDelete: Cascade`

Nhận xét:
- Thiết kế hợp lý cho hóa đơn và lịch sử thanh toán.
- Nên cân nhắc unique nghiệp vụ kiểu:
  - một sinh viên chỉ có một hóa đơn học phí chính cho một kỳ
  - hoặc thêm `invoiceType` nếu muốn nhiều khoản thu trong cùng kỳ

### Nhóm audit
- `AuditLog.userId` hiện chỉ là string, không có FK đến `User.id`.

Nhận xét:
- Đây là chủ đích có thể chấp nhận nếu muốn giữ log kể cả khi user bị xóa.
- Nếu muốn join thuận tiện hơn, có thể thêm quan hệ tùy chọn hoặc lưu thêm snapshot `email`, `role`.

## 2. Các điểm đang ổn
- `Student.userId` và `Lecturer.userId` đều `@unique`, tránh một user gắn nhiều profile cùng loại.
- Bảng trung gian `Enrollment` có unique kép đúng chuẩn.
- `AttendanceRecord` có unique kép đúng chuẩn.
- `Score` có unique kép đúng chuẩn.
- Cascade đã dùng đúng ở các nhánh phụ thuộc rõ:
  - `User -> Student`
  - `User -> Lecturer`
  - `ClassSection -> Schedule`
  - `ClassSection -> AttendanceSession`
  - `AttendanceSession -> AttendanceRecord`
  - `Course -> ScoreSettings`
  - `Enrollment -> Score`
  - `TuitionInvoice -> Payment`

## 3. Các vấn đề/rủi ro cần chú ý

### 3.1 `schema.sql` đang lệch với `prisma/schema.prisma`
- File `schema.sql` hiện không phản ánh đầy đủ `RegradeRequest`.
- Trong `schema.prisma`, `RegradeRequest` có:
  - `componentId`
  - `component`
  - `approvedScore`
  - `lecturerComment`
- Nhưng trong `schema.sql` đang thiếu các cột/quan hệ này.

Kết luận:
- Nếu `schema.sql` được dùng để export/chia sẻ/tài liệu hóa, nó đang cũ và dễ gây hiểu nhầm.

### 3.2 Thiếu FK từ `AuditLog.userId` sang `User`
- Không sai về mặt thiết kế, nhưng là trade-off.
- Hệ quả:
  - không có đảm bảo referential integrity ở DB,
  - có thể tồn tại `userId` không còn user tương ứng.

### 3.3 `RegradeRequest.componentId` chỉ tham chiếu `ScoreSettings`, chưa bảo đảm đúng course
- Rủi ro logic:
  - có thể tạo đơn phúc khảo cho `componentId` thuộc một môn khác nếu app không kiểm tra.
- Đây là ràng buộc xuyên nhiều bảng:
  - `RegradeRequest.classSection -> Course`
  - `ScoreSettings.courseId -> Course`
- DB hiện không ép trực tiếp được bằng cấu trúc hiện tại.

### 3.4 `Course.prerequisiteIds` là JSON string, không phải relation
- Không phải lỗi FK trực tiếp, nhưng là điểm yếu rõ về mô hình quan hệ.
- Hệ quả:
  - không có foreign key tới `Course.id`,
  - có thể chứa id không tồn tại,
  - khó query và khó đảm bảo toàn vẹn dữ liệu.

### 3.5 Thiếu unique nghiệp vụ cho một số bảng
- `Semester.isCurrent`
  - hiện có thể tồn tại nhiều semester cùng `isCurrent = true`
- `TuitionInvoice`
  - hiện không chặn trường hợp nhiều hóa đơn cùng `studentId + semesterId`
- `AttendanceSession`
  - hiện không chặn nhiều session trùng logic trong cùng buổi nếu app xử lý không chặt

## 4. Đề xuất cải thiện

### Mức nên làm sớm
- Đồng bộ lại `schema.sql` theo `prisma/schema.prisma`.
- Chuyển `role`, `status`, `method`, `type`, `action` sang `enum` Prisma.
- Bổ sung unique nghiệp vụ:
  - `TuitionInvoice(studentId, semesterId)` nếu mô hình chỉ có 1 hóa đơn/kỳ
  - cơ chế đảm bảo chỉ 1 `Semester.isCurrent = true`

### Mức nên refactor
- Tách prerequisite thành bảng quan hệ nhiều-nhiều thay vì `prerequisiteIds` string.
- Cân nhắc thêm bảng profile cho `Manager`/`Admin` nếu sau này có dữ liệu riêng.
- Với `AuditLog`, cân nhắc:
  - giữ nguyên như hiện tại nếu ưu tiên lưu vết lâu dài,
  - hoặc thêm snapshot user metadata để đọc log dễ hơn.

### Mức cần kiểm tra bằng app logic
- Khi tạo `RegradeRequest`, phải xác nhận:
  - `componentId` thuộc `Course` của `ClassSection`
  - sinh viên thực sự có score tương ứng
- Khi tạo `Score`, phải xác nhận:
  - `componentId` thuộc `Course` của `Enrollment.classSection`

## 5. Kết luận
- Quan hệ bảng hiện tại nhìn chung là đúng hướng và đủ dùng cho bản demo/phiên bản đầu.
- Điểm mạnh nhất là các quan hệ học phần, điểm, điểm danh, học phí đã có khung tốt.
- Điểm yếu lớn nhất về mô hình dữ liệu là:
  - `prerequisiteIds` chưa quan hệ hóa
  - `schema.sql` bị lệch schema thật
  - thiếu một số unique/ràng buộc nghiệp vụ ở DB

## 6. File tham chiếu
- Schema chính: `prisma/schema.prisma`
- SQL hiện có: `schema.sql`
