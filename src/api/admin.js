import { get } from './request'
import { BASE_URL, STORAGE_KEYS } from '@/utils/constants'

/**
 * Get admin statistics dashboard
 */
export function fetchDashboard(date = null, days = 7) {
  const params = { days }
  if (date) params.date = date
  return get('/api/v1/admin/statistics/dashboard', params)
}

// ── Export utilities ──

function getAccessToken() {
  return uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN) || ''
}

/**
 * Download an Excel file from the backend.
 * Uses native fetch() to support binary response + custom Authorization header.
 */
async function downloadExcel(url, filename) {
  uni.showLoading({ title: '正在生成文件...', mask: true })
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` }
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
        return
      }
      const errorBody = await response.json().catch(() => ({}))
      const message = errorBody?.error?.message || '导出失败'
      uni.showToast({ title: message, icon: 'none' })
      return
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)

    uni.showToast({ title: '下载完成', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '网络连接失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// ── Export APIs ──

/**
 * Export employee answer details for a given date
 */
export function exportEmployeeDetails(date) {
  const url = `${BASE_URL}/api/v1/admin/statistics/export/employee-details?date=${date}`
  return downloadExcel(url, `员工答题明细_${date}.xlsx`)
}

/**
 * Export department employee quiz status for a given date and department
 */
export function exportDepartmentStatus(date, department) {
  const url = `${BASE_URL}/api/v1/admin/statistics/export/department-status?date=${date}&department=${encodeURIComponent(department)}`
  return downloadExcel(url, `部门答题情况_${department}_${date}.xlsx`)
}

/**
 * Export department participation rate for a date range
 */
export function exportParticipationRate(startDate, endDate) {
  const url = `${BASE_URL}/api/v1/admin/statistics/export/participation-rate?startDate=${startDate}&endDate=${endDate}`
  return downloadExcel(url, `部门参与率统计_${startDate}_${endDate}.xlsx`)
}
