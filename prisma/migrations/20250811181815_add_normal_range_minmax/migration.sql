/*
  Warnings:

  - You are about to drop the column `normalRange` on the `LabResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."LabResult" DROP COLUMN "normalRange",
ADD COLUMN     "normalRangeMax" INTEGER,
ADD COLUMN     "normalRangeMin" INTEGER;
