BEGIN TRY

BEGIN TRAN;

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
    CONSTRAINT [Student_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Student_mssv_key] UNIQUE NONCLUSTERED ([mssv]),
    CONSTRAINT [Student_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Lecturer] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [facultyId] NVARCHAR(1000),
    [departmentId] NVARCHAR(1000),
    CONSTRAINT [Lecturer_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Lecturer_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[AcademicProgram] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [majorId] NVARCHAR(1000),
    [startCohort] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AcademicProgram_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Course] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [credits] INT NOT NULL,
    [prerequisiteIds] NVARCHAR(1000),
    CONSTRAINT [Course_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Course_code_key] UNIQUE NONCLUSTERED ([code])
);

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

-- CreateTable
CREATE TABLE [dbo].[Enrollment] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Enrollment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Enrollment_studentId_classSectionId_key] UNIQUE NONCLUSTERED ([studentId],[classSectionId])
);

-- CreateTable
CREATE TABLE [dbo].[AttendanceSession] (
    [id] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [qrCodeToken] NVARCHAR(1000),
    [expiresAt] DATETIME2,
    CONSTRAINT [AttendanceSession_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AttendanceRecord] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionId] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AttendanceRecord_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AttendanceRecord_sessionId_studentId_key] UNIQUE NONCLUSTERED ([sessionId],[studentId])
);

-- CreateTable
CREATE TABLE [dbo].[ScoreSettings] (
    [id] NVARCHAR(1000) NOT NULL,
    [courseId] NVARCHAR(1000) NOT NULL,
    [componentName] NVARCHAR(1000) NOT NULL,
    [percentage] FLOAT(53) NOT NULL,
    CONSTRAINT [ScoreSettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

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

-- CreateTable
CREATE TABLE [dbo].[RegradeRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [classSectionId] NVARCHAR(1000) NOT NULL,
    [currentScore] FLOAT(53) NOT NULL,
    [requestedScore] FLOAT(53),
    [reason] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [evidenceUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RegradeRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RegradeRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TuitionInvoice] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [semesterId] NVARCHAR(1000) NOT NULL,
    [totalAmount] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TuitionInvoice_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TuitionInvoice_pkey] PRIMARY KEY CLUSTERED ([id])
);

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

-- AddForeignKey
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [Student_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Lecturer] ADD CONSTRAINT [Lecturer_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClassSection] ADD CONSTRAINT [ClassSection_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClassSection] ADD CONSTRAINT [ClassSection_semesterId_fkey] FOREIGN KEY ([semesterId]) REFERENCES [dbo].[Semester]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClassSection] ADD CONSTRAINT [ClassSection_lecturerId_fkey] FOREIGN KEY ([lecturerId]) REFERENCES [dbo].[Lecturer]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceSession] ADD CONSTRAINT [AttendanceSession_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceRecord] ADD CONSTRAINT [AttendanceRecord_sessionId_fkey] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[AttendanceSession]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceRecord] ADD CONSTRAINT [AttendanceRecord_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ScoreSettings] ADD CONSTRAINT [ScoreSettings_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[Enrollment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_componentId_fkey] FOREIGN KEY ([componentId]) REFERENCES [dbo].[ScoreSettings]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RegradeRequest] ADD CONSTRAINT [RegradeRequest_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RegradeRequest] ADD CONSTRAINT [RegradeRequest_classSectionId_fkey] FOREIGN KEY ([classSectionId]) REFERENCES [dbo].[ClassSection]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TuitionInvoice] ADD CONSTRAINT [TuitionInvoice_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TuitionInvoice] ADD CONSTRAINT [TuitionInvoice_semesterId_fkey] FOREIGN KEY ([semesterId]) REFERENCES [dbo].[Semester]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_invoiceId_fkey] FOREIGN KEY ([invoiceId]) REFERENCES [dbo].[TuitionInvoice]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

