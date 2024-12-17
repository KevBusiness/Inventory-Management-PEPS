-- AlterTable
ALTER TABLE `flowerBoxes` ADD COLUMN `locationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `flowerBoxes` ADD CONSTRAINT `flowerBoxes_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
