/*
  Warnings:

  - You are about to drop the column `openFortAccount` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openfort_player` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "openFortAccount",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "openfort_player" TEXT NOT NULL;
