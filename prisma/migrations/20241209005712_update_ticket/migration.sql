/*
  Warnings:

  - Added the required column `folio` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `folio` INTEGER NOT NULL,
    ADD COLUMN `process` BOOLEAN NULL DEFAULT false;
