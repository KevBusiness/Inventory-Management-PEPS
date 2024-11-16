/*
  Warnings:

  - The values [available,sold] on the enum `Flower_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `flowerCategoryId` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Made the column `amount` on table `Flower` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Flower` ADD COLUMN `Amount_sell` INTEGER NULL,
    ADD COLUMN `flowerCategoryId` INTEGER NOT NULL,
    ADD COLUMN `min_amount` INTEGER NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('Marchitas', 'Frescas', 'Vendidas') NOT NULL,
    MODIFY `amount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('ADMIN', 'OWNER') NOT NULL;

-- CreateTable
CREATE TABLE `FlowerCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Flower` ADD CONSTRAINT `Flower_flowerCategoryId_fkey` FOREIGN KEY (`flowerCategoryId`) REFERENCES `FlowerCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
