-- DropForeignKey
ALTER TABLE `Flower` DROP FOREIGN KEY `Flower_ticketId_fkey`;

-- AddForeignKey
ALTER TABLE `Flower` ADD CONSTRAINT `Flower_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
