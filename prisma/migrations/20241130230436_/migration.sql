/*
  Warnings:

  - You are about to drop the column `fresh_sale` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `min_amount` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `wilted_sale` on the `Flower` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Flower` DROP COLUMN `fresh_sale`,
    DROP COLUMN `min_amount`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `wilted_sale`,
    ADD COLUMN `type` ENUM('Compra', 'Venta') NOT NULL DEFAULT 'Compra',
    MODIFY `price` DOUBLE NULL,
    MODIFY `freshQuantity` INTEGER NULL,
    MODIFY `wiltedQuantity` INTEGER NULL,
    MODIFY `revenue` DOUBLE NULL;

-- AlterTable
ALTER TABLE `FlowerCategory` ADD COLUMN `min_amount` INTEGER NULL;
