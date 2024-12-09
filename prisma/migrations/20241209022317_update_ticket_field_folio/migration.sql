/*
  Warnings:

  - A unique constraint covering the columns `[folio]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tickets_folio_key` ON `tickets`(`folio`);
