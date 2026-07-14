import { get } from './request'

/**
 * Get admin statistics dashboard
 */
export function fetchDashboard(date = null, days = 7) {
  const params = { days }
  if (date) params.date = date
  return get('/api/v1/admin/statistics/dashboard', params)
}
