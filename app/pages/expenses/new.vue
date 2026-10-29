<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <NuxtLink to="/" class="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h2 class="text-lg font-bold text-slate-900">New Transaction</h2>
    </div>

    <!-- Reusable Form -->
    <ExpenseForm
      :initial-data="{ type: initialType }"
      submit-label="Save Transaction"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { useExpenses } from '~/composables/useExpenses'
import { useCategories } from '~/composables/useCategories'
import { useSync } from '~/composables/useSync'
import { useNetwork } from '~/composables/useNetwork'

const route = useRoute()
const router = useRouter()
const { addExpense } = useExpenses()
const { categories, addCategory, refresh: refreshCategories } = useCategories()
const { sync } = useSync()
const { isOnline } = useNetwork()

onMounted(async () => {
  await refreshCategories()
})

const initialType = computed(() => (route.query.type === 'income' ? 'income' : 'expense'))

async function handleSave(payload: Parameters<typeof addExpense>[0]) {
  try {
    // If entered category doesn't exist yet, auto-create it
    const existingCat = categories.value.find(c => c.name.toLowerCase() === payload.category.toLowerCase())
    if (!existingCat) {
      await addCategory({
        name: payload.category,
        type: payload.type,
        icon: payload.type === 'income' ? '💰' : '📦'
      })
    }

    await addExpense(payload)

    // Instantly sync to PostgreSQL if connected
    if (isOnline.value) {
      sync()
    }

    router.push('/')
  } catch (err) {
    console.error('Failed to save expense:', err)
  }
}
</script>
