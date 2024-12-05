/*
  Warnings:

  - Added the required column `flowerBoxId` to the `flowers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `flowers` ADD COLUMN `flowerBoxId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `flowers` ADD CONSTRAINT `flowers_flowerBoxId_fkey` FOREIGN KEY (`flowerBoxId`) REFERENCES `flowerBoxes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
