import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { signToken } from '../../utils/jwt'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Invalid login credentials'
    })
  }

  const { username, password } = validation.data
  const normalizedUsername = username.trim().toLowerCase()

  // Find user by username
  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password'
    })
  }

  // Compare password hash
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password'
    })
  }

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
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt
    },
    token
  }
})

