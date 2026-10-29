import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { signToken } from '../../utils/jwt'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dashes, and periods'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
  name: z.string().max(100).optional().nullable()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = registerSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Invalid registration data'
    })
  }

  const { username, password, name } = validation.data
  const normalizedUsername = username.trim().toLowerCase()

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: normalizedUsername }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Username is already taken'
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      password: hashedPassword,
      name: name?.trim() || null
    },
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true
    }
  })

  // Sign JWT
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

  return {
    success: true,
    user,
    token
  }
})

