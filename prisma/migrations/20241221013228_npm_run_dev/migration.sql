/*
  Warnings:

  - You are about to drop the column `locationId` on the `adjust_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `min` on the `adjust_transaction` table. All the data in the column will be lost.
  - Added the required column `price` to the `adjust_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adjust_transaction` DROP COLUMN `locationId`,
    DROP COLUMN `min`,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `type` ENUM('Entrada', 'Salida') NULL,
    MODIFY `currentStockFresh` INTEGER NULL;
