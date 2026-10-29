<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <!-- Transaction Type Toggle -->
    <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
      <button
        type="button"
        class="py-2 text-xs font-semibold rounded-lg transition-all"
        :class="form.type === 'expense' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'"
        @click="setType('expense')"
      >
        Expense (−)
      </button>
      <button
        type="button"
        class="py-2 text-xs font-semibold rounded-lg transition-all"
        :class="form.type === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'"
        @click="setType('income')"
      >
        Income (+)
      </button>
    </div>

    <!-- Main Card -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      
      <!-- Amount & Currency -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Amount</label>
        <div class="relative flex items-center">
          <span class="absolute left-3 text-base font-bold text-slate-400">
            {{ form.currency === 'USD' ? '$' : '៛' }}
          </span>
          <input
            v-model.number="form.amount"
            type="number"
            step="any"
            min="0.01"
            required
            placeholder="0.00"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-20 py-2.5 text-base font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <div class="absolute right-1">
            <select
              v-model="form.currency"
              class="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg py-1.5 px-2 focus:outline-none"
            >
              <option value="KHR">KHR (៛)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Title / Description</label>
        <input
          v-model="form.title"
          type="text"
          required
          placeholder="e.g. Coffee, Lunch with client, Freelance project"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <!-- Category (Dynamic from useCategories) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Category</label>
        <div v-if="availableCategories.length === 0" class="space-y-1.5">
          <input
            v-model="form.category"
            type="text"
            required
            placeholder="Type a category name (e.g. Food, Salary)..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <p class="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>No preset categories yet.</span>
            <NuxtLink to="/settings" class="text-emerald-700 font-bold hover:underline">
              Manage in Settings →
            </NuxtLink>
          </p>
        </div>
        <select
          v-else
          v-model="form.category"
          required
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          <option
            v-for="cat in availableCategories"
            :key="cat.id"
            :value="cat.name"
          >
            {{ cat.icon || '🏷️' }} {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Transaction Date -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
        <input
          v-model="form.date"
          type="date"
          required
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Error message if any -->
    <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
      {{ errorMessage }}
    </div>

    <!-- Buttons -->
    <div class="flex items-center gap-3 pt-1">
      <NuxtLink
        to="/"
        class="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs text-center transition-all"
      >
        Cancel
      </NuxtLink>
      
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-2 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        :class="form.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'"
      >
        <span>{{ isSubmitting ? 'Saving...' : submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import type { Expense } from '~/utils/expense-db'

const props = withDefaults(
  defineProps<{
    initialData?: Partial<Expense>
    submitLabel?: string
  }>(),
  {
    initialData: () => ({}),
    submitLabel: 'Save Transaction'
  }
)

const emit = defineEmits<{
  (e: 'save', payload: {
    title: string
    amount: number
    currency: 'USD' | 'KHR'
    type: 'income' | 'expense'
    category: string
    occurredAt: string
  }): void
}>()

const { categories, expenseCategories, incomeCategories, refresh: refreshCategories } = useCategories()
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  title: props.initialData.title || '',
  amount: props.initialData.amount || ('' as unknown as number),
  currency: (props.initialData.currency || 'KHR') as 'USD' | 'KHR',
  type: (props.initialData.type || 'expense') as 'income' | 'expense',
  category: props.initialData.category || '',
  date: props.initialData.occurredAt
    ? props.initialData.occurredAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10)
})

onMounted(async () => {
  await refreshCategories()
  if (!form.category) {
    setDefaultCategoryForType(form.type)
  }
})

const availableCategories = computed(() => {
  return form.type === 'income' ? incomeCategories.value : expenseCategories.value
})

function setDefaultCategoryForType(type: 'income' | 'expense') {
  const list = type === 'income' ? incomeCategories.value : expenseCategories.value
  if (list.length > 0) {
    form.category = list[0].name
  }
}

function setType(type: 'income' | 'expense') {
  form.type = type
  setDefaultCategoryForType(type)
}

function submitForm() {
  errorMessage.value = ''
  if (!form.title.trim()) {
    errorMessage.value = 'Please provide a title or description.'
    return
  }
  const num = Number(form.amount)
  if (isNaN(num) || num <= 0) {
    errorMessage.value = 'Amount must be greater than zero.'
    return
  }
  if (!form.category) {
    errorMessage.value = 'Please select a category.'
    return
  }

  isSubmitting.value = true
  emit('save', {
    title: form.title.trim(),
    amount: num,
    currency: form.currency,
    type: form.type,
    category: form.category,
    occurredAt: new Date(form.date).toISOString()
  })
}
</script>
