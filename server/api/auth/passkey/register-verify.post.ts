import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { requireAuthUser } from '../../../utils/jwt'
import { prisma } from '../../../utils/prisma'
import { getWebAuthnConfig } from '../../../utils/webauthn'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = (await readBody(event)) as RegistrationResponseJSON
  const expectedChallenge = getCookie(event, 'passkey_reg_challenge')

  if (!expectedChallenge) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Registration session expired. Please try again.'
    })
  }

  const { rpID, expectedOrigin } = getWebAuthnConfig(event)

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: true
    })
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || 'Passkey verification failed'
    })
  }

  const { verified, registrationInfo } = verification
  if (!verified || !registrationInfo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Could not verify Face ID / Passkey'
    })
  }

  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo

  // Store passkey credential in DB
  await prisma.passkey.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: BigInt(credential.counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.transports ? JSON.stringify(credential.transports) : null
    }
  })

  // Clear challenge cookie
  deleteCookie(event, 'passkey_reg_challenge', { path: '/' })

  return {
    success: true,
    message: 'Face ID / Passkey enabled successfully'
  }
})

