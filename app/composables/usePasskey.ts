import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration
} from '@simplewebauthn/browser'
import { useAuth, type AuthUser } from '~/composables/useAuth'

export interface PasskeyItem {
  id: string
  credentialId: string
  deviceType?: string | null
  createdAt: string
}

export function usePasskey() {
  const isSupported = ref(false)
  const isPlatformAvailable = ref(false)
  const isLoading = ref(false)
  const passkeyError = ref<string | null>(null)
  const passkeys = ref<PasskeyItem[]>([])

  const { user, token } = useAuth()

  // Detect WebAuthn & biometric platform authenticator (Face ID / Touch ID / Windows Hello)
  onMounted(async () => {
    if (import.meta.client) {
      isSupported.value = browserSupportsWebAuthn()
      if (isSupported.value) {
        try {
          isPlatformAvailable.value = await platformAuthenticatorIsAvailable()
        } catch {
          isPlatformAvailable.value = false
        }
      }
    }
  })

  async function fetchPasskeys() {
    if (!import.meta.client || !user.value) return
    try {
      const data = await $fetch<{ success: boolean; passkeys: PasskeyItem[] }>('/api/auth/passkey/list')
      if (data && data.passkeys) {
        passkeys.value = data.passkeys
      }
    } catch {
      passkeys.value = []
    }
  }

  async function registerPasskey(): Promise<boolean> {
    if (!import.meta.client) return false
    isLoading.value = true
    passkeyError.value = null

    try {
      // 1. Get registration options from server
      const optionsJSON = await $fetch<any>('/api/auth/passkey/register-options')

      // 2. Prompt Face ID / Passkey prompt via browser
      const attResp = await startRegistration({ optionsJSON })

      // 3. Send response to server for verification
      const verifyRes = await $fetch<{ success: boolean; message: string }>('/api/auth/passkey/register-verify', {
        method: 'POST',
        body: attResp
      })

      if (verifyRes.success) {
        await fetchPasskeys()
        return true
      }
      return false
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        passkeyError.value = 'Face ID / Passkey operation was cancelled.'
      } else {
        passkeyError.value = err?.data?.statusMessage || err?.message || 'Failed to register Face ID.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithPasskey(username?: string): Promise<boolean> {
    if (!import.meta.client) return false
    isLoading.value = true
    passkeyError.value = null

    try {
      // 1. Get authentication options from server
      const optionsJSON = await $fetch<any>('/api/auth/passkey/login-options', {
        method: 'POST',
        body: { username: username?.trim() || undefined }
      })

      // 2. Trigger Face ID / Touch ID authentication
      const asseResp = await startAuthentication({ optionsJSON })

      // 3. Verify assertion with server
      const verifyRes = await $fetch<{
        success: boolean
        user: AuthUser
        token: string
      }>('/api/auth/passkey/login-verify', {
        method: 'POST',
        body: asseResp
      })

      if (verifyRes && verifyRes.user) {
        user.value = verifyRes.user
        token.value = verifyRes.token
        return true
      }
      return false
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        passkeyError.value = 'Face ID verification was cancelled.'
      } else {
        passkeyError.value = err?.data?.statusMessage || err?.message || 'Face ID login failed.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deletePasskey(id: string): Promise<boolean> {
    try {
      await $fetch('/api/auth/passkey/delete', {
        method: 'POST',
        body: { id }
      })
      await fetchPasskeys()
      return true
    } catch {
      return false
    }
  }

  return {
    isSupported,
    isPlatformAvailable,
    isLoading,
    passkeyError,
    passkeys,
    fetchPasskeys,
    registerPasskey,
    loginWithPasskey,
    deletePasskey
  }
}

