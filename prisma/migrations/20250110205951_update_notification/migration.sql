/*
  Warnings:

  - Added the required column `concept` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `concept` VARCHAR(191) NOT NULL;
