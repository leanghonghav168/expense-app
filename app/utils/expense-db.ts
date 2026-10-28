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

export const DEFAULT_CATEGORIES: Array<{
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}> = [
  // Expense
  { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#f97316' },
  { name: 'Groceries', type: 'expense', icon: '🛒', color: '#10b981' },
  { name: 'Transportation', type: 'expense', icon: '🚗', color: '#3b82f6' },
  { name: 'Housing & Utilities', type: 'expense', icon: '🏠', color: '#8b5cf6' },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#ec4899' },
  { name: 'Health & Medical', type: 'expense', icon: '💊', color: '#ef4444' },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#f59e0b' },
  { name: 'General', type: 'expense', icon: '📦', color: '#64748b' },
  // Income
  { name: 'Salary', type: 'income', icon: '💵', color: '#16a34a' },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#0ea5e9' },
  { name: 'Investment', type: 'income', icon: '📈', color: '#6366f1' },
  { name: 'Gift', type: 'income', icon: '🎁', color: '#d946ef' },
  { name: 'Other Income', type: 'income', icon: '💰', color: '#14b8a6' }
]

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