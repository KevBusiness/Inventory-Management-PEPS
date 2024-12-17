/*
  Warnings:

  - You are about to drop the column `adjustmentDate` on the `inventory_adjustments` table. All the data in the column will be lost.
  - You are about to drop the column `flowerId` on the `inventory_adjustments` table. All the data in the column will be lost.
  - You are about to drop the column `freshQuantity` on the `inventory_adjustments` table. All the data in the column will be lost.
  - You are about to drop the column `wiltedQuantity` on the `inventory_adjustments` table. All the data in the column will be lost.
  - You are about to drop the `sale_transactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ticketId` to the `inventory_adjustments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `inventory_adjustments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventory_adjustments` DROP FOREIGN KEY `inventory_adjustments_flowerId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_transactions` DROP FOREIGN KEY `sale_transactions_flowerId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_transactions` DROP FOREIGN KEY `sale_transactions_outputId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_transactions` DROP FOREIGN KEY `sale_transactions_productId_fkey`;

-- AlterTable
ALTER TABLE `inventory_adjustments` DROP COLUMN `adjustmentDate`,
    DROP COLUMN `flowerId`,
    DROP COLUMN `freshQuantity`,
    DROP COLUMN `wiltedQuantity`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `ticketId` INTEGER NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `sale_transactions`;

-- CreateTable
CREATE TABLE `sale_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `quality` ENUM('Fresca', 'Marchita') NOT NULL,
    `saleDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `flowerId` INTEGER NOT NULL,
    `outputId` INTEGER NOT NULL,
    `productId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adjust_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DOUBLE NULL,
    `quantity` INTEGER NULL,
    `type` ENUM('Incremento', 'Decremento', 'Precio') NOT NULL,
    `adjustDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `flowerId` INTEGER NOT NULL,
    `adjustInventoryId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_flowerId_fkey` FOREIGN KEY (`flowerId`) REFERENCES `flowers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_outputId_fkey` FOREIGN KEY (`outputId`) REFERENCES `outputs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adjust_transaction` ADD CONSTRAINT `adjust_transaction_flowerId_fkey` FOREIGN KEY (`flowerId`) REFERENCES `flowers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adjust_transaction` ADD CONSTRAINT `adjust_transaction_adjustInventoryId_fkey` FOREIGN KEY (`adjustInventoryId`) REFERENCES `inventory_adjustments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
