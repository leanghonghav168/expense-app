<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Reports</h2>
        <p class="text-xs text-slate-500">Breakdown by category and month</p>
      </div>

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

    <!-- Category Breakdown Card -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Expense by Category</h3>
      
      <div v-if="categoryTotals.length === 0" class="py-6 text-center text-xs text-slate-500">
        No expense data recorded in {{ activeCurrency }}.
      </div>

      <div v-else class="space-y-2.5">
        <div v-for="cat in categoryTotals" :key="cat.name" class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-800">{{ cat.name }}</span>
            <span class="font-bold text-slate-900">{{ formatCurrency(cat.amount, activeCurrency) }} ({{ cat.percentage }}%)</span>
          </div>
          <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              class="bg-emerald-600 h-full rounded-full transition-all duration-300"
              :style="{ width: `${cat.percentage}%` }"
            />
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

const filteredExpenses = computed(() => {
  return expenses.value.filter(tx => tx.currency === activeCurrency.value && tx.type === 'expense')
})

const totalExpenseAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, tx) => sum + Number(tx.amount), 0)
})

const categoryTotals = computed(() => {
  const map = new Map<string, number>()
  for (const tx of filteredExpenses.value) {
    map.set(tx.category, (map.get(tx.category) || 0) + Number(tx.amount))
  }

  const total = totalExpenseAmount.value || 1
  return Array.from(map.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / total) * 100)
    }))
    .sort((a, b) => b.amount - a.amount)
})

function formatCurrency(amount: number, currency: 'USD' | 'KHR') {
  if (currency === 'KHR') {
    return new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
}
</script>
