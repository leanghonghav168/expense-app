import { requireAuthUser } from '../../../utils/jwt'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)

  const passkeys = await prisma.passkey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      credentialId: true,
      deviceType: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    success: true,
    passkeys
  }
})

