<template>
  <div class="space-y-4">
    <!-- Top Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Transactions</h2>
        <p class="text-xs text-slate-500">History, search, and editing</p>
      </div>

      <NuxtLink
        to="/expenses/new"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
      >
        <span>+ Add</span>
      </NuxtLink>
    </div>

    <!-- Filter Bar Card -->
    <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
      <!-- Search Input -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title..."
            class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          v-model="currencyFilter"
          class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="ALL">All Currency</option>
          <option value="KHR">KHR (៛)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      <!-- Advanced Filters Toggle & Type Pills -->
      <div class="flex items-center justify-between gap-2 pt-1">
        <!-- Type Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            v-for="t in ['ALL', 'expense', 'income']"
            :key="t"
            type="button"
            class="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all"
            :class="typeFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="typeFilter = t"
          >
            {{ t === 'ALL' ? 'All Types' : t }}
          </button>
        </div>

        <!-- Toggle Date & Category Filter Expand -->
        <button
          type="button"
          class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          @click="showMoreFilters = !showMoreFilters"
        >
          <span>{{ showMoreFilters ? 'Less filters' : 'More filters' }}</span>
          <svg class="w-3.5 h-3.5 transform transition-transform" :class="{ 'rotate-180': showMoreFilters }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Expanded Filters -->
      <div v-if="showMoreFilters" class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Category</label>
          <select
            v-model="categoryFilter"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Start Date</label>
          <input
            v-model="startDateFilter"
            type="date"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.8 text-xs text-slate-700 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Transaction List -->
    <div v-if="loading" class="py-12 text-center text-xs text-slate-500">
      Loading transactions...
    </div>

    <div v-else-if="filteredList.length === 0" class="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
      <div class="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-800">No matching transactions</p>
      <p class="text-xs text-slate-500 mt-1">Try clearing your search query or filters.</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="tx in filteredList"
        :key="tx.id"
        :to="`/expenses/${tx.id}`"
        class="block bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:border-slate-300 active:scale-99 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              ]"
            >
              {{ tx.type === 'income' ? '+' : '−' }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900 leading-snug">{{ tx.title }}</p>
              <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span class="px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-medium">{{ tx.category }}</span>
                <span>•</span>
                <span>{{ tx.occurredAt.slice(0, 10) }}</span>
              </div>
            </div>
          </div>

          <div class="text-right">
            <CurrencyAmount
              :amount="tx.amount"
              :currency="tx.currency"
              :type="tx.type"
              :show-sign="true"
              :colorize="true"
              class="text-sm"
            />
            <div class="mt-0.5">
              <span
                v-if="!tx.synced"
                class="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold"
              >
                Local / Unsynced
              </span>
              <span
                v-else
                class="inline-block px-1.5 py-0.2 rounded bg-slate-50 text-slate-400 text-[9px] font-medium"
              >
                Synced
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenses } from '~/composables/useExpenses'
import { useCategories } from '~/composables/useCategories'

const { expenses, loading, refresh } = useExpenses()
const { categories, refresh: refreshCategories } = useCategories()

const searchQuery = ref('')
const currencyFilter = ref<'ALL' | 'USD' | 'KHR'>('ALL')
const typeFilter = ref<string>('ALL')
const categoryFilter = ref<string>('ALL')
const startDateFilter = ref<string>('')
const showMoreFilters = ref(false)

onMounted(async () => {
  await Promise.all([refresh(), refreshCategories()])
})

const filteredList = computed(() => {
  return expenses.value.filter(tx => {
    if (currencyFilter.value !== 'ALL' && tx.currency !== currencyFilter.value) return false
    if (typeFilter.value !== 'ALL' && tx.type !== typeFilter.value) return false
    if (categoryFilter.value !== 'ALL' && tx.category !== categoryFilter.value) return false
    if (startDateFilter.value && tx.occurredAt < startDateFilter.value) return false
    if (searchQuery.value.trim() && !tx.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    return true
  })
})
</script>
