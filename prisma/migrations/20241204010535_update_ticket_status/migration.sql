/*
  Warnings:

  - The values [Encargado,Procesado] on the enum `tickets_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `tickets` MODIFY `status` ENUM('Pedido', 'Disponible', 'Agotado') NOT NULL;
