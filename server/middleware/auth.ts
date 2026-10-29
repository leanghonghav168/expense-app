import { extractToken, verifyToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only apply authentication to /api/ routes
  if (!pathname.startsWith('/api/')) {
    return
  }

  // Allow public authentication endpoints without a token
  if (pathname.startsWith('/api/auth/')) {
    return
  }

  // Extract and verify JWT token
  const token = extractToken(event)
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Missing or invalid authentication token'
    })
  }

  const payload = verifyToken(token)
  if (!payload || !payload.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Invalid or expired token'
    })
  }

  // Attach authenticated user information to event context
  event.context.auth = payload
})

