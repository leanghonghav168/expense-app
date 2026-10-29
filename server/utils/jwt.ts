import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { prisma } from './prisma'

export interface JwtUserPayload {
  id: string
  username: string
  name?: string | null
}

const getJwtSecret = (): string => {
  const config = useRuntimeConfig()
  return (config.jwtSecret as string) || process.env.JWT_SECRET || 'expense-tracker-super-secret-jwt-key-2026'
}

export function signToken(payload: JwtUserPayload): string {
  const secret = getJwtSecret()
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const secret = getJwtSecret()
    return jwt.verify(token, secret) as JwtUserPayload
  } catch {
    return null
  }
}

export function extractToken(event: H3Event): string | null {
  // 1. Check Authorization Header: Bearer <token>
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }

  // 2. Check Cookie: auth_token
  const cookieToken = getCookie(event, 'auth_token')
  if (cookieToken) {
    return cookieToken
  }

  return null
}

export async function getAuthUser(event: H3Event) {
  const token = extractToken(event)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.id) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true
    }
  })

  return user
}

export async function requireAuthUser(event: H3Event) {
  const user = await getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in to continue'
    })
  }
  return user
}

