import Dexie, { type Table } from 'dexie'

export interface Expense {
  id: string
  title: string
  amount: number
  currency: 'USD' | 'KHR'
  type: 'income' | 'expense'
  category: string
  occurredAt: string
  updatedAt: string
  deletedAt?: string
  synced: boolean
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  synced: boolean
}

export interface SyncMeta {
  key: string
  value: string
}

// export const DEFAULT_CATEGORIES: Array<{
//   name: string
//   type: 'income' | 'expense'
//   icon: string
//   color: string
// }> 

class ExpenseDatabase extends Dexie {
  expenses!: Table<Expense, string>
  categories!: Table<Category, string>
  syncMeta!: Table<SyncMeta, string>

  constructor() {
    super('personal-expense-tracker')

    this.version(1).stores({
      expenses: 'id, occurredAt, type, category, synced'
    })

    this.version(2).stores({
      expenses: 'id, occurredAt, type, category, synced, updatedAt, deletedAt',
      categories: 'id, name, type, synced, updatedAt, deletedAt',
      syncMeta: 'key'
    })
  }
}

export const expenseDb = new ExpenseDatabase()