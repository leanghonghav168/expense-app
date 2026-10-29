import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Public routes that don't require authentication
  const isAuthPage = to.path === '/login'

  const { user, fetchUser, isAuthenticated } = useAuth()
  const token = useCookie<string | null>('auth_token')

  // If token exists in cookie but user state is not loaded yet, verify and restore user
  if (token.value && !user.value) {
    await fetchUser()
  }

  // 1. If user is already authenticated and visits /login, redirect to dashboard
  if (isAuthPage) {
    if (isAuthenticated.value) {
      return navigateTo('/')
    }
    return
  }

  // 2. If user is NOT authenticated and attempts to access any app page, redirect to /login
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath !== '/' ? to.fullPath : undefined
      }
    })
  }
})

