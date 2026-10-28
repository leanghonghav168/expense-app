import { expenseDb, type Expense } from '~/utils/expense-db'

export interface ExpenseFilters {
  currency?: 'USD' | 'KHR' | 'ALL'
  type?: 'income' | 'expense' | 'ALL'
  category?: string
  startDate?: string
  endDate?: string
  search?: string
}

export function useExpenses() {
  const expenses = ref<Expense[]>([])
  const loading = ref(false)
  const pendingSyncCount = ref(0)

  async function updatePendingCount() {
    if (!import.meta.client) return
    const unsyncedExpenses = await expenseDb.expenses.filter(tx => !tx.synced).count()
    const unsyncedCategories = await expenseDb.categories.filter(c => !c.synced).count()
    pendingSyncCount.value = unsyncedExpenses + unsyncedCategories
  }

  async function refresh() {
    if (!import.meta.client) return
    loading.value = true

    try {
      expenses.value = await expenseDb.expenses
        .filter(expense => !expense.deletedAt)
        .toArray()

      expenses.value.sort((a, b) =>
        b.occurredAt.localeCompare(a.occurredAt)
      )

      await updatePendingCount()
    } finally {
      loading.value = false
    }
  }

  async function getExpense(id: string): Promise<Expense | undefined> {
    if (!import.meta.client) return undefined
    const tx = await expenseDb.expenses.get(id)
    if (!tx || tx.deletedAt) return undefined
    return tx
  }

  async function addExpense(
    input: Omit<Expense, 'id' | 'updatedAt' | 'synced' | 'deletedAt'>
  ) {
    const now = new Date().toISOString()

    const expense: Expense = {
      ...input,
      id: crypto.randomUUID(),
      updatedAt: now,
      synced: false
    }

    await expenseDb.expenses.put(expense)
    await refresh()
    return expense
  }

  async function updateExpense(
    id: string,
    input: Partial<Omit<Expense, 'id' | 'updatedAt' | 'synced' | 'deletedAt'>>
  ) {
    const existing = await expenseDb.expenses.get(id)
    if (!existing) throw new Error('Transaction not found')

    const now = new Date().toISOString()
    const updated: Expense = {
      ...existing,
      ...input,
      updatedAt: now,
      synced: false
    }

    await expenseDb.expenses.put(updated)
    await refresh()
    return updated
  }

  // Soft delete with tombstone for offline sync reliability
  async function deleteExpense(id: string) {
    const existing = await expenseDb.expenses.get(id)
    if (!existing) return

    const now = new Date().toISOString()
    await expenseDb.expenses.update(id, {
      deletedAt: now,
      updatedAt: now,
      synced: false
    })

    await refresh()
  }

  return {
    expenses,
    loading,
    pendingSyncCount,
    refresh,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense
  }
}