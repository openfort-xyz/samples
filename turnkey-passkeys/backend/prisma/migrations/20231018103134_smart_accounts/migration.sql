/*
  Warnings:

  - You are about to drop the column `drops` on the `PrivateKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PrivateKey" DROP COLUMN "drops";

-- CreateTable
CREATE TABLE "SmartAccount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "openfortPlayer" TEXT NOT NULL,
    "ethereumAddress" TEXT NOT NULL,

    CONSTRAINT "SmartAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SmartAccount" ADD CONSTRAINT "SmartAccount_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
