// ── API Base URL ──
// In dev: empty string → Vite proxy forwards /api/* to backend
// In production: set VUE_APP_API_BASE to actual backend URL
export const BASE_URL = process.env.VUE_APP_API_BASE || ''

// ── Storage Keys ──
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nq_access_token',
  REFRESH_TOKEN: 'nq_refresh_token',
  ACCESS_EXPIRES: 'nq_access_expires',
  REFRESH_EXPIRES: 'nq_refresh_expires',
  USER_INFO: 'nq_user_info'
}

// ── Quiz Statuses ──
export const QUIZ_STATUS = {
  TRAINING_REQUIRED: 'TRAINING_REQUIRED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  NOT_STARTED: 'NOT_STARTED',
  ALL_COMPLETED: 'ALL_COMPLETED'
}

// ── Quiz Config ──
export const QUIZ_CONFIG = {
  DAILY_QUESTION_COUNT: 5,
  DURATION_SECONDS: 1800, // 30 minutes
  DURATION_MINUTES: 30
}

// ── Role ──
export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN'
}

// ── Knowledge Domains ──
export const DOMAINS = [
  { id: 1, name: 'AI基础常识', color: '#0EA5E9' },
  { id: 2, name: '国内主流大模型产品', color: '#14B8A6' },
  { id: 3, name: 'AIGC日常应用', color: '#8B5CF6' },
  { id: 4, name: 'AI办公效率工具', color: '#F59E0B' },
  { id: 5, name: 'AI生活与服务应用', color: '#EC4899' },
  { id: 6, name: 'AI安全与合规常识', color: '#EF4444' }
]
