/*
  Warnings:

  - You are about to drop the column `companyName` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `round` on the `Interview` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Interview_companyName_idx";

-- DropIndex
DROP INDEX "Interview_resourceId_idx";

-- DropIndex
DROP INDEX "Interview_role_idx";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "companyName",
DROP COLUMN "role",
DROP COLUMN "round",
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "roleId" TEXT NOT NULL,
ADD COLUMN     "roundId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewRound" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRole_name_key" ON "InterviewRole"("name");

-- CreateIndex
CREATE INDEX "InterviewRole_name_idx" ON "InterviewRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRound_name_key" ON "InterviewRound"("name");

-- CreateIndex
CREATE INDEX "InterviewRound_name_idx" ON "InterviewRound"("name");

-- CreateIndex
CREATE INDEX "Interview_companyId_idx" ON "Interview"("companyId");

-- CreateIndex
CREATE INDEX "Interview_roleId_idx" ON "Interview"("roleId");

-- CreateIndex
CREATE INDEX "Interview_roundId_idx" ON "Interview"("roundId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "InterviewRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "InterviewRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
