/*
  Warnings:

  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AccessToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AccessToken" DROP CONSTRAINT "AccessToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "SessionToken" DROP CONSTRAINT "SessionToken_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verified",
DROP COLUMN "verifyHash",
ADD COLUMN     "email" VARCHAR(256) NOT NULL;

-- DropTable
DROP TABLE "AccessToken";

-- DropTable
DROP TABLE "SessionToken";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
