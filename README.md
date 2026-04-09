# University SMS

Hệ thống quản lý sinh viên xây bằng `Next.js 16`, `React 19`, `NextAuth` và `Prisma + SQLite`.

## Chức năng hiện có
- Sinh viên: đăng ký học phần, xem thời khóa biểu, điểm, học phí, điểm danh, phúc khảo.
- Giảng viên: quản lý lớp học phần, mở phiên điểm danh, vào điểm, xử lý phúc khảo.
- Đào tạo: quản lý sinh viên, chương trình đào tạo, lịch học.
- Admin: báo cáo, nhật ký hệ thống, cấu hình nền tảng cơ bản.

## Yêu cầu môi trường
- Node.js 20+
- npm

## Cài đặt
```bash
npm install
```

## Biến môi trường
File `.env` tối thiểu:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="local-dev-nextauth-secret-change-me"
```

## Chạy seed
Seed hiện tạo:
- 1 admin
- 1 manager
- 1 lecturer
- 2 student
- 2 course
- 1 semester hiện tại
- 1 lớp học phần mở
- enrollment mẫu
- invoice mẫu

Mật khẩu seed được hash. Giá trị seed mặc định là:

```text
ChangeMe123!
```

Chạy seed:

```bash
npx prisma db push
npx prisma db seed
```

## Chạy local
```bash
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra chất lượng
```bash
npm run lint
npx tsc --noEmit
npm run build
```

Lưu ý: trên môi trường Windows bị khóa tiến trình con, `next build` có thể compile xong rồi dừng ở lỗi `spawn EPERM`. Trong quá trình sửa mã, `tsc --noEmit` và `eslint` đã pass.

## Cấu trúc chính
- `src/app`: App Router pages và server actions
- `src/components`: UI và layout
- `src/lib`: auth, prisma singleton, password hashing, validation schemas
- `prisma/schema.prisma`: schema dữ liệu
- `prisma/seed.ts`: dữ liệu mẫu

## Ghi chú triển khai
- Password không còn lưu plain text cho user mới và seed mới.
- Prisma client đã được gom vào `src/lib/prisma.ts`.
- Các server action quan trọng đã được bổ sung validation và kiểm tra quyền ở phía server.
- Hệ điểm hiện được hiển thị thống nhất theo thang 10.
