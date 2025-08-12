/*
  Warnings:

  - You are about to drop the column `address` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "address",
ADD COLUMN     "age" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "hospitalName" TEXT,
ADD COLUMN     "startTime" TEXT;
