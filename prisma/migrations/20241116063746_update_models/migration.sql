/*
  Warnings:

  - You are about to drop the column `name` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Flower` table. All the data in the column will be lost.
  - The values [normal,venta] on the enum `Ticket_type` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `status` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Flower` DROP COLUMN `name`,
    DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `status` ENUM('Abierto', 'Cerrado') NOT NULL,
    MODIFY `type` ENUM('Normal', 'Venta') NOT NULL;
