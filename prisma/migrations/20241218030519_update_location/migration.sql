/*
  Warnings:

  - You are about to drop the column `default` on the `locations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[defaultLocation]` on the table `locations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `locations_default_key` ON `locations`;

-- AlterTable
ALTER TABLE `locations` DROP COLUMN `default`,
    ADD COLUMN `defaultLocation` BOOLEAN NULL;

-- CreateIndex
CREATE UNIQUE INDEX `locations_defaultLocation_key` ON `locations`(`defaultLocation`);
