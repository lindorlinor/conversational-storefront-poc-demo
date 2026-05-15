-- CreateTable
CREATE TABLE "SystemPrompt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemPrompt_shop_key" ON "SystemPrompt"("shop");
