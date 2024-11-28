-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `fase` ENUM('Pedido', 'Preparacion', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Pedido',
    MODIFY `status` ENUM('Disponible', 'Vendido', 'Bajo') NOT NULL DEFAULT 'Disponible';
