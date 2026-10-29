import { expenseDb, DEFAULT_CATEGORIES, type Category } from '~/utils/expense-db'

export function useCategories() {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  // Manual seeding only (no longer automatic on startup)
  async function seedDefaultCategories() {
    if (!import.meta.client) return
    const now = new Date().toISOString()
    const initial: Category[] = DEFAULT_CATEGORIES.map(cat => ({
      id: crypto.randomUUID(),
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      synced: false
    }))
    await expenseDb.categories.bulkPut(initial)
    await refresh()
  }

  async function refresh() {
    if (!import.meta.client) return
    loading.value = true
    try {
      const all = await expenseDb.categories
        .filter(c => !c.deletedAt)
        .toArray()

      categories.value = all.sort((a, b) => a.name.localeCompare(b.name))
    } finally {
      loading.value = false
    }
  }

  const expenseCategories = computed(() =>
    categories.value.filter(c => c.type === 'expense')
  )

  const incomeCategories = computed(() =>
    categories.value.filter(c => c.type === 'income')
  )

  async function addCategory(input: {
    name: string
    type: 'income' | 'expense'
    icon?: string
    color?: string
  }) {
    const now = new Date().toISOString()
    const category: Category = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      type: input.type,
      icon: input.icon || (input.type === 'income' ? '💰' : '📦'),
      color: input.color || '#16a34a',
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      synced: false
    }

    await expenseDb.categories.put(category)
    await refresh()
    return category
  }

  async function updateCategory(id: string, input: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) {
    const existing = await expenseDb.categories.get(id)
    if (!existing) throw new Error('Category not found')

    const now = new Date().toISOString()
    const updated: Category = {
      ...existing,
      ...input,
      updatedAt: now,
      synced: false
    }

    // If name changed, also update transactions that reference the old name
    if (input.name && input.name !== existing.name) {
      await expenseDb.transaction('rw', [expenseDb.categories, expenseDb.expenses], async () => {
        await expenseDb.categories.put(updated)
        const affected = await expenseDb.expenses.where('category').equals(existing.name).toArray()
        for (const tx of affected) {
          await expenseDb.expenses.update(tx.id, {
            category: input.name,
            updatedAt: now,
            synced: false
          })
        }
      })
    } else {
      await expenseDb.categories.put(updated)
    }

    await refresh()
    return updated
  }

  // Count active transactions using this category
  async function countTransactionsUsingCategory(categoryName: string): Promise<number> {
    const matches = await expenseDb.expenses
      .where('category')
      .equals(categoryName)
      .filter(tx => !tx.deletedAt)
      .count()
    return matches
  }

  // Safe deletion with reassignment
  async function deleteCategory(id: string, reassignToCategoryName?: string) {
    const cat = await expenseDb.categories.get(id)
    if (!cat) throw new Error('Category not found')

    const usageCount = await countTransactionsUsingCategory(cat.name)
    if (usageCount > 0 && !reassignToCategoryName) {
      throw new Error(`Category "${cat.name}" is used by ${usageCount} transaction(s). Please specify a replacement category.`)
    }

    const now = new Date().toISOString()

    await expenseDb.transaction('rw', [expenseDb.categories, expenseDb.expenses], async () => {
      // 1. Reassign affected transactions if any
      if (usageCount > 0 && reassignToCategoryName) {
        const affected = await expenseDb.expenses.where('category').equals(cat.name).toArray()
        for (const tx of affected) {
          await expenseDb.expenses.update(tx.id, {
            category: reassignToCategoryName,
            updatedAt: now,
            synced: false
          })
        }
      }

      // 2. Soft-delete category with tombstone
      await expenseDb.categories.update(id, {
        deletedAt: now,
        updatedAt: now,
        synced: false
      })
    })

    await refresh()
  }

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loading,
    refresh,
    seedDefaultCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    countTransactionsUsingCategory
  }
}
