/*
  Warnings:

  - A unique constraint covering the columns `[googleRefreshToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleRefreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleRefreshToken_key" ON "User"("googleRefreshToken");
