/*
  Warnings:

  - A unique constraint covering the columns `[playerOf]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "playerOf" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_playerOf_key" ON "User"("playerOf");
