-- CreateTable
CREATE TABLE "TelegramGroup" (
    "id" SERIAL NOT NULL,
    "telegramGroupId" BIGINT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackedStock" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "telegramGroupId" BIGINT NOT NULL,
    "threadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramGroup_telegramGroupId_key" ON "TelegramGroup"("telegramGroupId");

-- CreateIndex
CREATE INDEX "TelegramGroup_telegramGroupId_idx" ON "TelegramGroup"("telegramGroupId");

-- CreateIndex
CREATE INDEX "TrackedStock_telegramGroupId_idx" ON "TrackedStock"("telegramGroupId");

-- CreateIndex
CREATE INDEX "TrackedStock_symbol_idx" ON "TrackedStock"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedStock_telegramGroupId_symbol_threadId_key" ON "TrackedStock"("telegramGroupId", "symbol", "threadId");

-- AddForeignKey
ALTER TABLE "TrackedStock" ADD CONSTRAINT "TrackedStock_telegramGroupId_fkey" FOREIGN KEY ("telegramGroupId") REFERENCES "TelegramGroup"("telegramGroupId") ON DELETE CASCADE ON UPDATE CASCADE;
