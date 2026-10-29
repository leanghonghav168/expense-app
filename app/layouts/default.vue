<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-between">
    <!-- Mobile Shell: max-w-md centered for desktop preview, 100% on mobile -->
    <div class="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col relative shadow-sm border-x border-slate-200">
      
      <!-- Backdrop for User Menu -->
      <div
        v-if="showUserMenu"
        class="fixed inset-0 z-40"
        @click="showUserMenu = false"
      />

      <!-- Top Sticky Header -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-safe">
        <div class="h-14 flex items-center justify-between gap-2">
          <NuxtLink to="/" class="flex items-center gap-2 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ៛
            </div>
            <div class="truncate">
              <h1 class="font-bold text-slate-900 leading-tight text-base truncate">Expense Tracker</h1>
              <p class="text-[10px] text-slate-500 font-medium">Personal Finance PWA (V:1.1.0)</p>
            </div>
          </NuxtLink>

          <!-- Status Indicators & Auth -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
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
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors',
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

            <!-- Auth Status: Logged In User Pill vs Login Button -->
            <div class="relative">
              <button
                v-if="isAuthenticated && user"
                type="button"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                title="Account menu"
                @click="showUserMenu = !showUserMenu"
              >
                <div class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0">
                  {{ user.name ? user.name.charAt(0) : user.username.charAt(0) }}
                </div>
                <span class="max-w-[65px] truncate text-[11px]">@{{ user.username }}</span>
                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <NuxtLink
                v-else
                to="/login"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
                title="Sign in with username & password"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </NuxtLink>

              <!-- User Dropdown Popover -->
              <div
                v-if="showUserMenu && isAuthenticated && user"
                class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in"
              >
                <div class="px-3 py-2 border-b border-slate-100">
                  <p class="font-bold text-slate-900 truncate">{{ user.name || user.username }}</p>
                  <p class="text-[11px] text-slate-500 truncate">@{{ user.username }}</p>
                  <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    JWT Active
                  </span>
                </div>

                <NuxtLink
                  to="/settings"
                  class="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  @click="showUserMenu = false"
                >
                  <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Account & Settings</span>
                </NuxtLink>

                <button
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 text-left cursor-pointer"
                  @click="handleLogout"
                >
                  <svg class="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
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
            <div class="flex-1 flex justify-center -mt-16">
              <NuxtLink
                to="/expenses/new"
                class="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-all border-4 border-white"
                title="Add Transaction"
              >
                <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import { useAuth } from '~/composables/useAuth'
import { useExpenses } from '~/composables/useExpenses'
import { useNetwork } from '~/composables/useNetwork'
import { useSync } from '~/composables/useSync'

const route = useRoute()
const { isOnline } = useNetwork()
const { pendingSyncCount, refresh: refreshExpenses } = useExpenses()
const { sync, isSyncing } = useSync()
const { user, isAuthenticated, fetchUser, logout } = useAuth()

const showUserMenu = ref(false)

async function handleLogout() {
  showUserMenu.value = false
  await logout()
}

onMounted(async () => {
  await fetchUser()
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
