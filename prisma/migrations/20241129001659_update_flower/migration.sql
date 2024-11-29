/*
  Warnings:

  - You are about to drop the column `total_sales` on the `Flower` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Flower` DROP COLUMN `total_sales`,
    ADD COLUMN `revenue` DOUBLE NOT NULL DEFAULT 0;
