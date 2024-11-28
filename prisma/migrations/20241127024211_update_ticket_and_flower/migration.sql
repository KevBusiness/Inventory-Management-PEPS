/*
  Warnings:

  - You are about to drop the column `Amount_sell` on the `Flower` table. All the data in the column will be lost.
  - Added the required column `revenue` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Flower` DROP COLUMN `Amount_sell`,
    ADD COLUMN `fresh_sale` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `wilted_sale` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `revenue` DOUBLE NOT NULL;
