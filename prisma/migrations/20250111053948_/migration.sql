/*
  Warnings:

  - Made the column `type` on table `adjust_transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `adjust_transaction` MODIFY `type` VARCHAR(191) NOT NULL;
