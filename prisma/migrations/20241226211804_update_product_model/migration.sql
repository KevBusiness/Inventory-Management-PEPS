/*
  Warnings:

  - Added the required column `total` to the `adjust_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `picture` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `adjust_transaction` ADD COLUMN `reason` VARCHAR(191) NULL,
    ADD COLUMN `total` DOUBLE NOT NULL,
    MODIFY `type` ENUM('Entrada', 'Salida', 'Perdida') NULL;
