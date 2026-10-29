<template>
  <div class="space-y-4">
    <!-- Top Greeting & Currency Switcher -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Dashboard</h2>
        <p class="text-xs text-slate-500">Track and manage your spending</p>
      </div>

      <!-- Currency View Filter -->
      <div class="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all"
          :class="activeCurrency === 'KHR' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'"
          @click="activeCurrency = 'KHR'"
        >
          KHR (៛)
        </button>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all"
          :class="activeCurrency === 'USD' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'"
          @click="activeCurrency = 'USD'"
        >
          USD ($)
        </button>
      </div>
    </div>

    <!-- Balance Summary Card -->
    <div class="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-4 shadow-md">
      <div class="flex items-center justify-between text-emerald-100 text-xs mb-1">
        <span>Total Remaining Balance</span>
        <span class="font-semibold uppercase tracking-wider">{{ activeCurrency }}</span>
      </div>
      <div class="text-3xl font-extrabold tracking-tight mb-4">
        {{ formatCurrency(netBalance, activeCurrency) }}
      </div>

      <div class="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-500/40">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-200">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-emerald-200 uppercase font-medium">Income</p>
            <p class="text-sm font-bold text-white">{{ formatCurrency(totalIncome, activeCurrency) }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-rose-500/30 flex items-center justify-center text-rose-200">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-rose-200 uppercase font-medium">Expenses</p>
            <p class="text-sm font-bold text-white">{{ formatCurrency(totalExpense, activeCurrency) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="grid grid-cols-2 gap-3">
      <NuxtLink
        to="/expenses/new?type=expense"
        class="flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-semibold text-sm transition-all active:scale-98"
      >
        <span class="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-base leading-none font-bold">−</span>
        <span>Add Expense</span>
      </NuxtLink>

      <NuxtLink
        to="/expenses/new?type=income"
        class="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm transition-all active:scale-98"
      >
        <span class="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-base leading-none font-bold">+</span>
        <span>Add Income</span>
      </NuxtLink>
    </div>

    <!-- Monthly & Daily Snapshot -->
    <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">Activity Snapshot</h3>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <p class="text-slate-500 font-medium">Today's Spend</p>
          <p class="text-base font-bold text-slate-900 mt-0.5">{{ formatCurrency(todaySpent, activeCurrency) }}</p>
        </div>
        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <p class="text-slate-500 font-medium">This Month</p>
          <p class="text-base font-bold text-slate-900 mt-0.5">{{ formatCurrency(monthSpent, activeCurrency) }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Header -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Recent Transactions</h3>
        <NuxtLink to="/expenses" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          View all →
        </NuxtLink>
      </div>

      <!-- Transaction List / Empty State -->
      <div v-if="filteredTransactions.length === 0" class="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-800">No transactions recorded yet</p>
        <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Tap "+ Add Expense" or "+ Add Income" above to log your first transaction.
        </p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="tx in filteredTransactions.slice(0, 5)"
          :key="tx.id"
          class="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-slate-300 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold',
                tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              ]"
            >
              {{ tx.type === 'income' ? '+' : '−' }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900 leading-snug">{{ tx.title }}</p>
              <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span class="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">{{ tx.category }}</span>
                <span>•</span>
                <span>{{ formatDate(tx.occurredAt) }}</span>
              </div>
            </div>
          </div>

          <div class="text-right">
            <p
              :class="[
                'text-sm font-bold',
                tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
              ]"
            >
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, tx.currency) }}
            </p>
            <span
              v-if="!tx.synced"
              class="inline-block text-[10px] text-amber-600 font-medium"
              title="Pending sync"
            >
              Offline
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenses } from '~/composables/useExpenses'

const activeCurrency = ref<'USD' | 'KHR'>('KHR')
const { expenses, refresh } = useExpenses()

onMounted(async () => {
  await refresh()
})

const filteredTransactions = computed(() => {
  return expenses.value.filter(tx => tx.currency === activeCurrency.value)
})

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
})

const totalExpense = computed(() => {
  return filteredTransactions.value
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
})

const netBalance = computed(() => {
  return totalIncome.value - totalExpense.value
})

const todaySpent = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10)
  return filteredTransactions.value
    .filter(tx => tx.type === 'expense' && tx.occurredAt.startsWith(todayStr))
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
})

const monthSpent = computed(() => {
  const monthStr = new Date().toISOString().slice(0, 7)
  return filteredTransactions.value
    .filter(tx => tx.type === 'expense' && tx.occurredAt.startsWith(monthStr))
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
})

function formatCurrency(amount: number, currency: 'USD' | 'KHR') {
  if (currency === 'KHR') {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'KHR',
      maximumFractionDigits: 0
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

function formatDate(isoDate: string) {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
