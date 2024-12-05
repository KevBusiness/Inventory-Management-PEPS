-- DropForeignKey
ALTER TABLE `flowers` DROP FOREIGN KEY `flowers_locationId_fkey`;

-- AlterTable
ALTER TABLE `flowers` MODIFY `locationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `flowers` ADD CONSTRAINT `flowers_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
