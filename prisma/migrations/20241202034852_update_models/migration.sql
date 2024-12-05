/*
  Warnings:

  - You are about to drop the column `freshQuantity` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `ticketId` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `wiltedQuantity` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `min_amount` on the `FlowerCategory` table. All the data in the column will be lost.
  - You are about to drop the column `ticketId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `updatedFlowers` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currentFresh` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentUbication` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentWilted` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entranceId` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Made the column `revenue` on table `Flower` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `entranceId` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Flower` DROP FOREIGN KEY `Flower_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `Sale` DROP FOREIGN KEY `Sale_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_userId_fkey`;

-- AlterTable
ALTER TABLE `Flower` DROP COLUMN `freshQuantity`,
    DROP COLUMN `price`,
    DROP COLUMN `ticketId`,
    DROP COLUMN `type`,
    DROP COLUMN `wiltedQuantity`,
    ADD COLUMN `currentFresh` INTEGER NOT NULL,
    ADD COLUMN `currentUbication` VARCHAR(191) NOT NULL,
    ADD COLUMN `currentWilted` INTEGER NOT NULL,
    ADD COLUMN `entranceId` INTEGER NOT NULL,
    ADD COLUMN `min_amount` INTEGER NULL,
    MODIFY `revenue` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `FlowerCategory` DROP COLUMN `min_amount`;

-- AlterTable
ALTER TABLE `Sale` DROP COLUMN `ticketId`,
    DROP COLUMN `updatedFlowers`,
    ADD COLUMN `entranceId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Ticket`;

-- CreateTable
CREATE TABLE `Entrance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('Pedido', 'En_Preparacion', 'Disponible', 'Cancelado') NOT NULL DEFAULT 'Pedido',
    `total` DOUBLE NOT NULL,
    `userId` INTEGER NOT NULL,
    `ubication` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlowerHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Inicio', 'Compra', 'Venta') NOT NULL,
    `freshQuantity` INTEGER NOT NULL,
    `wiltedQuantity` INTEGER NOT NULL,
    `ubication` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `flowerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `saleId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Entrance` ADD CONSTRAINT `Entrance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_entranceId_fkey` FOREIGN KEY (`entranceId`) REFERENCES `Entrance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flower` ADD CONSTRAINT `Flower_entranceId_fkey` FOREIGN KEY (`entranceId`) REFERENCES `Entrance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowerHistory` ADD CONSTRAINT `FlowerHistory_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowerHistory` ADD CONSTRAINT `FlowerHistory_flowerId_fkey` FOREIGN KEY (`flowerId`) REFERENCES `Flower`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
