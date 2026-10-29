import { generateRegistrationOptions } from '@simplewebauthn/server'
import { requireAuthUser } from '../../../utils/jwt'
import { prisma } from '../../../utils/prisma'
import { getWebAuthnConfig } from '../../../utils/webauthn'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { rpName, rpID } = getWebAuthnConfig(event)

  // Fetch user's existing credentials to exclude re-registering
  const existingPasskeys = await prisma.passkey.findMany({
    where: { userId: user.id },
    select: { credentialId: true, transports: true }
  })

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.username,
    userDisplayName: user.name || user.username,
    attestationType: 'none',
    excludeCredentials: existingPasskeys.map((p) => ({
      id: p.credentialId,
      transports: p.transports ? JSON.parse(p.transports) : undefined
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      // 'platform' encourages Face ID / Touch ID / Windows Hello
      authenticatorAttachment: 'platform'
    }
  })

  // Store the challenge in a temporary HTTP-only cookie
  setCookie(event, 'passkey_reg_challenge', options.challenge, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300, // 5 minutes
    path: '/'
  })

  return options
})

