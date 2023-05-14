/*
  Warnings:

  - You are about to alter the column `name` on the `Package` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `version` on the `Release` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `hash` on the `Release` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `url` on the `Release` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(512)`.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `verifyHash` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - Added the required column `githubId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "name" SET DATA TYPE VARCHAR(256);

-- AlterTable
ALTER TABLE "Release" ALTER COLUMN "version" SET DATA TYPE VARCHAR(256),
ALTER COLUMN "hash" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "url" SET DATA TYPE VARCHAR(512);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "githubId" VARCHAR(200) NOT NULL,
ALTER COLUMN "verifyHash" SET DATA TYPE VARCHAR(64);

-- CreateTable
CREATE TABLE "SessionToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionToken_token_key" ON "SessionToken"("token");

-- AddForeignKey
ALTER TABLE "SessionToken" ADD CONSTRAINT "SessionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
