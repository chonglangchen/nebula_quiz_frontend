import { BASE_URL, STORAGE_KEYS } from '@/utils/constants'

// ── Token Management ──
function getAccessToken() {
  return uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN) || ''
}

export function saveTokens(accessToken, accessExpiresIn, refreshToken, refreshExpiresIn) {
  uni.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  if (refreshToken) uni.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  if (accessExpiresIn) uni.setStorageSync(STORAGE_KEYS.ACCESS_EXPIRES, Date.now() + accessExpiresIn * 1000)
  if (refreshExpiresIn) uni.setStorageSync(STORAGE_KEYS.REFRESH_EXPIRES, Date.now() + refreshExpiresIn * 1000)
}

export function clearTokens() {
  uni.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
  uni.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
  uni.removeStorageSync(STORAGE_KEYS.ACCESS_EXPIRES)
  uni.removeStorageSync(STORAGE_KEYS.REFRESH_EXPIRES)
  uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

// ── Request Wrapper ──
// Backend API format: { success: boolean, data: T, traceId: string }
// Backend error format: { success: false, error: { code, message, details }, traceId: string }
async function request({ url, method = 'GET', data = null, header = {}, skipAuth = false }) {
  const headers = { ...header }
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  try {
    const res = await uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers
    })

    const body = res.data

    // Success
    if (body && body.success === true) {
      return body.data
    }

    // Token invalid - redirect to login
    if (body && body.error && (body.error.code === 'TOKEN_INVALID' || body.error.code === 'TOKEN_EXPIRED')) {
      clearTokens()
      uni.reLaunch({ url: '/pages/login/login' })
      return Promise.reject(new Error(body.error.message || '登录已过期'))
    }

    // Other errors
    const message = body?.error?.message || '请求失败'
    const details = body?.error?.details || null
    uni.showToast({ title: message, icon: 'none', duration: 2000 })
    const err = new Error(message)
    err.details = details
    return Promise.reject(err)
  } catch (e) {
    if (e.errMsg && e.errMsg.includes('request:fail')) {
      uni.showToast({ title: '网络连接失败', icon: 'none', duration: 2000 })
    }
    return Promise.reject(e)
  }
}

// ── Convenience Methods ──
export function get(url, data, options = {}) {
  return request({ url, method: 'GET', data, ...options })
}

export function post(url, data, options = {}) {
  return request({ url, method: 'POST', data, ...options })
}

export function put(url, data, options = {}) {
  return request({ url, method: 'PUT', data, ...options })
}

export function del(url, data, options = {}) {
  return request({ url, method: 'DELETE', data, ...options })
}

export default request
