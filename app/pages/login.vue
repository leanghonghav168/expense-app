<template>
  <div class="py-4 space-y-6">
    <!-- Header / Brand -->
    <div class="text-center space-y-2">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-emerald-600/20">
        ៛
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900">
          {{ isRegister ? 'Create Account' : 'Welcome Back' }}
        </h2>
        <p class="text-xs text-slate-500">
          {{ isRegister ? 'Sign up with username & password to sync your expenses' : 'Sign in using Face ID or your password' }}
        </p>
      </div>
    </div>

    <!-- Auth Card -->
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      
      <!-- Mode Toggle Tabs (Login vs Register) -->
      <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          class="py-2 rounded-lg transition-all"
          :class="!isRegister ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="isRegister = false; errorMsg = null"
        >
          Sign In
        </button>
        <button
          type="button"
          class="py-2 rounded-lg transition-all"
          :class="isRegister ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="isRegister = true; errorMsg = null"
        >
          Register
        </button>
      </div>

      <!-- Face ID / Biometrics Quick Login (Available if browser supports WebAuthn) -->
      <div v-if="!isRegister && isSupported" class="space-y-3 pt-1">
        <button
          type="button"
          :disabled="isPasskeyLoading || isLoading"
          class="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-[0.99] disabled:opacity-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          @click="handlePasskeyLogin"
        >
          <!-- Face ID / Biometrics Icon -->
          <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          <span>{{ isPasskeyLoading ? 'Verifying Face ID...' : 'Sign In with Face ID / Passkey' }}</span>
        </button>

        <!-- Divider -->
        <div class="relative flex items-center justify-center">
          <div class="border-t border-slate-200 w-full" />
          <span class="bg-white px-2 text-[10px] uppercase font-bold text-slate-400">or use password</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMsg || authError || passkeyError"
        class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2"
      >
        <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ errorMsg || authError || passkeyError }}</span>
      </div>

      <!-- Form -->
      <form class="space-y-3.5" @submit.prevent="handleSubmit">
        <!-- Display Name (Register only) -->
        <div v-if="isRegister" class="space-y-1">
          <label class="block text-xs font-semibold text-slate-700">Display Name (optional)</label>
          <input
            v-model="form.name"
            type="text"
            autocomplete="name"
            placeholder="e.g. Alex"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
        </div>

        <!-- Username -->
        <div class="space-y-1">
          <label class="block text-xs font-semibold text-slate-700">Username</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-xs">@</span>
            <input
              v-model="form.username"
              type="text"
              autocomplete="username"
              required
              placeholder="your_username"
              class="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-700">Password</label>
            <span v-if="isRegister" class="text-[10px] text-slate-400">Min 6 characters</span>
          </div>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password (Register only) -->
        <div v-if="isRegister" class="space-y-1">
          <label class="block text-xs font-semibold text-slate-700">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer mt-2"
        >
          <svg
            v-if="isLoading"
            class="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ isLoading ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Create Account' : 'Sign In') }}</span>
        </button>
      </form>
    </div>

    <!-- Security & JWT Info Badge -->
    <div class="text-center text-xs text-slate-400 space-y-1">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-medium text-slate-600">
        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Secured with Face ID Passkeys & JWT</span>
      </div>
      <p class="pt-2">
        <NuxtLink to="/" class="text-slate-500 hover:text-slate-800 underline">
          Continue as Guest
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { usePasskey } from '~/composables/usePasskey'
import { useSync } from '~/composables/useSync'

const route = useRoute()
const router = useRouter()
const { login, register, isLoading, authError } = useAuth()
const {
  isSupported,
  isLoading: isPasskeyLoading,
  passkeyError,
  loginWithPasskey
} = usePasskey()
const { sync } = useSync()

const isRegister = ref(route.query.tab === 'register')
const showPassword = ref(false)
const errorMsg = ref<string | null>(null)

const form = reactive({
  name: '',
  username: '',
  password: '',
  confirmPassword: ''
})

async function handlePasskeyLogin() {
  errorMsg.value = null
  const success = await loginWithPasskey(form.username.trim() || undefined)
  if (success) {
    sync()
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
}

async function handleSubmit() {
  errorMsg.value = null

  if (!form.username.trim()) {
    errorMsg.value = 'Please enter a username.'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters long.'
    return
  }

  if (isRegister.value && form.password !== form.confirmPassword) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  let success = false
  if (isRegister.value) {
    success = await register(form.username.trim(), form.password, form.name.trim() || undefined)
  } else {
    success = await login(form.username.trim(), form.password)
  }

  if (success) {
    // Automatically trigger cloud sync for the authenticated user
    sync()
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
}
</script>
