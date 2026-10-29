import { requireAuthUser } from '../../../utils/jwt'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)

  if (!body?.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkey ID is required'
    })
  }

  await prisma.passkey.deleteMany({
    where: {
      id: body.id,
      userId: user.id
    }
  })

  return {
    success: true,
    message: 'Passkey removed successfully'
  }
})

