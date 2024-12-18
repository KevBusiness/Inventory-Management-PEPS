/*
  Warnings:

  - A unique constraint covering the columns `[default]` on the table `locations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `default` to the `locations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `locations` ADD COLUMN `default` BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `locations_default_key` ON `locations`(`default`);
