-- CreateTable: TaskDeck join table for Task-Deck many-to-many relationship
CREATE TABLE "TaskDeck" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDeck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskDeck_taskId_deckId_key" ON "TaskDeck"("taskId", "deckId");

-- CreateIndex
CREATE INDEX "TaskDeck_taskId_idx" ON "TaskDeck"("taskId");

-- CreateIndex
CREATE INDEX "TaskDeck_deckId_idx" ON "TaskDeck"("deckId");

-- AddForeignKey
ALTER TABLE "TaskDeck" ADD CONSTRAINT "TaskDeck_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDeck" ADD CONSTRAINT "TaskDeck_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove prerequisites column from Task table (optional - can keep for backward compatibility)
-- ALTER TABLE "Task" DROP COLUMN "prerequisites";
