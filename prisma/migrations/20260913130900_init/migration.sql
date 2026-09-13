-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'EXPERT', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "ExperienceType" AS ENUM ('INTERNSHIP', 'JOB', 'RESEARCH', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('FULL', 'PARTIAL', 'TUITION_ONLY');

-- CreateEnum
CREATE TYPE "ScholarshipStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LanguageRequirement" AS ENUM ('REQUIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('CV', 'MOTIVATION_LETTER', 'TRANSCRIPT', 'RECOMMENDATION', 'PASSPORT', 'CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MATCH', 'DEADLINE_REMINDER', 'DOCUMENT_REVIEWED', 'SAVED_UPDATED', 'DEADLINE_PASSED', 'ORDER_UPDATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CvOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_EXPERT_REVIEW', 'ATS_CHECK', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimelineStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "oauthProvider" TEXT,
    "oauthId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "profileVisible" BOOLEAN NOT NULL DEFAULT true,
    "shareDataWithUniversities" BOOLEAN NOT NULL DEFAULT false,
    "notifyNewMatches" BOOLEAN NOT NULL DEFAULT true,
    "notifyApplicationStatus" BOOLEAN NOT NULL DEFAULT true,
    "notifyNews" BOOLEAN NOT NULL DEFAULT false,
    "acceptedTermsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "location" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullNameAr" TEXT,
    "fullNameEn" TEXT,
    "birthDate" TIMESTAMP(3),
    "nationality" TEXT,
    "gender" "Gender",
    "country" TEXT,
    "city" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "academicEmail" TEXT,
    "bio" TEXT,
    "headline" TEXT,
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "degree" "DegreeLevel" NOT NULL,
    "major" TEXT,
    "institution" TEXT NOT NULL,
    "country" TEXT,
    "graduationYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "gpaValue" DOUBLE PRECISION,
    "gpaScale" DOUBLE PRECISION,
    "honors" TEXT,
    "thesisTitle" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ExperienceType" NOT NULL DEFAULT 'JOB',
    "organization" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_languages" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,
    "certificate" TEXT,

    CONSTRAINT "profile_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "credentialId" TEXT,
    "issueDate" TIMESTAMP(3),
    "url" TEXT,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "url" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT,
    "provider" TEXT NOT NULL,
    "universityName" TEXT,
    "countryCode" TEXT NOT NULL,
    "countryNameAr" TEXT NOT NULL,
    "region" TEXT,
    "fundingType" "FundingType" NOT NULL,
    "languageRequirement" "LanguageRequirement" NOT NULL DEFAULT 'NOT_REQUIRED',
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "applyUrl" TEXT,
    "coverImageUrl" TEXT,
    "logoUrl" TEXT,
    "openDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "minGpa" DOUBLE PRECISION,
    "gpaScale" DOUBLE PRECISION,
    "acceptanceRate" DOUBLE PRECISION,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_levels" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "level" "DegreeLevel" NOT NULL,

    CONSTRAINT "scholarship_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_majors" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "scholarship_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_eligibility" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scholarship_eligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_documents" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scholarship_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_benefits" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scholarship_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_scholarships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_matches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" TEXT[],
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarship_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "badgeLabel" TEXT,
    "actionLabel" TEXT,
    "actionUrl" TEXT,
    "scholarshipId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expert_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titlePrefix" TEXT,
    "specialization" TEXT,
    "bio" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "expert_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expertId" TEXT,
    "status" "CvOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "dataSnapshot" JSONB,
    "atsScore" INTEGER,
    "expectedDeliveryAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "finalFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TimelineStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "occurredAt" TIMESTAMP(3),

    CONSTRAINT "cv_order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_order_notes" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_order_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_ats_checks" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cv_ats_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tools" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_runs" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "AiRunStatus" NOT NULL DEFAULT 'RUNNING',
    "input" JSONB,
    "output" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tool_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_revokedAt_idx" ON "sessions"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "verification_codes_userId_type_idx" ON "verification_codes"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE INDEX "educations_profileId_idx" ON "educations"("profileId");

-- CreateIndex
CREATE INDEX "experiences_profileId_idx" ON "experiences"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_skills_profileId_name_key" ON "profile_skills"("profileId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "profile_languages_profileId_name_key" ON "profile_languages"("profileId", "name");

-- CreateIndex
CREATE INDEX "certifications_profileId_idx" ON "certifications"("profileId");

-- CreateIndex
CREATE INDEX "projects_profileId_idx" ON "projects"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "interests_profileId_name_key" ON "interests"("profileId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_slug_key" ON "scholarships"("slug");

-- CreateIndex
CREATE INDEX "scholarships_status_deadline_idx" ON "scholarships"("status", "deadline");

-- CreateIndex
CREATE INDEX "scholarships_countryCode_idx" ON "scholarships"("countryCode");

-- CreateIndex
CREATE INDEX "scholarships_fundingType_idx" ON "scholarships"("fundingType");

-- CreateIndex
CREATE INDEX "scholarships_isFeatured_idx" ON "scholarships"("isFeatured");

-- CreateIndex
CREATE INDEX "scholarship_levels_level_idx" ON "scholarship_levels"("level");

-- CreateIndex
CREATE UNIQUE INDEX "scholarship_levels_scholarshipId_level_key" ON "scholarship_levels"("scholarshipId", "level");

-- CreateIndex
CREATE INDEX "scholarship_majors_scholarshipId_idx" ON "scholarship_majors"("scholarshipId");

-- CreateIndex
CREATE INDEX "scholarship_majors_name_idx" ON "scholarship_majors"("name");

-- CreateIndex
CREATE INDEX "scholarship_eligibility_scholarshipId_idx" ON "scholarship_eligibility"("scholarshipId");

-- CreateIndex
CREATE INDEX "scholarship_documents_scholarshipId_idx" ON "scholarship_documents"("scholarshipId");

-- CreateIndex
CREATE INDEX "scholarship_benefits_scholarshipId_idx" ON "scholarship_benefits"("scholarshipId");

-- CreateIndex
CREATE INDEX "saved_scholarships_userId_idx" ON "saved_scholarships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_scholarships_userId_scholarshipId_key" ON "saved_scholarships"("userId", "scholarshipId");

-- CreateIndex
CREATE INDEX "scholarship_matches_userId_score_idx" ON "scholarship_matches"("userId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "scholarship_matches_userId_scholarshipId_key" ON "scholarship_matches"("userId", "scholarshipId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_scholarshipId_key" ON "applications"("userId", "scholarshipId");

-- CreateIndex
CREATE INDEX "documents_userId_kind_idx" ON "documents"("userId", "kind");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "expert_profiles_userId_key" ON "expert_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cv_orders_orderNumber_key" ON "cv_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "cv_orders_userId_idx" ON "cv_orders"("userId");

-- CreateIndex
CREATE INDEX "cv_orders_status_idx" ON "cv_orders"("status");

-- CreateIndex
CREATE INDEX "cv_order_events_orderId_idx" ON "cv_order_events"("orderId");

-- CreateIndex
CREATE INDEX "cv_order_notes_orderId_idx" ON "cv_order_notes"("orderId");

-- CreateIndex
CREATE INDEX "cv_ats_checks_orderId_idx" ON "cv_ats_checks"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tools_key_key" ON "ai_tools"("key");

-- CreateIndex
CREATE INDEX "ai_tool_runs_toolId_createdAt_idx" ON "ai_tool_runs"("toolId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_tool_runs_userId_idx" ON "ai_tool_runs"("userId");

-- CreateIndex
CREATE INDEX "ai_tool_runs_status_idx" ON "ai_tool_runs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "contact_messages_isRead_idx" ON "contact_messages"("isRead");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_languages" ADD CONSTRAINT "profile_languages_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_levels" ADD CONSTRAINT "scholarship_levels_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_majors" ADD CONSTRAINT "scholarship_majors_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_eligibility" ADD CONSTRAINT "scholarship_eligibility_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_documents" ADD CONSTRAINT "scholarship_documents_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_benefits" ADD CONSTRAINT "scholarship_benefits_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_matches" ADD CONSTRAINT "scholarship_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_matches" ADD CONSTRAINT "scholarship_matches_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expert_profiles" ADD CONSTRAINT "expert_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_orders" ADD CONSTRAINT "cv_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_orders" ADD CONSTRAINT "cv_orders_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_order_events" ADD CONSTRAINT "cv_order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "cv_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_order_notes" ADD CONSTRAINT "cv_order_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "cv_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_order_notes" ADD CONSTRAINT "cv_order_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_ats_checks" ADD CONSTRAINT "cv_ats_checks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "cv_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_runs" ADD CONSTRAINT "ai_tool_runs_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_runs" ADD CONSTRAINT "ai_tool_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
