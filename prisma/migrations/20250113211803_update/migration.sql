/*
  Warnings:

  - You are about to drop the `outputs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `outputs` DROP FOREIGN KEY `outputs_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `outputs` DROP FOREIGN KEY `outputs_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_transaction` DROP FOREIGN KEY `sale_transaction_outputId_fkey`;

-- AlterTable
ALTER TABLE `sale_transaction` ADD COLUMN `ticketId` INTEGER NULL;

-- DropTable
DROP TABLE `outputs`;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
