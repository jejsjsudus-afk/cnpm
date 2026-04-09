# Code Review - Hạng mục cần chỉnh sửa và hoàn thiện

## Phạm vi review
- Đã rà cấu trúc dự án `src/`, `prisma/`, `scripts/`, cấu hình và các page/action chính.
- Đã chạy:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npx tsc --noEmit`

## Kết luận nhanh
- Dự án đang có lỗi blocking ở mức lint/type/build.
- Có rủi ro bảo mật nghiêm trọng trong xác thực.
- Nhiều luồng nghiệp vụ hiện mới ở mức demo UI, chưa đủ kiểm soát dữ liệu thật.
- Cần thống nhất lại domain GPA/hệ điểm vì logic hiện mâu thuẫn giữa nhiều màn.

## 1. Blocking - phải sửa trước

### 1.1 Build production đang fail vì dùng Google Font online
- File: `src/app/layout.tsx:2`
- Vấn đề: đang dùng `Inter` từ `next/font/google`; build fail khi môi trường không truy cập được Google Fonts.
- Hướng sửa:
  - chuyển sang font local/self-hosted, hoặc
  - thêm phương án fallback không phụ thuộc network khi build CI/CD.

### 1.2 TypeScript fail vì import component không tồn tại
- File: `src/app/dashboard/lecturer/grading/page.tsx:9`
- Vấn đề: import `@/components/ui/select` nhưng repo không có file này.
- Hướng sửa:
  - hoặc tạo `src/components/ui/select.tsx`,
  - hoặc bỏ toàn bộ import/logic liên quan nếu chưa dùng.

### 1.3 TypeScript fail vì `Button` không hỗ trợ `asChild`
- File: `src/app/dashboard/manager/students/[id]/page.tsx:45`
- File liên quan: `src/components/ui/button.tsx`
- Vấn đề: `Button` đang wrap `@base-ui/react/button` nhưng props chưa hỗ trợ `asChild`; trang chi tiết sinh viên đang dùng `asChild`.
- Hướng sửa:
  - bổ sung hỗ trợ `asChild` đúng cách trong button component, hoặc
  - đổi sang render `Link` độc lập với class từ `buttonVariants`.

### 1.4 TypeScript fail vì giá trị có thể `undefined`
- File: `src/app/dashboard/admin/reports/ReportsCharts.tsx:34`
- Vấn đề: callback label của `Pie` dùng `percent` trực tiếp.
- Hướng sửa:
  - thêm guard/fallback cho `percent`,
  - đồng thời thay `any[]` bằng type rõ ràng.

### 1.5 ESLint đang fail ở nhiều file
- Nhóm lỗi chính:
  - `no-explicit-any`
  - `prefer-const`
  - `react/no-unescaped-entities`
  - import thừa / biến thừa
- File nổi bật:
  - `scripts/export-sql.ts`
  - `src/app/dashboard/admin/reports/ReportsCharts.tsx`
  - `src/app/dashboard/lecturer/grading/page.tsx`
  - `src/app/dashboard/manager/programs/CreateCourseForm.tsx`
  - `src/app/dashboard/manager/schedules/CreateSectionForm.tsx`
  - `src/app/dashboard/student/attendance/actions.ts`
  - `src/app/dashboard/student/courses/actions.ts`
  - `src/app/dashboard/student/schedule/page.tsx`
  - `src/app/login/page.tsx`

## 2. Bảo mật - ưu tiên rất cao

### 2.1 Mật khẩu đang lưu và so sánh plain text
- File: `src/lib/auth.ts:22`
- File: `prisma/seed.ts:29`
- File: `src/app/dashboard/manager/students/actions.ts`
- Vấn đề:
  - mật khẩu lưu trực tiếp trong DB,
  - đăng nhập dùng `user.password === credentials.password`,
  - form tạo sinh viên còn default sẵn `password123`.
- Hướng sửa:
  - hash bằng `bcrypt`/`argon2`,
  - so sánh bằng hàm verify,
  - bỏ password mặc định hard-code khỏi UI và seed demo production.

### 2.2 Có fallback secret không an toàn cho NextAuth
- File: `src/lib/auth.ts:56`
- Vấn đề: `NEXTAUTH_SECRET || "fallback-secret-for-demo"`.
- Hướng sửa:
  - bắt buộc có env secret ở mọi môi trường ngoài local demo,
  - fail fast nếu thiếu.

### 2.3 Lộ thông tin tài khoản demo ngay trên màn hình login
- File: `src/app/login/page.tsx:98`
- Vấn đề: email demo + password demo được hiển thị công khai.
- Hướng sửa:
  - chỉ hiển thị ở môi trường demo/dev có cờ cấu hình,
  - tuyệt đối không xuất hiện ở production.

### 2.4 Token điểm danh sinh ngẫu nhiên bằng `Math.random`
- File: `src/app/dashboard/lecturer/classes/actions.ts:45`
- Vấn đề: token ngắn, đoán được, không phù hợp cho luồng xác thực điểm danh.
- Hướng sửa:
  - dùng `crypto.randomUUID()` hoặc token ngắn sinh từ `crypto`,
  - lưu hash token nếu muốn tăng an toàn,
  - rút thời hạn sống xuống ngắn hơn 1 giờ nếu đây là check-in trên lớp.

## 3. Lỗi nghiệp vụ / dữ liệu

### 3.1 Đăng ký học phần chỉ chặn ở UI, chưa chặn ở server
- File: `src/app/dashboard/student/courses/page.tsx:29`
- File: `src/app/dashboard/student/courses/actions.ts:21`
- Vấn đề:
  - page chỉ disable nút khi đầy chỗ,
  - server action vẫn `create` trực tiếp,
  - chưa kiểm tra:
    - lớp còn `OPEN`,
    - còn chỗ,
    - kỳ hiện tại có `registrationOpen`,
    - trùng lịch,
    - môn tiên quyết,
    - sinh viên có đúng role `STUDENT`.
- Hướng sửa:
  - validate đầy đủ trong server action,
  - dùng transaction để kiểm tra sĩ số và insert atomically,
  - trả lỗi nghiệp vụ cụ thể.

### 3.2 Finance action query sai ownership check
- File: `src/app/dashboard/student/finance/actions.ts:21`
- Vấn đề: `findUnique({ where: { id: invoiceId, studentId: student.id } })` không phải cách kiểm tra ownership đúng cho một bản ghi unique theo `id`.
- Hướng sửa:
  - dùng `findFirst({ where: { id: invoiceId, studentId: student.id } })`, hoặc
  - `findUnique({ where: { id } })` rồi kiểm tra `invoice.studentId`.

### 3.3 Finance page có side effect ghi DB ngay khi render
- File: `src/app/dashboard/student/finance/page.tsx`
- Vấn đề: nếu sinh viên chưa có hóa đơn thì page tự tạo hóa đơn trong quá trình render.
- Hướng sửa:
  - chuyển việc tạo hóa đơn sang seed, cron, admin action, hoặc nghiệp vụ phát sinh rõ ràng,
  - server component đọc dữ liệu không nên tự mutate DB.

### 3.4 Demo token điểm danh trong UI không khớp logic thực tế
- File: `src/app/dashboard/student/attendance/page.tsx:63`
- File: `src/app/dashboard/lecturer/classes/actions.ts:45`
- Vấn đề: UI hướng dẫn dùng `DEMO-123`, trong khi token thực tế được sinh theo prefix course + random.
- Hướng sửa:
  - bỏ helper sai,
  - hoặc tạo luồng demo thật đồng nhất.

### 3.5 Hiển thị điểm mong muốn bị sai khi giá trị bằng 0
- File: `src/app/dashboard/lecturer/regrade/page.tsx:93`
- Vấn đề: `req.requestedScore ? ... : "?"` khiến `0` bị coi như không có dữ liệu.
- Hướng sửa:
  - kiểm tra `req.requestedScore !== null && req.requestedScore !== undefined`.

### 3.6 Logic GPA/hệ điểm đang mâu thuẫn toàn hệ thống
- File: `src/app/dashboard/page.tsx`
- File: `src/app/dashboard/student/grades/page.tsx`
- File: `src/app/dashboard/manager/students/page.tsx`
- File: `src/app/dashboard/manager/graduation/page.tsx`
- File: `src/app/dashboard/manager/scholarships/page.tsx`
- File: `src/app/dashboard/admin/reports/page.tsx`
- File: `prisma/seed.ts`
- Vấn đề:
  - `grades/page` ghi "Hệ số 4.0",
  - nhiều màn khác dùng ngưỡng GPA hệ 10 (`>= 8`, `< 5`, `>= 5 để tốt nghiệp`),
  - seed lại cho GPA `3.2`, `2.8`.
- Hướng sửa:
  - chốt một chuẩn duy nhất: hệ 4 hay hệ 10,
  - đồng bộ schema, seed, cảnh báo học vụ, báo cáo, học bổng, xét tốt nghiệp và UI label.

## 4. Kiến trúc / độ ổn định

### 4.1 Tạo `new PrismaClient()` ở rất nhiều file
- Ví dụ:
  - `src/lib/auth.ts:5`
  - `src/app/dashboard/page.tsx:11`
  - hầu hết page/action khác trong `src/app/dashboard/**`
- Vấn đề: dễ gây nhiều kết nối thừa, đặc biệt khi dev hot reload.
- Hướng sửa:
  - tạo `src/lib/prisma.ts` theo singleton pattern,
  - import lại toàn bộ từ một chỗ.

### 4.2 Nhiều route trả `return null` hoặc `<div>Không có quyền truy cập</div>`
- Ví dụ:
  - `src/app/dashboard/page.tsx:20`
  - `src/app/dashboard/profile/page.tsx:26`
  - `src/app/dashboard/lecturer/schedule/page.tsx:24`
- Vấn đề:
  - UX kém,
  - trạng thái lỗi không rõ,
  - không dùng `redirect()` / `notFound()` / empty state thống nhất.
- Hướng sửa:
  - chuẩn hóa xử lý unauthorized, missing profile, missing data.

### 4.3 Chưa có lớp validation đầu vào rõ ràng cho server actions
- File liên quan:
  - `src/app/dashboard/student/courses/actions.ts`
  - `src/app/dashboard/student/attendance/actions.ts`
  - `src/app/dashboard/student/finance/actions.ts`
  - `src/app/dashboard/manager/*/actions.ts`
  - `src/app/dashboard/lecturer/*/actions.ts`
- Vấn đề: input chủ yếu là raw string/number, không validate schema.
- Hướng sửa:
  - dùng `zod` cho toàn bộ server actions,
  - chuẩn hóa response/error.

## 5. Chức năng còn dang dở / placeholder

### 5.1 Sidebar có link chết
- File: `src/components/layout/Sidebar.tsx:138`
- Vấn đề: có menu `/dashboard/admin/settings` nhưng route chưa tồn tại.
- Hướng sửa:
  - tạo route thật,
  - hoặc ẩn menu cho đến khi hoàn thiện.

### 5.2 Admin Users mới có UI, chưa có hành động thật
- File: `src/app/dashboard/admin/users/page.tsx`
- Vấn đề:
  - nút `Cấp tài khoản mới`, `Đổi quyền`, `Khóa` chưa nối action.
- Hướng sửa:
  - thêm server actions + audit log + confirm flow + guard role.

### 5.3 Programs page mới có nút `Sửa` nhưng chưa có flow sửa
- File: `src/app/dashboard/manager/programs/page.tsx`
- Hướng sửa:
  - bổ sung edit course, cập nhật score settings, prerequisite, validation tổng % điểm = 100.

### 5.4 Graduation page mới dừng ở danh sách và nút giả lập
- File: `src/app/dashboard/manager/graduation/page.tsx`
- Vấn đề:
  - `Chạy Thuật toán Xét duyệt` và `Công nhận` chưa có action,
  - logic xét tốt nghiệp đang quá đơn giản.

### 5.5 Scholarships page mới là bảng demo
- File: `src/app/dashboard/manager/scholarships/page.tsx`
- Vấn đề:
  - hard-code khoa `CNTT`,
  - hard-code mức quỹ,
  - nút `Xuất Excel` chưa có action.

## 6. UI/UX và nội dung

### 6.1 Login page còn lỗi lint và một số điểm cần chỉnh
- File: `src/app/login/page.tsx`
- Vấn đề:
  - `react/no-unescaped-entities`,
  - dùng `<img>` thay vì `next/image`,
  - phụ thuộc ảnh remote từ Unsplash,
  - helper demo không phù hợp production.
- Hướng sửa:
  - escape quote đúng chuẩn,
  - cân nhắc ảnh local hoặc cấu hình remote image rõ ràng,
  - tách nội dung demo khỏi bản production.

### 6.2 README vẫn là mặc định của create-next-app
- File: `README.md`
- Vấn đề: không phản ánh cấu trúc, seed, tài khoản, env, schema, luồng role của dự án.
- Hướng sửa:
  - viết lại README theo đúng hệ thống này.

### 6.3 Nhiều cảnh báo import/biến thừa
- Vấn đề: codebase có khá nhiều import không dùng tới.
- Hướng sửa:
  - dọn lint warnings để giảm nhiễu khi review tiếp theo.

## 7. Chuẩn hóa dữ liệu và tính đúng đắn

### 7.1 Cần ràng buộc rõ enum/status thay cho string tự do
- File ảnh hưởng: `prisma/schema.prisma` và toàn bộ page/action
- Vấn đề:
  - `role`, `status`, `method`, `action`, `type` đều đang là `String`.
- Hướng sửa:
  - chuyển sang `enum` trong Prisma cho các tập giá trị cố định.

### 7.2 `prerequisiteIds` đang lưu JSON string
- File: `prisma/schema.prisma`
- Vấn đề: khó query, khó validate, dễ sai dữ liệu.
- Hướng sửa:
  - thiết kế relation bảng phụ cho prerequisite.

### 7.3 Chưa có kiểm tra tổng cơ cấu điểm = 100%
- File liên quan:
  - `src/app/dashboard/manager/programs/actions.ts`
  - `src/app/dashboard/lecturer/grading/page.tsx`
  - `src/app/dashboard/student/grades/page.tsx`
- Vấn đề: code hiện giả định cơ cấu điểm hợp lệ.

## 8. Chất lượng mã / tooling

### 8.1 `scripts/export-sql.ts` còn dùng `any`
- File: `scripts/export-sql.ts`
- Vấn đề: script vẫn chạy theo hướng dynamic nhưng không có typing rõ ràng.
- Hướng sửa:
  - tạo type cho model accessor hoặc ít nhất bó hẹp kiểu thay vì `any`.

### 8.2 Chưa thấy test coverage
- Vấn đề: chưa có test cho auth, enrollment, attendance, grading, finance.
- Hướng sửa:
  - tối thiểu thêm test cho các luồng server action quan trọng.

## 9. Thứ tự triển khai đề xuất
1. Sửa toàn bộ lỗi compile/build/lint blocking.
2. Khóa lại lớp auth: hash password, bỏ fallback secret, bỏ demo credential public.
3. Tạo `lib/prisma.ts` singleton và refactor toàn repo.
4. Siết server-side validation cho enrollment, payment, attendance, regrade.
5. Thống nhất domain GPA/hệ điểm và cập nhật schema/seed/UI.
6. Hoàn thiện các màn đang placeholder: admin users, settings, graduation, scholarships, programs edit.
7. Viết lại README và bổ sung test tối thiểu.

## 10. Ghi chú
- Review này tập trung vào các điểm có thể gây fail build, sai nghiệp vụ, rủi ro bảo mật và phần còn dang dở.
- Một số hạng mục UI nhỏ và warning không blocking đã được gộp lại để ưu tiên phần ảnh hưởng lớn trước.
