-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ORG_ADMIN', 'HOD', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('WAITING', 'PENDING', 'SIGNED', 'REJECTED', 'DELEGATED');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "tbl_organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "database_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tbl_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_employees" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "gender" TEXT,
    "address" TEXT,
    "designation" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "department_id" UUID,
    "manager_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tbl_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_departments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "department_name" TEXT NOT NULL,
    "hod_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tbl_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_employee_department_access" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_employee_department_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_voucher_types" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "voucher_name" TEXT NOT NULL,
    "signatures_required" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tbl_voucher_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_digital_signatures" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_digital_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_files" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL DEFAULT 0,
    "mime_type" TEXT NOT NULL DEFAULT 'application/pdf',
    "department_id" UUID NOT NULL,
    "voucher_type_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "signed_by_uploader" BOOLEAN NOT NULL DEFAULT false,
    "signatures_done" INTEGER NOT NULL DEFAULT 0,
    "is_signed_by_all" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tbl_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_signature_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL DEFAULT 1,
    "employee_id" UUID NOT NULL,
    "original_signer_id" UUID,
    "delegation_reason" TEXT,
    "status" "SignatureStatus" NOT NULL DEFAULT 'WAITING',
    "signed_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_signature_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_organizations_slug_key" ON "tbl_organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_employees_email_key" ON "tbl_employees"("email");

-- CreateIndex
CREATE INDEX "tbl_employees_organization_id_idx" ON "tbl_employees"("organization_id");

-- CreateIndex
CREATE INDEX "tbl_employees_organization_id_department_id_idx" ON "tbl_employees"("organization_id", "department_id");

-- CreateIndex
CREATE INDEX "tbl_employees_email_idx" ON "tbl_employees"("email");

-- CreateIndex
CREATE INDEX "tbl_departments_organization_id_idx" ON "tbl_departments"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_departments_organization_id_department_name_key" ON "tbl_departments"("organization_id", "department_name");

-- CreateIndex
CREATE INDEX "tbl_employee_department_access_organization_id_idx" ON "tbl_employee_department_access"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_employee_department_access_employee_id_department_id_key" ON "tbl_employee_department_access"("employee_id", "department_id");

-- CreateIndex
CREATE INDEX "tbl_voucher_types_organization_id_idx" ON "tbl_voucher_types"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_voucher_types_organization_id_voucher_name_key" ON "tbl_voucher_types"("organization_id", "voucher_name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_digital_signatures_employee_id_key" ON "tbl_digital_signatures"("employee_id");

-- CreateIndex
CREATE INDEX "tbl_digital_signatures_organization_id_idx" ON "tbl_digital_signatures"("organization_id");

-- CreateIndex
CREATE INDEX "tbl_files_organization_id_idx" ON "tbl_files"("organization_id");

-- CreateIndex
CREATE INDEX "tbl_files_organization_id_status_idx" ON "tbl_files"("organization_id", "status");

-- CreateIndex
CREATE INDEX "tbl_files_department_id_idx" ON "tbl_files"("department_id");

-- CreateIndex
CREATE INDEX "tbl_files_created_by_id_idx" ON "tbl_files"("created_by_id");

-- CreateIndex
CREATE INDEX "tbl_signature_logs_organization_id_idx" ON "tbl_signature_logs"("organization_id");

-- CreateIndex
CREATE INDEX "tbl_signature_logs_file_id_idx" ON "tbl_signature_logs"("file_id");

-- CreateIndex
CREATE INDEX "tbl_signature_logs_employee_id_status_idx" ON "tbl_signature_logs"("employee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_signature_logs_file_id_step_order_employee_id_key" ON "tbl_signature_logs"("file_id", "step_order", "employee_id");

-- AddForeignKey
ALTER TABLE "tbl_employees" ADD CONSTRAINT "tbl_employees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_employees" ADD CONSTRAINT "tbl_employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "tbl_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_employees" ADD CONSTRAINT "tbl_employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "tbl_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_departments" ADD CONSTRAINT "tbl_departments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_departments" ADD CONSTRAINT "tbl_departments_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "tbl_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_employee_department_access" ADD CONSTRAINT "tbl_employee_department_access_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_employee_department_access" ADD CONSTRAINT "tbl_employee_department_access_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "tbl_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_employee_department_access" ADD CONSTRAINT "tbl_employee_department_access_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "tbl_departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_voucher_types" ADD CONSTRAINT "tbl_voucher_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_digital_signatures" ADD CONSTRAINT "tbl_digital_signatures_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_digital_signatures" ADD CONSTRAINT "tbl_digital_signatures_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "tbl_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_files" ADD CONSTRAINT "tbl_files_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_files" ADD CONSTRAINT "tbl_files_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "tbl_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_files" ADD CONSTRAINT "tbl_files_voucher_type_id_fkey" FOREIGN KEY ("voucher_type_id") REFERENCES "tbl_voucher_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_files" ADD CONSTRAINT "tbl_files_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "tbl_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_signature_logs" ADD CONSTRAINT "tbl_signature_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tbl_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_signature_logs" ADD CONSTRAINT "tbl_signature_logs_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "tbl_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_signature_logs" ADD CONSTRAINT "tbl_signature_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "tbl_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_signature_logs" ADD CONSTRAINT "tbl_signature_logs_original_signer_id_fkey" FOREIGN KEY ("original_signer_id") REFERENCES "tbl_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
