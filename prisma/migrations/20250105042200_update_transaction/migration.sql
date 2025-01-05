-- DropForeignKey
ALTER TABLE `sale_transaction` DROP FOREIGN KEY `sale_transaction_outputId_fkey`;

-- AlterTable
ALTER TABLE `sale_transaction` MODIFY `flowerId` INTEGER NULL,
    MODIFY `outputId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_outputId_fkey` FOREIGN KEY (`outputId`) REFERENCES `outputs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
