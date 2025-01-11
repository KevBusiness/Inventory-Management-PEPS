/*
  Warnings:

  - You are about to drop the column `currentStockFresh` on the `adjust_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currentwiltedFlowers` on the `adjust_transaction` table. All the data in the column will be lost.
  - Added the required column `amount` to the `adjust_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adjust_transaction` DROP COLUMN `currentStockFresh`,
    DROP COLUMN `currentwiltedFlowers`,
    ADD COLUMN `amount` INTEGER NOT NULL;
