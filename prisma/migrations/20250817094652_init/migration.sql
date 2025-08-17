-- CreateEnum
CREATE TYPE "public"."MealPeriod" AS ENUM ('MORNING_BEFORE', 'MORNING_AFTER', 'LUNCH_BEFORE', 'LUNCH_AFTER', 'DINNER_BEFORE', 'DINNER_AFTER', 'BEDTIME');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lineUserId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "labResultId" INTEGER,
    "appointmentId" INTEGER,
    "foodAnalysisId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlucoseLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "period" "public"."MealPeriod" NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlucoseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSetting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "remindDaily8am" BOOLEAN NOT NULL DEFAULT true,
    "targetMin" INTEGER NOT NULL DEFAULT 80,
    "targetMax" INTEGER NOT NULL DEFAULT 180,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabResult" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "fastingGlucose" DOUBLE PRECISION,
    "hba1c" DOUBLE PRECISION,
    "recordDate" TIMESTAMP(3),
    "normalRangeMin" INTEGER,
    "normalRangeMax" INTEGER,
    "fastingGlucoseUnit" TEXT,
    "hba1cUnit" TEXT,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "appointmentDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "doctorName" TEXT,
    "hospitalName" TEXT,
    "fullName" TEXT,
    "age" TEXT,
    "reason" TEXT,
    "details" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoodAnalysis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodName" TEXT,
    "carbsGram" DOUBLE PRECISION,
    "sugarGram" DOUBLE PRECISION,
    "advice" TEXT,

    CONSTRAINT "FoodAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_lineUserId_key" ON "public"."User"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_labResultId_key" ON "public"."Media"("labResultId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_appointmentId_key" ON "public"."Media"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_foodAnalysisId_key" ON "public"."Media"("foodAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "public"."UserSetting"("userId");

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_labResultId_fkey" FOREIGN KEY ("labResultId") REFERENCES "public"."LabResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_foodAnalysisId_fkey" FOREIGN KEY ("foodAnalysisId") REFERENCES "public"."FoodAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GlucoseLog" ADD CONSTRAINT "GlucoseLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabResult" ADD CONSTRAINT "LabResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoodAnalysis" ADD CONSTRAINT "FoodAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
