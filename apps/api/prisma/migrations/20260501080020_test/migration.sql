-- DropIndex
DROP INDEX "Application_job_title_company_idx";

-- DropIndex
DROP INDEX "Candidate_email_name_idx";

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "applied_at" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Application_job_title_idx" ON "Application"("job_title");

-- CreateIndex
CREATE INDEX "Application_company_idx" ON "Application"("company");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_name_idx" ON "Candidate"("name");

-- CreateIndex
CREATE INDEX "Candidate_deleted_at_idx" ON "Candidate"("deleted_at");
