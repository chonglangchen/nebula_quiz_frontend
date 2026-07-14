import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { QUIZ_CONFIG } from '@/utils/constants'
import {
  fetchToday, startSession, getSession, saveAnswer,
  submitQuiz, getResult, fetchHistory
} from '@/api/quiz'

export const useQuizStore = defineStore('quiz', () => {
  // ── State ──
  const todayStatus = ref(null)
  const currentSession = ref(null)
  const currentResult = ref(null)
  const historyData = ref(null)
  const loading = ref(false)

  // ── Getters ──
  const canStart = computed(() => todayStatus.value?.canStart === true)
  const isInProgress = computed(() => todayStatus.value?.status === 'IN_PROGRESS')
  const isSubmitted = computed(() => todayStatus.value?.status === 'SUBMITTED')
  const isTrainingRequired = computed(() => todayStatus.value?.status === 'TRAINING_REQUIRED')
  const isAllCompleted = computed(() => todayStatus.value?.status === 'ALL_COMPLETED')
  const answeredInSession = computed(() => {
    if (!currentSession.value?.questions) return 0
    return currentSession.value.questions.filter(q => q.selectedOption).length
  })

  // ── Actions ──
  async function loadToday() {
    loading.value = true
    try {
      todayStatus.value = await fetchToday()
    } finally {
      loading.value = false
    }
  }

  async function startQuiz() {
    loading.value = true
    try {
      const result = await startSession()
      currentSession.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  async function loadSession(sessionId) {
    loading.value = true
    try {
      currentSession.value = await getSession(sessionId)
      return currentSession.value
    } finally {
      loading.value = false
    }
  }

  async function answerQuestion(sessionId, questionId, option) {
    const result = await saveAnswer(sessionId, questionId, option)
    // Update local state
    if (currentSession.value?.questions) {
      const q = currentSession.value.questions.find(q => q.id === questionId)
      if (q) q.selectedOption = option
    }
    return result
  }

  async function submitCurrentQuiz(sessionId) {
    loading.value = true
    try {
      currentResult.value = await submitQuiz(sessionId)
      return currentResult.value
    } finally {
      loading.value = false
    }
  }

  async function loadResult(sessionId) {
    loading.value = true
    try {
      currentResult.value = await getResult(sessionId)
      return currentResult.value
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(page = 1, size = 20) {
    loading.value = true
    try {
      historyData.value = await fetchHistory(page, size)
      return historyData.value
    } finally {
      loading.value = false
    }
  }

  function resetSession() {
    currentSession.value = null
    currentResult.value = null
  }

  function resetAll() {
    todayStatus.value = null
    currentSession.value = null
    currentResult.value = null
    historyData.value = null
  }

  return {
    todayStatus, currentSession, currentResult, historyData, loading,
    canStart, isInProgress, isSubmitted, isTrainingRequired, isAllCompleted, answeredInSession,
    loadToday, startQuiz, loadSession, answerQuestion, submitCurrentQuiz, loadResult, loadHistory,
    resetSession, resetAll
  }
})
