import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { prisma } from '../../../utils/prisma'
import { getWebAuthnConfig } from '../../../utils/webauthn'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { rpID } = getWebAuthnConfig(event)

  let allowCredentials: Array<{ id: string; transports?: any[] }> | undefined

  if (body?.username) {
    const normalizedUsername = body.username.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      include: { passkeys: true }
    })

    if (user && user.passkeys.length > 0) {
      allowCredentials = user.passkeys.map((p) => ({
        id: p.credentialId,
        transports: p.transports ? JSON.parse(p.transports) : undefined
      }))
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    allowCredentials
  })

  // Store authentication challenge in a temporary cookie
  setCookie(event, 'passkey_auth_challenge', options.challenge, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300, // 5 minutes
    path: '/'
  })

  return options
})

