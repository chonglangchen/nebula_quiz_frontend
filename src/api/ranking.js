import { get } from './request'

/**
 * Get ranking data for a given date (defaults to today if not specified).
 * Returns personal rank, user rankings list, and department rankings.
 */
export function fetchRanking(date = null) {
  const params = {}
  if (date) params.date = date
  return get('/api/v1/ranking', params)
}
