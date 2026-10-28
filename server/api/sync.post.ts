import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma'

const syncPayloadSchema = z.object({
  lastPulledAt: z.string().datetime().optional().nullable(),
  clientExpenses: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200),
      amount: z.number().positive(),
      currency: z.enum(['USD', 'KHR']),
      type: z.enum(['income', 'expense']),
      category: z.string().min(1).max(100),
      occurredAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      deletedAt: z.string().datetime().optional().nullable()
    })
  ).max(500),
  clientCategories: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100),
      type: z.enum(['income', 'expense']),
      icon: z.string().max(20).optional().nullable(),
      color: z.string().max(30).optional().nullable(),
      isDefault: z.boolean().optional(),
      updatedAt: z.string().datetime(),
      deletedAt: z.string().datetime().optional().nullable()
    })
  ).max(100)
})

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)
  const validation = syncPayloadSchema.safeParse(rawBody)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid synchronization payload',
      data: validation.error.format()
    })
  }

  const { lastPulledAt, clientExpenses, clientCategories } = validation.data
  const serverTime = new Date().toISOString()

  // Execute database operations in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Process Client Categories (Upsert or Soft-delete based on timestamp)
    for (const cat of clientCategories) {
      const existing = await tx.category.findUnique({ where: { id: cat.id } })
      const clientUpdated = new Date(cat.updatedAt)

      if (!existing || clientUpdated >= existing.updatedAt) {
        await tx.category.upsert({
          where: { id: cat.id },
          create: {
            id: cat.id,
            name: cat.name,
            type: cat.type,
            icon: cat.icon || null,
            color: cat.color || null,
            isDefault: cat.isDefault ?? false,
            updatedAt: clientUpdated,
            deletedAt: cat.deletedAt ? new Date(cat.deletedAt) : null
          },
          update: {
            name: cat.name,
            type: cat.type,
            icon: cat.icon || null,
            color: cat.color || null,
            updatedAt: clientUpdated,
            deletedAt: cat.deletedAt ? new Date(cat.deletedAt) : null
          }
        })
      }
    }

    // 2. Process Client Expenses (Upsert or Soft-delete based on timestamp)
    for (const exp of clientExpenses) {
      const existing = await tx.expense.findUnique({ where: { id: exp.id } })
      const clientUpdated = new Date(exp.updatedAt)

      if (!existing || clientUpdated >= existing.updatedAt) {
        await tx.expense.upsert({
          where: { id: exp.id },
          create: {
            id: exp.id,
            title: exp.title,
            amount: new Prisma.Decimal(exp.amount),
            currency: exp.currency,
            type: exp.type,
            category: exp.category,
            occurredAt: new Date(exp.occurredAt),
            updatedAt: clientUpdated,
            deletedAt: exp.deletedAt ? new Date(exp.deletedAt) : null
          },
          update: {
            title: exp.title,
            amount: new Prisma.Decimal(exp.amount),
            currency: exp.currency,
            type: exp.type,
            category: exp.category,
            occurredAt: new Date(exp.occurredAt),
            updatedAt: clientUpdated,
            deletedAt: exp.deletedAt ? new Date(exp.deletedAt) : null
          }
        })
      }
    }
  })

  // 3. Fetch all Server Changes that occurred since lastPulledAt
  const filterDate = lastPulledAt ? new Date(lastPulledAt) : new Date(0)

  const [serverExpenses, serverCategories] = await Promise.all([
    prisma.expense.findMany({
      where: {
        updatedAt: { gt: filterDate }
      }
    }),
    prisma.category.findMany({
      where: {
        updatedAt: { gt: filterDate }
      }
    })
  ])

  return {
    success: true,
    serverTime,
    serverExpenses: serverExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: Number(e.amount),
      currency: e.currency,
      type: e.type,
      category: e.category,
      occurredAt: e.occurredAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      deletedAt: e.deletedAt ? e.deletedAt.toISOString() : undefined,
      synced: true
    })),
    serverCategories: serverCategories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      icon: c.icon || undefined,
      color: c.color || undefined,
      isDefault: c.isDefault,
      updatedAt: c.updatedAt.toISOString(),
      deletedAt: c.deletedAt ? c.deletedAt.toISOString() : undefined,
      synced: true
    }))
  }
})
