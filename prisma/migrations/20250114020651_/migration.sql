-- DropIndex
DROP INDEX `sale_transaction_outputId_fkey` ON `sale_transaction`;

-- AlterTable
ALTER TABLE `sale_transaction` ADD COLUMN `priceIndividual` DOUBLE NULL;
