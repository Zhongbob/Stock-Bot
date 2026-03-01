/*
  Warnings:

  - A unique constraint covering the columns `[telegramGroupId,symbol]` on the table `TrackedStock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegramGroupId,threadId]` on the table `TrackedStock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TrackedStock_telegramGroupId_symbol_threadId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TrackedStock_telegramGroupId_symbol_key" ON "TrackedStock"("telegramGroupId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedStock_telegramGroupId_threadId_key" ON "TrackedStock"("telegramGroupId", "threadId");
