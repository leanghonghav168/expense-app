-- CreateTable
CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_occurredAt_idx" ON "Expense"("occurredAt");

-- CreateIndex
CREATE INDEX "Expense_updatedAt_idx" ON "Expense"("updatedAt");
