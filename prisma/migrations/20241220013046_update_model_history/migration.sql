/*
  Warnings:

  - You are about to drop the column `price` on the `history_flowers` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `history_flowers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `history_flowers` DROP COLUMN `price`,
    DROP COLUMN `reason`;
