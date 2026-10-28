<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink to="/expenses" class="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h2 class="text-lg font-bold text-slate-900">Edit Transaction</h2>
      </div>

      <!-- Delete Trigger Button -->
      <button
        v-if="expense"
        type="button"
        class="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
        @click="showDeleteConfirm = true"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Delete</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center text-xs text-slate-500">
      Loading transaction details...
    </div>

    <!-- Not Found State -->
    <div v-else-if="!expense" class="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
      <p class="text-sm font-semibold text-slate-800">Transaction not found</p>
      <p class="text-xs text-slate-500 mt-1">This record may have already been removed.</p>
      <NuxtLink to="/expenses" class="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
        Return to history
      </NuxtLink>
    </div>

    <!-- Edit Form -->
    <ExpenseForm
      v-else
      :initial-data="expense"
      submit-label="Update Transaction"
      @save="handleUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
        <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div class="text-center space-y-1">
          <h3 class="text-sm font-bold text-slate-900">Delete this transaction?</h3>
          <p class="text-xs text-slate-500">
            This will remove the transaction from your active list and record an offline tombstone for server synchronization.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            @click="handleDelete"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenses } from '~/composables/useExpenses'
import type { Expense } from '~/utils/expense-db'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id)
const { getExpense, updateExpense, deleteExpense } = useExpenses()

const expense = ref<Expense | undefined>()
const loading = ref(true)
const showDeleteConfirm = ref(false)

onMounted(async () => {
  try {
    expense.value = await getExpense(id)
  } finally {
    loading.value = false
  }
})

async function handleUpdate(payload: Parameters<typeof updateExpense>[1]) {
  try {
    await updateExpense(id, payload)
    router.push('/expenses')
  } catch (err) {
    console.error('Failed to update expense:', err)
  }
}

async function handleDelete() {
  try {
    await deleteExpense(id)
    showDeleteConfirm.value = false
    router.push('/expenses')
  } catch (err) {
    console.error('Failed to delete expense:', err)
  }
}
</script>
