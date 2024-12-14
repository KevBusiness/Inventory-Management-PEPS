/*
  Warnings:

  - Added the required column `initialAmount` to the `flowers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `flowers` ADD COLUMN `initialAmount` INTEGER NOT NULL;
