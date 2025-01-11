/*
  Warnings:

  - The values [Normal,Salida,Perdida] on the enum `adjust_transaction_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `adjust_transaction` MODIFY `type` ENUM('Fresca', 'Marchita') NULL;
