import { expenseDb, type Expense, type Category } from '~/utils/expense-db'
import { useExpenses } from '~/composables/useExpenses'
import { useCategories } from '~/composables/useCategories'

export function useSync() {
  const isSyncing = ref(false)
  const lastSyncError = ref<string | null>(null)
  const lastSyncedAt = ref<string | null>(null)

  const { refresh: refreshExpenses } = useExpenses()
  const { refresh: refreshCategories } = useCategories()
  const token = useCookie<string | null>('auth_token')

  async function sync() {
    if (!import.meta.client || isSyncing.value) return
    isSyncing.value = true
    lastSyncError.value = null

    try {
      // 1. Read lastPulledAt from local IndexedDB
      const meta = await expenseDb.syncMeta.get('lastPulledAt')
      const lastPulledAt = meta?.value || null

      // 2. Collect unsynced local expenses & categories (including tombstones)
      const unsyncedExpenses = await expenseDb.expenses.filter(e => !e.synced).toArray()
      const unsyncedCategories = await expenseDb.categories.filter(c => !c.synced).toArray()

      // 3. Send to Server Sync API
      const response = await $fetch<{
        success: boolean
        serverTime: string
        serverExpenses: Expense[]
        serverCategories: Category[]
      }>('/api/sync', {
        method: 'POST',
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
        body: {
          lastPulledAt,
          clientExpenses: unsyncedExpenses.map(e => ({
            id: e.id,
            title: e.title,
            amount: Number(e.amount),
            currency: e.currency,
            type: e.type,
            category: e.category,
            occurredAt: e.occurredAt,
            updatedAt: e.updatedAt,
            deletedAt: e.deletedAt || null
          })),
          clientCategories: unsyncedCategories.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: c.icon || null,
            color: c.color || null,
            isDefault: c.isDefault,
            updatedAt: c.updatedAt,
            deletedAt: c.deletedAt || null
          }))
        }
      })

      if (response.success) {
        // 4. Mark uploaded items as synced locally
        await expenseDb.transaction('rw', [expenseDb.expenses, expenseDb.categories, expenseDb.syncMeta], async () => {
          // Mark client uploaded items as synced
          for (const exp of unsyncedExpenses) {
            await expenseDb.expenses.update(exp.id, { synced: true })
          }
          for (const cat of unsyncedCategories) {
            await expenseDb.categories.update(cat.id, { synced: true })
          }

          // Merge server expenses into local IndexedDB
          for (const sExp of response.serverExpenses) {
            const local = await expenseDb.expenses.get(sExp.id)
            if (!local || sExp.updatedAt >= local.updatedAt) {
              await expenseDb.expenses.put({
                ...sExp,
                synced: true
              })
            }
          }

          // Merge server categories into local IndexedDB
          for (const sCat of response.serverCategories) {
            const local = await expenseDb.categories.get(sCat.id)
            if (!local || sCat.updatedAt >= local.updatedAt) {
              await expenseDb.categories.put({
                ...sCat,
                synced: true
              })
            }
          }

          // Save lastPulledAt
          await expenseDb.syncMeta.put({
            key: 'lastPulledAt',
            value: response.serverTime
          })
        })

        lastSyncedAt.value = response.serverTime
        await Promise.all([refreshExpenses(), refreshCategories()])
      }
    } catch (err: any) {
      console.error('Synchronization failed:', err)
      lastSyncError.value = err?.data?.statusMessage || err?.message || 'Sync failed'
    } finally {
      isSyncing.value = false
    }
  }

  return {
    isSyncing,
    lastSyncError,
    lastSyncedAt,
    sync
  }
}
