/*
  Warnings:

  - You are about to drop the column `amount` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Flower` table. All the data in the column will be lost.
  - The values [Pedido] on the enum `Ticket_type` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `freshQuantity` to the `Flower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wiltedQuantity` to the `Flower` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Flower` DROP COLUMN `amount`,
    DROP COLUMN `status`,
    ADD COLUMN `freshQuantity` INTEGER NOT NULL,
    ADD COLUMN `wiltedQuantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Ticket` MODIFY `type` ENUM('Encargado', 'En_Camino', 'Entregado') NOT NULL;
