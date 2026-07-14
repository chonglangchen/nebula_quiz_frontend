import { get, post, put } from './request'

/**
 * Get today's quiz status
 */
export function fetchToday() {
  return get('/api/v1/quiz/today')
}

/**
 * Start a new quiz session
 */
export function startSession() {
  return post('/api/v1/quiz/sessions')
}

/**
 * Get session detail
 */
export function getSession(sessionId) {
  return get(`/api/v1/quiz/sessions/${sessionId}`)
}

/**
 * Save answer for a question
 */
export function saveAnswer(sessionId, questionId, selectedOption) {
  return put(`/api/v1/quiz/sessions/${sessionId}/answers/${questionId}`, {
    selectedOption
  })
}

/**
 * Submit the quiz
 */
export function submitQuiz(sessionId) {
  return post(`/api/v1/quiz/sessions/${sessionId}/submit`, {
    reason: 'MANUAL'
  })
}

/**
 * Get quiz result
 */
export function getResult(sessionId) {
  return get(`/api/v1/quiz/sessions/${sessionId}/result`)
}

/**
 * Get quiz history
 */
export function fetchHistory(page = 1, size = 20) {
  return get('/api/v1/quiz/history', { page, size })
}
