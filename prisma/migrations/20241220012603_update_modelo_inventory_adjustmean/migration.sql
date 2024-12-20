/*
  Warnings:

  - You are about to drop the column `price` on the `adjust_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `adjust_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `adjust_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `inventory_adjustments` table. All the data in the column will be lost.
  - Added the required column `currentStockFresh` to the `adjust_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adjust_transaction` DROP COLUMN `price`,
    DROP COLUMN `quantity`,
    DROP COLUMN `type`,
    ADD COLUMN `currentStockFresh` INTEGER NOT NULL,
    ADD COLUMN `currentwiltedFlowers` INTEGER NULL,
    ADD COLUMN `locationId` INTEGER NULL,
    ADD COLUMN `min` INTEGER NULL;

-- AlterTable
ALTER TABLE `inventory_adjustments` DROP COLUMN `reason`;
