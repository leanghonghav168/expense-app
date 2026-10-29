import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  await prisma.$transaction([
    prisma.expense.deleteMany(),
    prisma.category.deleteMany(),
    prisma.syncMeta.deleteMany()
  ])

  return {
    success: true,
    message: 'PostgreSQL database wiped successfully'
  }
})
