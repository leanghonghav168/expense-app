import { getAuthUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)

  if (!user) {
    return {
      success: true,
      user: null
    }
  }

  return {
    success: true,
    user
  }
})

