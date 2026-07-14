import { get, post, saveTokens, clearTokens } from './request'
import { STORAGE_KEYS } from '@/utils/constants'

/**
 * Login with phone + password.
 * POST /api/v1/auth/login
 * Returns data: { accessToken, refreshToken, user, mustChangePassword }
 */
export async function passwordLogin(phone, password) {
  const data = await post('/api/v1/auth/login', {
    phone,
    password
  }, { skipAuth: true })

  const token = data.accessToken
  if (token) {
    saveTokens(
      data.accessToken,
      data.accessTokenExpiresIn,
      data.refreshToken,
      data.refreshTokenExpiresIn
    )
    // Normalize: AuthUser uses employeeNo, normalize to employeeId
    const user = { ...data.user, employeeId: data.user.employeeId || data.user.employeeNo }
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
  }
  return data
}

/**
 * Get current user info.
 * GET /api/v1/users/me
 */
export async function getUserInfo() {
  const data = await get('/api/v1/users/me')
  uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(data))
  return data
}

/**
 * Change password. Requires auth token.
 * POST /api/v1/auth/change-password
 */
export async function changePassword(oldPassword, newPassword) {
  return post('/api/v1/auth/change-password', {
    oldPassword,
    newPassword
  })
}

/**
 * Logout
 */
export async function logout() {
  try {
    const refreshToken = uni.getStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
    if (refreshToken) {
      await post('/api/v1/auth/logout', { refreshToken }, { skipAuth: true }).catch(() => {})
    }
  } finally {
    clearTokens()
  }
}
