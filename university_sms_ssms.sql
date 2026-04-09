-- University SMS Database Export for SSMS
-- Normalized for compatibility
--
-- INSTRUCTIONS: 
-- 1. Create your database: CREATE DATABASE [university_sms];
-- 2. Select the database: USE [university_sms];
-- 3. Run this script.

SET NOCOUNT ON;
GO

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Student] (
    [id] NVARCHAR(1000) NOT NULL,
    [mssv] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [cohort] NVARCHAR(1000) NOT NULL,
    [facultyId] NVARCHAR(1000),
    [majorId] NVARCHAR(1000),
    [currentGPA] FLOAT(53) NOT NULL CONSTRAINT [Student_currentGPA_df] DEFAULT 0.0,
    [totalCredits] INT NOT NULL CONSTRAINT [Student_totalCredits_df] DEFAULT 0,
    [dateOfBirth] DATETIME2,
    [idCardNumber] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [ethnicity] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    CONSTRAINT [Student_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Student_mssv_key] UNIQUE NONCLUSTERED ([mssv]),
    CONSTRAINT [Student_userId_key] UNIQUE NONCLUSTERED ([userId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Lecturer] (
    [id] NVARCHAR(1000) NOT NULL,
    [lecturerCode] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [facultyId] NVARCHAR(1000),
    [departmentId] NVARCHAR(1000),
    CONSTRAINT [Lecturer_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Lecturer_lecturerCode_key] UNIQUE NONCLUSTERED ([lecturerCode]),
    CONSTRAINT [Lecturer_userId_key] UNIQUE NONCLUSTERED ([userId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[AcademicProgram] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [majorId] NVARCHAR(1000),
    [startCohort] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AcademicProgram_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Course] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [credits] INT NOT NULL,
    CONSTRAINT [Course_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Course_code_key] UNIQUE NONCLUSTERED ([code])
);
GO

-- CreateTable
CREATE TABLE [dbo].[CoursePrerequisite] (
    [courseId] NVARCHAR(1000) NOT NULL,
    [prerequisiteId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [CoursePrerequisite_pkey] PRIMARY KEY CLUSTERED ([courseId],[prerequisiteId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Semester] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [isCurrent] BIT NOT NULL CONSTRAINT [Semester_isCurrent_df] DEFAULT 0,
    [registrationOpen] BIT NOT NULL CONSTRAINT [Semester_registrationOpen_df] DEFAULT 0,
    CONSTRAINT [Semester_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[ClassSection] (
    [id] NVARCHAR(1000) NOT NULL,
    [courseId] NVARCHAR(1000) NOT NULL,
    [semesterId] NVARCHAR(1000) NOT NULL,
    [lecturerId] NVARCHAR(1000) NOT NULL,
    [capacity] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ClassSection_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Schedule] (
    [id] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [dayOfWeek] INT NOT NULL,
    [room] NVARCHAR(1000) NOT NULL,
    [startTime] NVARCHAR(1000) NOT NULL,
    [endTime] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Schedule_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Enrollment] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Enrollment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Enrollment_studentId_classSectionId_key] UNIQUE NONCLUSTERED ([studentId],[classSectionId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[AttendanceSession] (
    [id] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [qrCodeToken] NVARCHAR(1000),
    [expiresAt] DATETIME2,
    CONSTRAINT [AttendanceSession_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[AttendanceRecord] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionId] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AttendanceRecord_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AttendanceRecord_sessionId_studentId_key] UNIQUE NONCLUSTERED ([sessionId],[studentId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[ScoreSettings] (
    [id] NVARCHAR(1000) NOT NULL,
    [courseId] NVARCHAR(1000) NOT NULL,
    [componentName] NVARCHAR(1000) NOT NULL,
    [percentage] FLOAT(53) NOT NULL,
    CONSTRAINT [ScoreSettings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ScoreSettings_courseId_componentName_key] UNIQUE NONCLUSTERED ([courseId],[componentName])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Score] (
    [id] NVARCHAR(1000) NOT NULL,
    [enrollmentId] NVARCHAR(1000) NOT NULL,
    [componentId] NVARCHAR(1000) NOT NULL,
    [scoreValue] FLOAT(53),
    [isFinalized] BIT NOT NULL CONSTRAINT [Score_isFinalized_df] DEFAULT 0,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Score_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Score_enrollmentId_componentId_key] UNIQUE NONCLUSTERED ([enrollmentId],[componentId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[RegradeRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [componentId] NVARCHAR(1000),
    [currentScore] FLOAT(53) NOT NULL,
    [requestedScore] FLOAT(53),
    [approvedScore] FLOAT(53),
    [reason] NVARCHAR(1000) NOT NULL,
    [lecturerComment] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL,
    [evidenceUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RegradeRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RegradeRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[TuitionInvoice] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [semesterId] NVARCHAR(1000) NOT NULL,
    [totalAmount] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TuitionInvoice_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TuitionInvoice_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TuitionInvoice_studentId_semesterId_key] UNIQUE NONCLUSTERED ([studentId],[semesterId])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Payment] (
    [id] NVARCHAR(1000) NOT NULL,
    [invoiceId] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [transactionId] NVARCHAR(1000),
    [method] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [Payment_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Payment_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [entity] NVARCHAR(1000) NOT NULL,
    [oldData] NVARCHAR(1000),
    [newData] NVARCHAR(1000),
    [ip] NVARCHAR(1000),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [AuditLog_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL CONSTRAINT [Notification_date_df] DEFAULT CURRENT_TIMESTAMP,
    [senderId] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000),
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);
GO

-- CreateTable
CREATE TABLE [dbo].[NotificationRecipient] (
    [id] NVARCHAR(1000) NOT NULL,
    [notificationId] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [isRead] BIT NOT NULL CONSTRAINT [NotificationRecipient_isRead_df] DEFAULT 0,
    [readAt] DATETIME2,
    CONSTRAINT [NotificationRecipient_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [NotificationRecipient_notificationId_studentId_key] UNIQUE NONCLUSTERED ([notificationId],[studentId])
);
GO

-- AddForeignKey
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [Student_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Lecturer] ADD CONSTRAINT [Lecturer_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[CoursePrerequisite] ADD CONSTRAINT [CoursePrerequisite_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[CoursePrerequisite] ADD CONSTRAINT [CoursePrerequisite_prerequisiteId_fkey] FOREIGN KEY ([prerequisiteId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[ClassSection] ADD CONSTRAINT [ClassSection_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[ClassSection] ADD CONSTRAINT [ClassSection_semesterId_fkey] FOREIGN KEY ([semesterId]) REFERENCES [dbo].[Semester]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[ClassSection] ADD CONSTRAINT [ClassSection_lecturerId_fkey] FOREIGN KEY ([lecturerId]) REFERENCES [dbo].[Lecturer]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceSession] ADD CONSTRAINT [AttendanceSession_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceRecord] ADD CONSTRAINT [AttendanceRecord_sessionId_fkey] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[AttendanceSession]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceRecord] ADD CONSTRAINT [AttendanceRecord_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[ScoreSettings] ADD CONSTRAINT [ScoreSettings_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[Enrollment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_componentId_fkey] FOREIGN KEY ([componentId]) REFERENCES [dbo].[ScoreSettings]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[RegradeRequest] ADD CONSTRAINT [RegradeRequest_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[RegradeRequest] ADD CONSTRAINT [RegradeRequest_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[RegradeRequest] ADD CONSTRAINT [RegradeRequest_componentId_fkey] FOREIGN KEY ([componentId]) REFERENCES [dbo].[ScoreSettings]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[TuitionInvoice] ADD CONSTRAINT [TuitionInvoice_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[TuitionInvoice] ADD CONSTRAINT [TuitionInvoice_semesterId_fkey] FOREIGN KEY ([semesterId]) REFERENCES [dbo].[Semester]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_invoiceId_fkey] FOREIGN KEY ([invoiceId]) REFERENCES [dbo].[TuitionInvoice]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_senderId_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[Lecturer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- AddForeignKey
ALTER TABLE [dbo].[NotificationRecipient] ADD CONSTRAINT [NotificationRecipient_notificationId_fkey] FOREIGN KEY ([notificationId]) REFERENCES [dbo].[Notification]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- AddForeignKey
ALTER TABLE [dbo].[NotificationRecipient] ADD CONSTRAINT [NotificationRecipient_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
/* DATA DUMP */

/* Data for table [dbo].[User] */
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'30cb14fd-8015-40e6-a275-edd4e9ff0fc3', N'admin@utt.edu.vn', N'scrypt:946d206a48405f1abe23ffa05018e9f8:be10ca31a9a6ccc82bd831d0da3cb55716ef68bc9a68a91eb6cf4bdf090e3828b4d0f6e50d8c353f3fe686dec619e41d4b9fcd888ac2a128fe94573892b7d268', N'ADMIN', N'System Admin', '2026-04-08T03:11:37.159Z', '2026-04-08T03:11:37.159Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'manager@utt.edu.vn', N'scrypt:946d206a48405f1abe23ffa05018e9f8:be10ca31a9a6ccc82bd831d0da3cb55716ef68bc9a68a91eb6cf4bdf090e3828b4d0f6e50d8c353f3fe686dec619e41d4b9fcd888ac2a128fe94573892b7d268', N'MANAGER', N'Phòng Đào Tạo', '2026-04-08T03:11:37.163Z', '2026-04-08T03:11:37.163Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'lecturer1@utt.edu.vn', N'scrypt:946d206a48405f1abe23ffa05018e9f8:be10ca31a9a6ccc82bd831d0da3cb55716ef68bc9a68a91eb6cf4bdf090e3828b4d0f6e50d8c353f3fe686dec619e41d4b9fcd888ac2a128fe94573892b7d268', N'LECTURER', N'Nguyễn Văn Giảng Viên', '2026-04-08T03:11:37.167Z', '2026-04-08T03:11:37.167Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'a21c3f91-6f5b-40f1-810e-932e06627231', N'student1@utt.edu.vn', N'scrypt:946d206a48405f1abe23ffa05018e9f8:be10ca31a9a6ccc82bd831d0da3cb55716ef68bc9a68a91eb6cf4bdf090e3828b4d0f6e50d8c353f3fe686dec619e41d4b9fcd888ac2a128fe94573892b7d268', N'STUDENT', N'Trần Sinh Viên Một', '2026-04-08T03:11:37.171Z', '2026-04-08T03:11:37.171Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'683bef8c-51fa-4e7b-b919-8738f9c510c7', N'student2@utt.edu.vn', N'scrypt:946d206a48405f1abe23ffa05018e9f8:be10ca31a9a6ccc82bd831d0da3cb55716ef68bc9a68a91eb6cf4bdf090e3828b4d0f6e50d8c353f3fe686dec619e41d4b9fcd888ac2a128fe94573892b7d268', N'STUDENT', N'Lê Sinh Viên Hai', '2026-04-08T03:11:37.176Z', '2026-04-08T03:11:37.176Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'853fc109-8c36-44d7-a783-5d5c6262820f', N'GV2@utt.edu.vn', N'scrypt:6ab123707ea572a02300f10e45d0f6ac:a9e6950c438749a11c7c89cce4d1b8aa9b44a004efb9e85181f488823548a40b3f18a8dcf021ab692b8ae70c26bc07e9a1611c7a17ec2cf660f2b8866b29cd00', N'LECTURER', N'ABCD', '2026-04-08T04:20:58.204Z', '2026-04-08T04:20:58.204Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'16676c25-0629-4cab-a854-ac4e00db989c', N'jejsjsudus@gmail.com', N'scrypt:3b7bf743bf59e7631642e600232c9b96:ac091cab24299b5cce96277e1fb9d08e85e907bb78f3e7c9fb397f983c3016d417ef2cb92a345c201c9e25dbae73dc05ad8a30d9f8c9120f720afb8a18a9da6e', N'LECTURER', N'Nguyễn Văn B', '2026-04-08T04:24:33.271Z', '2026-04-08T04:24:33.271Z');
INSERT INTO [dbo].[User] ([id], [email], [password], [role], [name], [createdAt], [updatedAt]) VALUES (N'08cd5cd7-fedd-4a91-b985-129db4fcf382', N'kien@utt.edu.vn', N'scrypt:5d7f98c90556ce33227310e806b0e831:b9f25a5beae9bc8b2bc865d2d44d5f0f5c6224ae59edabd5f81ed4e3893376f51d01f43ba906827e0d10094fd782a508d106426bacbb7255c92c293a069c283c', N'STUDENT', N'ĐàmQuangKien', '2026-04-08T04:39:04.992Z', '2026-04-08T04:39:04.992Z');
GO

/* Data for table [dbo].[Student] */
INSERT INTO [dbo].[Student] ([id], [mssv], [userId], [cohort], [facultyId], [majorId], [currentGPA], [totalCredits], [dateOfBirth], [idCardNumber], [address], [ethnicity], [phone]) VALUES (N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'71DCHT20001', N'a21c3f91-6f5b-40f1-810e-932e06627231', N'71', N'F_CNTT', N'M_KHMT', 2, 3, '2002-05-15T00:00:00.000Z', N'001202012345', N'Hà Nội', NULL, N'09876543212');
INSERT INTO [dbo].[Student] ([id], [mssv], [userId], [cohort], [facultyId], [majorId], [currentGPA], [totalCredits], [dateOfBirth], [idCardNumber], [address], [ethnicity], [phone]) VALUES (N'76b49b68-b4ed-44c1-a131-8c37efe8cdbd', N'71DCHT20002', N'683bef8c-51fa-4e7b-b919-8738f9c510c7', N'71', N'F_CNTT', N'M_KHMT', 7.1, 45, NULL, N'001202054321', N'Hải Phòng', NULL, NULL);
INSERT INTO [dbo].[Student] ([id], [mssv], [userId], [cohort], [facultyId], [majorId], [currentGPA], [totalCredits], [dateOfBirth], [idCardNumber], [address], [ethnicity], [phone]) VALUES (N'd174d405-9c2f-424d-b5cd-ee11ea20e447', N'74DCHT22150', N'08cd5cd7-fedd-4a91-b985-129db4fcf382', N'73', N'F_CNTT', N'M_HTTT', 2, 3, NULL, NULL, NULL, NULL, NULL);
GO

/* Data for table [dbo].[Lecturer] */
INSERT INTO [dbo].[Lecturer] ([id], [lecturerCode], [userId], [facultyId], [departmentId]) VALUES (N'87cf8b77-00d6-4d72-b0a0-6b9ef9495b1e', N'GV001', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'F_CNTT', N'CNTT');
INSERT INTO [dbo].[Lecturer] ([id], [lecturerCode], [userId], [facultyId], [departmentId]) VALUES (N'f480faea-d0f3-4f13-bef0-61ddef7ae674', N'GV003', N'853fc109-8c36-44d7-a783-5d5c6262820f', N'F_KTCK', N'KTCK');
INSERT INTO [dbo].[Lecturer] ([id], [lecturerCode], [userId], [facultyId], [departmentId]) VALUES (N'a7174448-77ff-4539-8dda-4d123b922c3f', N'GV005', N'16676c25-0629-4cab-a854-ac4e00db989c', N'F_CNTT', N'CNTT');
GO

/* Data for table [dbo].[Course] */
INSERT INTO [dbo].[Course] ([id], [code], [name], [credits]) VALUES (N'ebf9a432-1106-44e9-989e-6b8e9b787f5d', N'INT1050', N'Nhập môn Lập trình', 3);
INSERT INTO [dbo].[Course] ([id], [code], [name], [credits]) VALUES (N'1cc452aa-f123-4d83-a12d-666dffba2adc', N'INT2020', N'Cấu trúc dữ liệu và giải thuật', 3);
INSERT INTO [dbo].[Course] ([id], [code], [name], [credits]) VALUES (N'841f26b2-aa35-4cd6-950a-8cfe39a42ce7', N'ACD', N'JAVA', 3);
INSERT INTO [dbo].[Course] ([id], [code], [name], [credits]) VALUES (N'143106be-14bc-4716-8c4e-fb94ca811a74', N'AAAA', N'aaa', 3);
GO

/* Data for table [dbo].[CoursePrerequisite] */
INSERT INTO [dbo].[CoursePrerequisite] ([courseId], [prerequisiteId]) VALUES (N'1cc452aa-f123-4d83-a12d-666dffba2adc', N'ebf9a432-1106-44e9-989e-6b8e9b787f5d');
GO

/* Data for table [dbo].[Semester] */
INSERT INTO [dbo].[Semester] ([id], [name], [startDate], [endDate], [isCurrent], [registrationOpen]) VALUES (N'656a2145-a92a-4b40-a9c7-81639e2f68b3', N'Học kỳ 1 Năm học 2023-2024', '2023-09-05T00:00:00.000Z', '2024-01-15T00:00:00.000Z', 1, 1);
GO

/* Data for table [dbo].[ClassSection] */
INSERT INTO [dbo].[ClassSection] ([id], [courseId], [semesterId], [lecturerId], [capacity], [status]) VALUES (N'32dd9b90-31fc-4f24-8c8e-5a1329043559', N'ebf9a432-1106-44e9-989e-6b8e9b787f5d', N'656a2145-a92a-4b40-a9c7-81639e2f68b3', N'87cf8b77-00d6-4d72-b0a0-6b9ef9495b1e', 40, N'OPEN');
INSERT INTO [dbo].[ClassSection] ([id], [courseId], [semesterId], [lecturerId], [capacity], [status]) VALUES (N'16cd74e5-ad76-4381-8820-a80b084b17f9', N'841f26b2-aa35-4cd6-950a-8cfe39a42ce7', N'656a2145-a92a-4b40-a9c7-81639e2f68b3', N'f480faea-d0f3-4f13-bef0-61ddef7ae674', 60, N'OPEN');
INSERT INTO [dbo].[ClassSection] ([id], [courseId], [semesterId], [lecturerId], [capacity], [status]) VALUES (N'37c225a3-5805-4ca6-a526-526872fda84e', N'143106be-14bc-4716-8c4e-fb94ca811a74', N'656a2145-a92a-4b40-a9c7-81639e2f68b3', N'a7174448-77ff-4539-8dda-4d123b922c3f', 60, N'OPEN');
GO

/* Data for table [dbo].[Schedule] */
INSERT INTO [dbo].[Schedule] ([id], [classSectionId], [dayOfWeek], [room], [startTime], [endTime], [type]) VALUES (N'20e38802-2a96-4ef5-b3fa-f13e1588bc01', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', 2, N'301-A2', N'07:30', N'09:30', N'LECTURE');
INSERT INTO [dbo].[Schedule] ([id], [classSectionId], [dayOfWeek], [room], [startTime], [endTime], [type]) VALUES (N'7c10d7a6-c90c-4462-945d-9181138e6be8', N'16cd74e5-ad76-4381-8820-a80b084b17f9', 3, N'P303A3', N'07:30', N'09:30', N'LECTURE');
INSERT INTO [dbo].[Schedule] ([id], [classSectionId], [dayOfWeek], [room], [startTime], [endTime], [type]) VALUES (N'2e7b9484-25fc-4ae0-bc31-3f78273fff16', N'37c225a3-5805-4ca6-a526-526872fda84e', 3, N'P303A5', N'07:30', N'09:30', N'LECTURE');
GO

/* Data for table [dbo].[Enrollment] */
INSERT INTO [dbo].[Enrollment] ([id], [studentId], [classSectionId], [status]) VALUES (N'abf22969-ae87-47c4-bda8-00e7fff811f0', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', N'ENROLLED');
INSERT INTO [dbo].[Enrollment] ([id], [studentId], [classSectionId], [status]) VALUES (N'943e9bfb-dc8f-4591-baf1-018cb5e55994', N'76b49b68-b4ed-44c1-a131-8c37efe8cdbd', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', N'ENROLLED');
INSERT INTO [dbo].[Enrollment] ([id], [studentId], [classSectionId], [status]) VALUES (N'6aa694a0-2bda-4b9b-a294-02ff053c66e4', N'd174d405-9c2f-424d-b5cd-ee11ea20e447', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', N'ENROLLED');
INSERT INTO [dbo].[Enrollment] ([id], [studentId], [classSectionId], [status]) VALUES (N'a72b452b-abde-4394-a843-f738b6b58b63', N'd174d405-9c2f-424d-b5cd-ee11ea20e447', N'16cd74e5-ad76-4381-8820-a80b084b17f9', N'ENROLLED');
INSERT INTO [dbo].[Enrollment] ([id], [studentId], [classSectionId], [status]) VALUES (N'c79a7653-5752-42f2-81a9-be1dd24cbbc9', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'16cd74e5-ad76-4381-8820-a80b084b17f9', N'ENROLLED');
GO

/* Data for table [dbo].[AttendanceSession] */
INSERT INTO [dbo].[AttendanceSession] ([id], [classSectionId], [date], [qrCodeToken], [expiresAt]) VALUES (N'be7ae31c-cc15-4ccc-9a65-628db1a59f83', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', '2023-09-11T07:30:00.000Z', N'INT-ATTEND', '2023-09-11T07:45:00.000Z');
INSERT INTO [dbo].[AttendanceSession] ([id], [classSectionId], [date], [qrCodeToken], [expiresAt]) VALUES (N'eee0b742-1937-46a9-9be2-1eb0e2782220', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', '2026-04-08T03:30:06.697Z', N'ABC', '2026-04-08T03:45:06.697Z');
GO

/* Data for table [dbo].[AttendanceRecord] */
INSERT INTO [dbo].[AttendanceRecord] ([id], [sessionId], [studentId], [status]) VALUES (N'8d515ee2-7057-4f83-851c-427d8b817e5f', N'be7ae31c-cc15-4ccc-9a65-628db1a59f83', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'PRESENT');
INSERT INTO [dbo].[AttendanceRecord] ([id], [sessionId], [studentId], [status]) VALUES (N'7a2d3a0d-e81b-45af-8aee-a16d489ee465', N'eee0b742-1937-46a9-9be2-1eb0e2782220', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'PRESENT');
GO

/* Data for table [dbo].[ScoreSettings] */
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'45b8d240-7cea-448e-8107-06e5af15c66a', N'ebf9a432-1106-44e9-989e-6b8e9b787f5d', N'Chuyên cần', 10);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'67e25a70-1384-4065-b2ca-e05808140113', N'ebf9a432-1106-44e9-989e-6b8e9b787f5d', N'Giữa kỳ', 30);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'03dc9de8-3160-463a-9831-10b07ae2875f', N'ebf9a432-1106-44e9-989e-6b8e9b787f5d', N'Cuối kỳ', 60);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'41ec8f47-944d-4f44-8a69-6b11f23f31e2', N'1cc452aa-f123-4d83-a12d-666dffba2adc', N'Chuyên cần', 10);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'87c220c2-4850-4f35-ae50-932e9563be2f', N'1cc452aa-f123-4d83-a12d-666dffba2adc', N'Giữa kỳ', 20);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'907203c4-afe1-45bc-a92b-46fb131f36a4', N'1cc452aa-f123-4d83-a12d-666dffba2adc', N'Cuối kỳ', 70);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'5d26dafb-621e-4041-b497-4c49cdfc5c5a', N'841f26b2-aa35-4cd6-950a-8cfe39a42ce7', N'Chuyên cần', 10);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'26b21d16-51ef-4b3e-978d-2f689b979206', N'841f26b2-aa35-4cd6-950a-8cfe39a42ce7', N'Giữa kỳ', 30);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'7a203d75-5fcf-47d6-bc6a-211ccd64facb', N'841f26b2-aa35-4cd6-950a-8cfe39a42ce7', N'Cuối kỳ', 60);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'2ce78a26-ac86-4b36-bbe6-dedf82dd375c', N'143106be-14bc-4716-8c4e-fb94ca811a74', N'Chuyên cần', 10);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'8612aa34-a834-4db2-8258-423ed664d72f', N'143106be-14bc-4716-8c4e-fb94ca811a74', N'Giữa kỳ', 30);
INSERT INTO [dbo].[ScoreSettings] ([id], [courseId], [componentName], [percentage]) VALUES (N'366ecf63-a805-4b66-b0ab-53d9c2bc1a26', N'143106be-14bc-4716-8c4e-fb94ca811a74', N'Cuối kỳ', 60);
GO

/* Data for table [dbo].[Score] */
INSERT INTO [dbo].[Score] ([id], [enrollmentId], [componentId], [scoreValue], [isFinalized], [updatedAt]) VALUES (N'896821dc-6680-413a-89f8-48501751ddfc', N'abf22969-ae87-47c4-bda8-00e7fff811f0', N'45b8d240-7cea-448e-8107-06e5af15c66a', 6, 1, '2026-04-08T03:39:21.915Z');
INSERT INTO [dbo].[Score] ([id], [enrollmentId], [componentId], [scoreValue], [isFinalized], [updatedAt]) VALUES (N'4a36bf66-c79e-4dcd-8e4f-d68c94a55014', N'abf22969-ae87-47c4-bda8-00e7fff811f0', N'03dc9de8-3160-463a-9831-10b07ae2875f', 6, 1, '2026-04-08T03:29:49.643Z');
INSERT INTO [dbo].[Score] ([id], [enrollmentId], [componentId], [scoreValue], [isFinalized], [updatedAt]) VALUES (N'28634bbd-142f-4b6c-bd92-7732ef65014f', N'abf22969-ae87-47c4-bda8-00e7fff811f0', N'67e25a70-1384-4065-b2ca-e05808140113', 7, 1, '2026-04-08T03:29:04.688Z');
INSERT INTO [dbo].[Score] ([id], [enrollmentId], [componentId], [scoreValue], [isFinalized], [updatedAt]) VALUES (N'3003210f-29d6-48b1-826d-c7cfb398e0e5', N'6aa694a0-2bda-4b9b-a294-02ff053c66e4', N'03dc9de8-3160-463a-9831-10b07ae2875f', 6, 1, '2026-04-08T04:56:43.491Z');
INSERT INTO [dbo].[Score] ([id], [enrollmentId], [componentId], [scoreValue], [isFinalized], [updatedAt]) VALUES (N'c9877e63-1e39-40a0-8693-673541d1365e', N'6aa694a0-2bda-4b9b-a294-02ff053c66e4', N'67e25a70-1384-4065-b2ca-e05808140113', 7, 1, '2026-04-08T04:56:46.041Z');
INSERT INTO [dbo].[Score] ([id], [enrollmentId], [componentId], [scoreValue], [isFinalized], [updatedAt]) VALUES (N'68561506-12c7-460b-9239-74c1ea16e7b9', N'6aa694a0-2bda-4b9b-a294-02ff053c66e4', N'45b8d240-7cea-448e-8107-06e5af15c66a', 5, 1, '2026-04-08T04:56:46.850Z');
GO

/* Data for table [dbo].[RegradeRequest] */
INSERT INTO [dbo].[RegradeRequest] ([id], [studentId], [classSectionId], [componentId], [currentScore], [requestedScore], [approvedScore], [reason], [lecturerComment], [status], [evidenceUrl], [createdAt], [updatedAt]) VALUES (N'062bcb0e-0a01-46ed-be57-390f8a6f3014', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'32dd9b90-31fc-4f24-8c8e-5a1329043559', N'45b8d240-7cea-448e-8107-06e5af15c66a', 5, 8, 6, N'em muốn thầy xem xet lại', N'ok', N'APPROVED', NULL, '2026-04-08T03:38:53.529Z', '2026-04-08T03:39:21.915Z');
GO

/* Data for table [dbo].[TuitionInvoice] */
INSERT INTO [dbo].[TuitionInvoice] ([id], [studentId], [semesterId], [totalAmount], [status], [createdAt]) VALUES (N'edcdc93f-a64e-4f3b-9403-6c920ad46505', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', N'656a2145-a92a-4b40-a9c7-81639e2f68b3', 6000000, N'PENDING', '2026-04-08T03:11:37.213Z');
INSERT INTO [dbo].[TuitionInvoice] ([id], [studentId], [semesterId], [totalAmount], [status], [createdAt]) VALUES (N'4adbdf9c-60db-477d-8773-ae9ead5008db', N'76b49b68-b4ed-44c1-a131-8c37efe8cdbd', N'656a2145-a92a-4b40-a9c7-81639e2f68b3', 4500000, N'PAID', '2026-04-08T03:11:37.213Z');
INSERT INTO [dbo].[TuitionInvoice] ([id], [studentId], [semesterId], [totalAmount], [status], [createdAt]) VALUES (N'9cf696a6-04eb-4387-bc62-77b0e80bf675', N'd174d405-9c2f-424d-b5cd-ee11ea20e447', N'656a2145-a92a-4b40-a9c7-81639e2f68b3', 3000000, N'PAID', '2026-04-08T04:39:36.318Z');
GO

/* Data for table [dbo].[Payment] */
INSERT INTO [dbo].[Payment] ([id], [invoiceId], [amount], [transactionId], [method], [status], [timestamp]) VALUES (N'7c97982f-3ff4-46f8-afc1-b8463023821b', N'4adbdf9c-60db-477d-8773-ae9ead5008db', 4500000, N'VNPAY-SEED-0001', N'VNPAY', N'SUCCESS', '2026-04-08T03:11:37.229Z');
INSERT INTO [dbo].[Payment] ([id], [invoiceId], [amount], [transactionId], [method], [status], [timestamp]) VALUES (N'0e036875-c83d-4d96-a076-92f242ef97b3', N'edcdc93f-a64e-4f3b-9403-6c920ad46505', 4500000, N'VNPAY-345f35d6-9e24-4ac2-972d-2fdb9c759bd6', N'VNPAY', N'SUCCESS', '2026-04-08T03:28:06.392Z');
INSERT INTO [dbo].[Payment] ([id], [invoiceId], [amount], [transactionId], [method], [status], [timestamp]) VALUES (N'6f772882-210e-44db-9164-cdc1bbddcf0b', N'9cf696a6-04eb-4387-bc62-77b0e80bf675', 3000000, N'VNPAY-197b2e6e-617e-46aa-adc3-fece5509831e', N'VNPAY', N'SUCCESS', '2026-04-08T05:01:43.594Z');
GO

/* Data for table [dbo].[AuditLog] */
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'c01db232-a2a5-4b71-b975-704f2943b0fe', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'CREATE', N'NOTIFICATION', NULL, N'Created notification for class 32dd9b90-31fc-4f24-8c8e-5a1329043559: Nghỉ học', NULL, '2026-04-08T03:28:37.202Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'8fbc4d63-a22b-4dd9-9bd2-756dc545a56a', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 5, "final": true}', NULL, '2026-04-08T03:28:57.261Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'bd98ac4b-989a-4729-af39-c3991d946ff0', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 6, "final": false}', NULL, '2026-04-08T03:29:00.860Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'31ab2d2a-44a3-4278-a6b8-d983bbfbb7da', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 7, "final": true}', NULL, '2026-04-08T03:29:04.691Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'838e0589-4369-4713-988f-3da61afd701b', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 6, "final": true}', NULL, '2026-04-08T03:29:49.646Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'37527ea4-ecb5-4ffc-aafb-705995c43a0a', N'a21c3f91-6f5b-40f1-810e-932e06627231', N'CREATE', N'REGRADE_REQUEST', NULL, N'{"classSectionId":"32dd9b90-31fc-4f24-8c8e-5a1329043559","componentId":"45b8d240-7cea-448e-8107-06e5af15c66a","currentScore":5,"reason":"em muốn thầy xem xet lại","requestedScore":8}', NULL, '2026-04-08T03:38:53.534Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'cc20f48f-e6ab-46f9-9069-4fc817b47751', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'REGRADE_REQUEST', N'{"status":"PENDING"}', N'{"requestId":"062bcb0e-0a01-46ed-be57-390f8a6f3014","decision":"APPROVED","comment":"ok","approvedScore":6}', NULL, '2026-04-08T03:39:21.915Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'8b34f213-558a-494c-acce-f4d1a227e21f', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'LECTURER', NULL, N'{"email":"GV2@utt.edu.vn","lecturerCode":"GV003","name":"ABCD"}', NULL, '2026-04-08T04:20:58.211Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'14894be9-7507-443a-a806-05ef51b064c6', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'LECTURER', NULL, N'{"email":"jejsjsudus@gmail.com","lecturerCode":"GV005","name":"Nguyễn Văn B"}', NULL, '2026-04-08T04:24:33.276Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'22c0c3c5-8480-4886-b188-8124d79da6c3', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'COURSE', NULL, N'{"code":"ACD","name":"JAVA","credits":3}', NULL, '2026-04-08T04:32:02.458Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'5f3bde8b-e90c-44f6-b4fa-e459f8fc32bf', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'CLASS_SECTION', NULL, N'{"sectionId":"16cd74e5-ad76-4381-8820-a80b084b17f9","course":"JAVA","semester":"Học kỳ 1 Năm học 2023-2024"}', NULL, '2026-04-08T04:32:22.865Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'0787dbe9-60b8-40f7-889c-8b7e14659c19', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'STUDENT', NULL, N'{"email":"kien@utt.edu.vn","mssv":"74DCHT22150","name":"ĐàmQuangKien"}', NULL, '2026-04-08T04:39:04.997Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'9c87d9e7-25f9-4918-bd9d-6ba3f3b5c66b', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 6, "final": true}', NULL, '2026-04-08T04:56:43.498Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'2293648f-2b5d-4957-9aa5-0bbaf399b157', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 7, "final": true}', NULL, '2026-04-08T04:56:46.047Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'8872f6ef-d630-4d59-9b7c-9fba834d86f8', N'20f9dbb2-5c26-453c-9d41-c017c756154e', N'UPDATE', N'SCORE', NULL, N'{"score": 5, "final": true}', NULL, '2026-04-08T04:56:46.856Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'08977317-cc53-401b-af72-bebae11cf7bf', N'a21c3f91-6f5b-40f1-810e-932e06627231', N'UPDATE', N'STUDENT_PROFILE', NULL, N'Updated phone/address/idCard', NULL, '2026-04-08T10:11:13.391Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'c722d3e0-3ff3-42cf-a0a2-f819a71b4806', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'COURSE', NULL, N'{"code":"AAAA","name":"aaa","credits":3}', NULL, '2026-04-08T10:12:11.883Z');
INSERT INTO [dbo].[AuditLog] ([id], [userId], [action], [entity], [oldData], [newData], [ip], [timestamp]) VALUES (N'f9315bd5-833a-45c7-a409-f4561e77987e', N'70fb9f13-8efd-4c16-a718-ac453a863f84', N'CREATE', N'CLASS_SECTION', NULL, N'{"sectionId":"37c225a3-5805-4ca6-a526-526872fda84e","course":"aaa","semester":"Học kỳ 1 Năm học 2023-2024"}', NULL, '2026-04-08T10:12:32.538Z');
GO

/* Data for table [dbo].[Notification] */
INSERT INTO [dbo].[Notification] ([id], [title], [content], [date], [senderId], [classSectionId]) VALUES (N'948695e1-aadb-4e10-a1a2-122f36929ba4', N'Thông báo lịch nghỉ bù', N'Lớp nghỉ học buổi tới do giảng viên đi công tác. Sẽ học bù vào tuần sau.', '2026-04-08T03:11:37.234Z', N'87cf8b77-00d6-4d72-b0a0-6b9ef9495b1e', N'32dd9b90-31fc-4f24-8c8e-5a1329043559');
INSERT INTO [dbo].[Notification] ([id], [title], [content], [date], [senderId], [classSectionId]) VALUES (N'7c49992f-1033-49f8-aee7-610f8c804034', N'Nghỉ học', N'thầy ốm', '2026-04-08T03:28:37.195Z', N'87cf8b77-00d6-4d72-b0a0-6b9ef9495b1e', N'32dd9b90-31fc-4f24-8c8e-5a1329043559');
GO

/* Data for table [dbo].[NotificationRecipient] */
INSERT INTO [dbo].[NotificationRecipient] ([id], [notificationId], [studentId], [isRead], [readAt]) VALUES (N'0a4a2e9a-2f49-450f-88b3-e1934c3a6254', N'948695e1-aadb-4e10-a1a2-122f36929ba4', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', 0, NULL);
INSERT INTO [dbo].[NotificationRecipient] ([id], [notificationId], [studentId], [isRead], [readAt]) VALUES (N'b36d77f5-f16a-4d8b-989e-faadb6e972f2', N'948695e1-aadb-4e10-a1a2-122f36929ba4', N'76b49b68-b4ed-44c1-a131-8c37efe8cdbd', 0, NULL);
INSERT INTO [dbo].[NotificationRecipient] ([id], [notificationId], [studentId], [isRead], [readAt]) VALUES (N'b7281935-6b8e-4b74-8ccc-e9d36306dc25', N'7c49992f-1033-49f8-aee7-610f8c804034', N'703422e8-2dcd-4c4f-9f9f-fba89b12725b', 0, NULL);
INSERT INTO [dbo].[NotificationRecipient] ([id], [notificationId], [studentId], [isRead], [readAt]) VALUES (N'7409d5ed-1b92-4424-94e6-9854c02b285d', N'7c49992f-1033-49f8-aee7-610f8c804034', N'76b49b68-b4ed-44c1-a131-8c37efe8cdbd', 0, NULL);
GO