export interface AuthUser {
  id: string
  username: string
  name?: string | null
  createdAt?: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })
  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchUser() {
    try {
      const fetcher = import.meta.server ? useRequestFetch() : $fetch
      const data = await fetcher<{ success: boolean; user: AuthUser | null }>('/api/auth/me')
      if (data && data.user) {
        user.value = data.user
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true
    authError.value = null

    try {
      const response = await $fetch<{
        success: boolean
        user: AuthUser
        token: string
      }>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (response && response.user) {
        user.value = response.user
        if (response.token) {
          token.value = response.token
        }
        return true
      }
      return false
    } catch (err: any) {
      authError.value = err?.data?.statusMessage || err?.statusMessage || 'Failed to log in. Please check your credentials.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(username: string, password: string, name?: string): Promise<boolean> {
    isLoading.value = true
    authError.value = null

    try {
      const response = await $fetch<{
        success: boolean
        user: AuthUser
        token: string
      }>('/api/auth/register', {
        method: 'POST',
        body: { username, password, name }
      })

      if (response && response.user) {
        user.value = response.user
        if (response.token) {
          token.value = response.token
        }
        return true
      }
      return false
    } catch (err: any) {
      authError.value = err?.data?.statusMessage || err?.statusMessage || 'Failed to create account.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network error on logout
    } finally {
      user.value = null
      token.value = null
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    authError,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout
  }
}

