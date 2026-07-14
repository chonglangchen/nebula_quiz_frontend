import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS, ROLES } from '@/utils/constants'
import { fetchCurrentUser } from '@/api/user'
import { clearTokens } from '@/api/request'

export const useUserStore = defineStore('user', () => {
  // ── State ──
  const user = ref(null)
  const isLoggedIn = ref(false)
  const mustChangePassword = ref(false)

  // ── Getters ──
  const isAdmin = computed(() => user.value?.role === ROLES.ADMIN)
  const isEmployee = computed(() => user.value?.role === ROLES.EMPLOYEE)
  const isTrainingConfirmed = computed(() => user.value?.trainingConfirmed === true)
  const displayName = computed(() => user.value?.realName || user.value?.nickname || '职工')
  const completionRate = computed(() => {
    if (!user.value?.statistics) return 0
    return user.value.statistics.completionRate || 0
  })
  const answeredCount = computed(() => user.value?.statistics?.answeredQuestionCount || 0)
  const totalQuestionCount = computed(() => user.value?.statistics?.totalQuestionCount || 200)

  // ── Actions ──
  function loadFromStorage() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
      const token = uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
      if (stored && token) {
        user.value = JSON.parse(stored)
        isLoggedIn.value = true
      }
    } catch (e) {
      // ignore
    }
  }

  async function refreshUser() {
    try {
      const data = await fetchCurrentUser()
      if (data) {
        user.value = data
        isLoggedIn.value = true
        uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(data))
      }
    } catch (e) {
      // ignore
    }
  }

  function setUser(userData) {
    user.value = userData
    isLoggedIn.value = true
    mustChangePassword.value = false
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
    mustChangePassword.value = false
    clearTokens()
  }

  // ── Init ──
  loadFromStorage()

  return {
    user,
    isLoggedIn,
    mustChangePassword,
    isAdmin,
    isEmployee,
    isTrainingConfirmed,
    displayName,
    completionRate,
    answeredCount,
    totalQuestionCount,
    loadFromStorage,
    refreshUser,
    setUser,
    logout
  }
})
