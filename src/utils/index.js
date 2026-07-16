/**
 * Format seconds to mm:ss display
 */
export function formatDuration(seconds) {
  if (seconds == null || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Format seconds to human-readable (e.g. "5分30秒")
 */
export function formatDurationCN(seconds) {
  if (!seconds || seconds <= 0) return '0秒'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}秒`
  if (s === 0) return `${m}分钟`
  return `${m}分${s}秒`
}

/**
 * Format date string to YYYY-MM-DD
 */
export function formatDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Format date to relative display (今天/昨天/date)
 */
export function formatDateRelative(dateStr) {
  if (!dateStr) return ''
  const today = new Date()
  const d = new Date(dateStr)
  const todayStr = formatDate(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = formatDate(yesterday)
  const dateDisplay = formatDate(d)
  if (dateDisplay === todayStr) return '今天'
  if (dateDisplay === yesterdayStr) return '昨天'
  return dateDisplay.slice(5) // MM-DD
}

/**
 * Convert score number to letter grade
 */
export function scoreToGrade(score) {
  if (score >= 90) return { grade: 'A', label: '优秀', color: '#22C55E' /* $success */ }
  if (score >= 80) return { grade: 'B', label: '良好', color: '#0EA5E9' /* $brand-cyan */ }
  if (score >= 60) return { grade: 'C', label: '及格', color: '#F59E0B' /* $warning */ }
  return { grade: 'D', label: '加油', color: '#EF4444' /* $danger */ }
}

/**
 * Get option label (A/B/C/D)
 */
export function optionLabel(index) {
  return String.fromCharCode(65 + index) // 0->A, 1->B, 2->C, 3->D
}

/**
 * Debounce
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Navigate to login page
 */
export function navigateToLogin() {
  uni.reLaunch({ url: '/pages/login/login' })
}
