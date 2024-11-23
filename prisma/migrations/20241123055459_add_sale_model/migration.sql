/*
  Warnings:

  - The values [Normal,Venta] on the enum `Ticket_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [Abierto,Cerrado] on the enum `Ticket_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Ticket` MODIFY `type` ENUM('Pedido', 'Entregado') NOT NULL,
    MODIFY `status` ENUM('Disponible', 'Vendido', 'Bajo') NOT NULL;

-- CreateTable
CREATE TABLE `Sale` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedFlowers` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
