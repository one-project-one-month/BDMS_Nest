-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('FIRST_TIMER', 'GALLON', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('POSITIVE', 'NEGATIVE', 'PENDING');

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "blood_group" TEXT,
    "hemoglobin" TEXT,
    "hiv" BOOLEAN,
    "hepatitis_b" TEXT,
    "hepatitis_c" "TestResult" NOT NULL DEFAULT 'PENDING',
    "syphilis" TEXT,
    "malaria" "TestResult" NOT NULL DEFAULT 'PENDING',
    "last_donation_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "CertificateType" NOT NULL,
    "certificate_title" TEXT NOT NULL,
    "certificate_description" TEXT NOT NULL,
    "certificate_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_appointment_id_key" ON "MedicalRecord"("appointment_id");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
