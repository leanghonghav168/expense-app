<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-xl font-bold text-slate-900">Settings & Categories</h2>
      <p class="text-xs text-slate-500">Manage categories, storage, and PWA setup</p>
    </div>

    <!-- Category Management Section -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Categories</h3>
        <button
          type="button"
          class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
          @click="openAddCategoryModal"
        >
          <span>+ Add Category</span>
        </button>
      </div>

      <!-- Type Filter Tabs -->
      <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          class="py-1.5 rounded-lg transition-all"
          :class="categoryTab === 'expense' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'"
          @click="categoryTab = 'expense'"
        >
          Expense Categories ({{ expenseCategories.length }})
        </button>
        <button
          type="button"
          class="py-1.5 rounded-lg transition-all"
          :class="categoryTab === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'"
          @click="categoryTab = 'income'"
        >
          Income Categories ({{ incomeCategories.length }})
        </button>
      </div>

      <!-- Categories List -->
      <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="cat in activeCategoryList"
          :key="cat.id"
          class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs hover:border-slate-300 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-base leading-none">{{ cat.icon || '🏷️' }}</span>
            <div>
              <p class="font-semibold text-slate-900">{{ cat.name }}</p>
              <span v-if="cat.isDefault" class="text-[10px] text-slate-400 font-medium">Default</span>
              <span v-else class="text-[10px] text-emerald-600 font-medium">Custom</span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60"
              title="Edit"
              @click="openEditCategoryModal(cat)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <button
              type="button"
              class="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50"
              title="Delete Category"
              @click="promptDeleteCategory(cat)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- iPhone PWA Installation Guide -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
      <div class="flex items-center gap-2 text-emerald-900 font-bold text-sm">
        <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>Install on iPhone (Safari)</span>
      </div>
      <ol class="text-xs text-emerald-800 space-y-1.5 list-decimal list-inside leading-relaxed">
        <li>Open this site in <strong>Apple Safari</strong> on your iPhone.</li>
        <li>Tap the <strong>Share</strong> icon (square with arrow pointing up) at the bottom toolbar.</li>
        <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
        <li>Tap <strong>"Add"</strong> in the top-right corner to install as a standalone app.</li>
      </ol>
      <p class="text-[11px] text-emerald-700 font-medium pt-1">
        ✓ Works completely offline using local IndexedDB storage.
      </p>
    </div>

    <!-- PostgreSQL Database & Sync Card -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">PostgreSQL Database Sync</h3>
        <button
          type="button"
          :disabled="isSyncing || !isOnline"
          class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          @click="sync"
        >
          <svg
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin': isSyncing }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ isSyncing ? 'Syncing...' : 'Sync to PostgreSQL' }}</span>
        </button>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-600">Database Engine</span>
          <span class="font-semibold text-slate-900">PostgreSQL (Local / VPS)</span>
        </div>
        <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-600">Sync Status</span>
          <span :class="pendingSyncCount > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'">
            {{ pendingSyncCount > 0 ? `${pendingSyncCount} pending upload` : 'Up to date' }}
          </span>
        </div>
        <div class="flex items-center justify-between py-1.5">
          <span class="text-slate-600">Last Synced</span>
          <span class="text-slate-500 font-medium">
            {{ lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never synced yet' }}
          </span>
        </div>
        <div v-if="lastSyncError" class="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-medium">
          Sync error: {{ lastSyncError }}
        </div>
      </div>
    </div>

    <!-- Local Storage Diagnostics -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Local IndexedDB</h3>
      
      <div class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
        <span class="text-slate-600">Active Transactions</span>
        <span class="font-semibold text-slate-900">{{ expenses.length }}</span>
      </div>

      <div class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
        <span class="text-slate-600">Unsynced Local Changes</span>
        <span class="font-semibold text-amber-600">{{ pendingSyncCount }}</span>
      </div>

      <div class="flex items-center justify-between py-2 text-xs">
        <span class="text-slate-600">Storage Engine</span>
        <span class="font-semibold text-slate-900">IndexedDB (Dexie v4)</span>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div
      v-if="showCategoryModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
        <h3 class="text-sm font-bold text-slate-900">
          {{ editingCategory ? 'Edit Category' : 'Create Category' }}
        </h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Name</label>
            <input
              v-model="catForm.name"
              type="text"
              required
              placeholder="e.g. Gym, Pet Care, Bonuses"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Emoji Icon</label>
              <input
                v-model="catForm.icon"
                type="text"
                placeholder="🏷️"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Type</label>
              <select
                v-model="catForm.type"
                :disabled="!!editingCategory"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            @click="showCategoryModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            @click="saveCategory"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Safe Delete Category with Reassignment Modal -->
    <div
      v-if="showDeleteCategoryModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
        <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div class="text-center space-y-1">
          <h3 class="text-sm font-bold text-slate-900">Delete Category "{{ deletingCat?.name }}"?</h3>
          <p v-if="affectedTransactionCount > 0" class="text-xs text-rose-600 font-semibold">
            Warning: {{ affectedTransactionCount }} transaction(s) currently use this category!
          </p>
          <p class="text-xs text-slate-500">
            {{ affectedTransactionCount > 0 ? 'Select a replacement category to safely reassign those transactions before deleting.' : 'This category is not used by any transaction and can be removed safely.' }}
          </p>
        </div>

        <div v-if="affectedTransactionCount > 0" class="text-xs">
          <label class="block font-semibold text-slate-700 mb-1">Reassign To</label>
          <select
            v-model="reassignTargetName"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option
              v-for="cat in availableReassignTargets"
              :key="cat.id"
              :value="cat.name"
            >
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            @click="showDeleteCategoryModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            @click="confirmDeleteCategory"
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
import { useCategories } from '~/composables/useCategories'
import { useSync } from '~/composables/useSync'
import { useNetwork } from '~/composables/useNetwork'
import type { Category } from '~/utils/expense-db'

const { expenses, pendingSyncCount, refresh: refreshExpenses } = useExpenses()
const { isOnline } = useNetwork()
const { sync, isSyncing, lastSyncedAt, lastSyncError } = useSync()
const {
  categories,
  expenseCategories,
  incomeCategories,
  refresh: refreshCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  countTransactionsUsingCategory
} = useCategories()

const categoryTab = ref<'expense' | 'income'>('expense')

onMounted(async () => {
  await Promise.all([refreshExpenses(), refreshCategories()])
})

const activeCategoryList = computed(() => {
  return categoryTab.value === 'expense' ? expenseCategories.value : incomeCategories.value
})

// Modal states
const showCategoryModal = ref(false)
const editingCategory = ref<Category | null>(null)
const catForm = reactive({
  name: '',
  icon: '🏷️',
  type: 'expense' as 'expense' | 'income'
})

function openAddCategoryModal() {
  editingCategory.value = null
  catForm.name = ''
  catForm.icon = categoryTab.value === 'income' ? '💵' : '🍔'
  catForm.type = categoryTab.value
  showCategoryModal.value = true
}

function openEditCategoryModal(cat: Category) {
  editingCategory.value = cat
  catForm.name = cat.name
  catForm.icon = cat.icon || '🏷️'
  catForm.type = cat.type
  showCategoryModal.value = true
}

async function saveCategory() {
  if (!catForm.name.trim()) return

  if (editingCategory.value) {
    await updateCategory(editingCategory.value.id, {
      name: catForm.name.trim(),
      icon: catForm.icon.trim() || '🏷️'
    })
  } else {
    await addCategory({
      name: catForm.name.trim(),
      icon: catForm.icon.trim() || '🏷️',
      type: catForm.type
    })
  }
  showCategoryModal.value = false
  await refreshExpenses()
}

// Delete logic with reassignment
const showDeleteCategoryModal = ref(false)
const deletingCat = ref<Category | null>(null)
const affectedTransactionCount = ref(0)
const reassignTargetName = ref('')

const availableReassignTargets = computed(() => {
  if (!deletingCat.value) return []
  return categories.value.filter(c => c.id !== deletingCat.value?.id && c.type === deletingCat.value?.type)
})

async function promptDeleteCategory(cat: Category) {
  deletingCat.value = cat
  affectedTransactionCount.value = await countTransactionsUsingCategory(cat.name)
  const targets = availableReassignTargets.value
  reassignTargetName.value = targets.length > 0 ? targets[0].name : ''
  showDeleteCategoryModal.value = true
}

async function confirmDeleteCategory() {
  if (!deletingCat.value) return
  try {
    await deleteCategory(
      deletingCat.value.id,
      affectedTransactionCount.value > 0 ? reassignTargetName.value : undefined
    )
    showDeleteCategoryModal.value = false
    await refreshExpenses()
  } catch (err) {
    console.error('Failed to delete category:', err)
  }
}
</script>
