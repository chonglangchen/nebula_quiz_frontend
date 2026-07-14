import { get } from './request'

/**
 * Get current user profile.
 * GET /api/v1/users/me
 */
export function fetchCurrentUser() {
  return get('/api/v1/users/me')
}
