import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { signToken } from '../../../utils/jwt'
import { prisma } from '../../../utils/prisma'
import { getWebAuthnConfig } from '../../../utils/webauthn'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as AuthenticationResponseJSON
  const expectedChallenge = getCookie(event, 'passkey_auth_challenge')

  if (!expectedChallenge) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Authentication session expired. Please try again.'
    })
  }

  // Find the passkey in DB
  const passkey = await prisma.passkey.findUnique({
    where: { credentialId: body.id },
    include: { user: true }
  })

  if (!passkey || !passkey.user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Passkey not recognized. Please sign in with your password.'
    })
  }

  const { rpID, expectedOrigin } = getWebAuthnConfig(event)

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: Number(passkey.counter),
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined
      },
      requireUserVerification: true
    })
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || 'Passkey verification failed'
    })
  }

  const { verified, authenticationInfo } = verification
  if (!verified) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Face ID / Passkey authentication failed'
    })
  }

  // Update counter to protect against replay attacks
  await prisma.passkey.update({
    where: { id: passkey.id },
    data: {
      counter: BigInt(authenticationInfo.newCounter)
    }
  })

  // Sign and issue JWT
  const user = passkey.user
  const token = signToken({
    id: user.id,
    username: user.username,
    name: user.name
  })

  // Set auth cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  // Clear challenge cookie
  deleteCookie(event, 'passkey_auth_challenge', { path: '/' })

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt
    },
    token
  }
})

