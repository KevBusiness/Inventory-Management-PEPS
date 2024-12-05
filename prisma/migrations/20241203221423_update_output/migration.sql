/*
  Warnings:

  - Added the required column `total` to the `outputs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `outputs` ADD COLUMN `total` DOUBLE NOT NULL;
