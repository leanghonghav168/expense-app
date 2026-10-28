<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-between">
    <!-- Mobile Shell: max-w-md centered for desktop preview, 100% on mobile -->
    <div class="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col relative shadow-sm border-x border-slate-200">
      
      <!-- Top Sticky Header -->
      <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-safe">
        <div class="h-14 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              $
            </div>
            <div>
              <h1 class="font-bold text-slate-900 leading-tight text-base">Expense Tracker</h1>
              <p class="text-[10px] text-slate-500 font-medium">Personal Finance PWA</p>
            </div>
          </NuxtLink>

          <!-- Status Indicators -->
          <div class="flex items-center gap-1.5">
            <!-- Unsynced Changes Badge / Sync Button -->
            <button
              v-if="pendingSyncCount > 0"
              type="button"
              :disabled="isSyncing || !isOnline"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
              title="Click to sync now with database"
              @click="sync"
            >
              <svg
                class="w-2.5 h-2.5"
                :class="{ 'animate-spin': isSyncing }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isSyncing ? 'Syncing...' : `${pendingSyncCount} sync` }}
            </button>

            <!-- Offline / Online Badge -->
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full',
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                ]"
              />
              {{ isOnline ? 'Online' : 'Offline' }}
            </span>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 pb-28 px-4 py-4">
        <slot />
      </main>

      <!-- Bottom Navigation Bar (iPhone Safe Area Aware) -->
      <nav class="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div class="max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 pointer-events-auto pb-safe">
          <div class="h-16 flex items-center justify-around px-2 relative">
            
            <!-- Home -->
            <NuxtLink
              to="/"
              class="flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors"
              :class="route.path === '/' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </NuxtLink>

            <!-- Transactions -->
            <NuxtLink
              to="/expenses"
              class="flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors"
              :class="route.path.startsWith('/expenses') && route.path !== '/expenses/new' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>History</span>
            </NuxtLink>

            <!-- Center Floating Add Button -->
            <div class="flex-1 flex justify-center -mt-6">
              <NuxtLink
                to="/expenses/new"
                class="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-all border-4 border-white"
                title="Add Transaction"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </NuxtLink>
            </div>

            <!-- Reports -->
            <NuxtLink
              to="/reports"
              class="flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors"
              :class="route.path === '/reports' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Reports</span>
            </NuxtLink>

            <!-- Settings -->
            <NuxtLink
              to="/settings"
              class="flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors"
              :class="route.path === '/settings' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </NuxtLink>

          </div>
        </div>
      </nav>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpenses } from '~/composables/useExpenses'
import { useSync } from '~/composables/useSync'

const route = useRoute()
const { isOnline } = useNetwork()
const { pendingSyncCount, refresh: refreshExpenses } = useExpenses()
const { sync, isSyncing } = useSync()

onMounted(async () => {
  await refreshExpenses()
  // Automatically trigger sync on mount if online
  if (isOnline.value) {
    sync()
  }
})

// Auto-sync whenever internet connectivity is restored
watch(isOnline, (online) => {
  if (online) {
    sync()
  }
})
</script>
