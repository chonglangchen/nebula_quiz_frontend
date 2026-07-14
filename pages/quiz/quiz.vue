<template>
  <view class="quiz-page">
    <!-- Custom nav bar with timer -->
    <view class="quiz__navbar" :style="{ paddingTop: statusBarHeight + 'px', backgroundColor: navbarBg }">
      <view class="quiz__navbar-inner">
        <view class="quiz__navbar-left" @tap="handleBack">
          <text class="quiz__navbar-back">←</text>
        </view>
        <view class="quiz__navbar-center">
          <text class="quiz__navbar-title">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</text>
        </view>
        <view class="quiz__navbar-right">
          <n-quiz-timer
            :expired-at="session?.expiresAt"
            :duration-seconds="1800"
            @timeout="handleTimeout"
          />
        </view>
      </view>
      <!-- Progress bar -->
      <view class="quiz__progress-track">
        <view
          class="quiz__progress-fill"
          :style="{ width: progressPercent + '%' }"
        />
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="quiz__loading">
      <text>加载题目中…</text>
    </view>

    <!-- Question carousel -->
    <swiper
      v-else-if="session"
      class="quiz__swiper"
      :current="currentQuestionIndex"
      :duration="300"
      @change="handleSwipeChange"
      @animationfinish="handleSwipeFinish"
    >
      <swiper-item
        v-for="(question, index) in session.questions"
        :key="question.id"
        class="quiz__slide"
      >
        <scroll-view class="quiz__slide-scroll" scroll-y enhanced>
          <n-question-card
            :question-id="question.id"
            :sequence="question.sequence"
            :total="totalQuestions"
            :content="question.content"
            :options="question.options"
            :selected-option="question.selectedOption"
            :disabled="submitting"
            @select="handleAnswer"
          />
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- Bottom action bar -->
    <view v-if="session" class="quiz__footer">
      <!-- Question dots -->
      <view class="quiz__dots">
        <view
          v-for="(q, idx) in session.questions"
          :key="q.id"
          class="quiz__dot"
          :class="{
            'quiz__dot--active': idx === currentQuestionIndex,
            'quiz__dot--answered': q.selectedOption,
            'quiz__dot--current-answered': idx === currentQuestionIndex && q.selectedOption
          }"
          @tap="goToQuestion(idx)"
        />
      </view>

      <!-- Navigation buttons -->
      <view class="quiz__nav">
        <button
          v-if="currentQuestionIndex > 0"
          class="quiz__nav-btn quiz__nav-btn--prev"
          hover-class="quiz__nav-btn--hover"
          @tap="prevQuestion"
        >
          <text>上一题</text>
        </button>
        <view v-else class="quiz__nav-spacer" />

        <button
          v-if="currentQuestionIndex < totalQuestions - 1"
          class="quiz__nav-btn quiz__nav-btn--next"
          hover-class="quiz__nav-btn--hover"
          @tap="nextQuestion"
        >
          <text>下一题</text>
        </button>
        <button
          v-else
          class="quiz__nav-btn quiz__nav-btn--submit"
          hover-class="quiz__nav-btn--hover"
          :loading="submitting"
          @tap="handleSubmit"
        >
          <text>交卷</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuizStore } from '@/store/quiz'
import { useUserStore } from '@/store/user'

const quizStore = useQuizStore()
const userStore = useUserStore()

const loading = ref(true)
const submitting = ref(false)
const currentQuestionIndex = ref(0)
const statusBarHeight = ref(20)
const navbarBg = ref('#0B1D3A')
const isTransitioning = ref(false)

// Get session ID from route
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const sessionId = currentPage?.options?.sessionId

const session = computed(() => quizStore.currentSession)
const totalQuestions = computed(() => session.value?.questions?.length || 0)
const progressPercent = computed(() => {
  if (!session.value?.questions) return 0
  const answered = session.value.questions.filter(q => q.selectedOption).length
  return Math.round((answered / totalQuestions.value) * 100)
})

onMounted(async () => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) { /* fallback */ }

  if (!sessionId) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    loading.value = false
    return
  }

  // Load session
  try {
    await quizStore.loadSession(parseInt(sessionId))
  } catch (e) {
    uni.showToast({ title: '加载答题失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    loading.value = false
    return
  }

  // Check if session is already submitted
  if (session.value?.status !== 'IN_PROGRESS') {
    uni.redirectTo({
      url: `/pages/result/result?sessionId=${sessionId}`
    })
    loading.value = false
    return
  }

  loading.value = false

  // Find first unanswered question
  if (session.value?.questions) {
    const firstUnanswered = session.value.questions.findIndex(q => !q.selectedOption)
    if (firstUnanswered >= 0) {
      currentQuestionIndex.value = firstUnanswered
    }
  }
})

onUnmounted(() => {
  // Don't reset if navigating to result
})

function handleSwipeChange(e) {
  currentQuestionIndex.value = e.detail.current
}

function handleSwipeFinish(e) {
  currentQuestionIndex.value = e.detail.current
}

function goToQuestion(index) {
  currentQuestionIndex.value = index
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
  }
}

async function handleAnswer({ questionId, option }) {
  if (submitting.value) return
  try {
    await quizStore.answerQuestion(session.value.sessionId, questionId, option)
  } catch (e) {
    // Error handled by interceptor
  }
}

async function handleSubmit() {
  if (submitting.value) return

  // Check if all questions answered
  const unanswered = session.value.questions.filter(q => !q.selectedOption).length
  if (unanswered > 0) {
    const res = await uni.showModal({
      title: '提示',
      content: `还有 ${unanswered} 道题未作答，确定要交卷吗？`
    })
    if (!res.confirm) return
  }

  submitting.value = true
  try {
    const result = await quizStore.submitCurrentQuiz(session.value.sessionId)
    // Refresh user stats
    await userStore.refreshUser()
    // Navigate to result
    uni.redirectTo({
      url: `/pages/result/result?sessionId=${session.value.sessionId}`
    })
  } catch (e) {
    submitting.value = false
    // If error is "has unanswered questions", navigate to first unanswered
    if (e.message?.includes('未作答')) {
      const firstUnanswered = session.value.questions.findIndex(q => !q.selectedOption)
      if (firstUnanswered >= 0) {
        currentQuestionIndex.value = firstUnanswered
        uni.showToast({ title: '请先完成所有题目', icon: 'none' })
      }
    }
  }
}

async function handleTimeout() {
  if (submitting.value) return
  submitting.value = true
  uni.showToast({ title: '答题时间到，自动交卷', icon: 'none' })
  try {
    // The session should have been auto-submitted by the backend
    // Just navigate to result
    await userStore.refreshUser()
    uni.redirectTo({
      url: `/pages/result/result?sessionId=${session.value.sessionId}`
    })
  } catch (e) {
    // ignore
    uni.redirectTo({
      url: `/pages/result/result?sessionId=${session.value.sessionId}`
    })
  }
}

let backPressTimer = null
function handleBack() {
  if (backPressTimer) {
    clearTimeout(backPressTimer)
    backPressTimer = null
    // Actually go back
    uni.navigateBack()
  } else {
    uni.showToast({ title: '再次点击退出答题', icon: 'none', duration: 2000 })
    backPressTimer = setTimeout(() => {
      backPressTimer = null
    }, 2000)
  }
}
</script>

<style lang="scss" scoped>
.quiz-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-cool;
}

.quiz {
  &__navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: $brand-deep-blue;
    transition-property: background-color;
    transition-duration: $duration-normal;
  }

  &__navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 $spacing-3;
  }

  &__navbar-left {
    width: 80rpx;
  }

  &__navbar-back {
    font-size: 40rpx;
    color: $text-inverse;
    font-weight: 300;
  }

  &__navbar-center {
    flex: 1;
    text-align: center;
  }

  &__navbar-title {
    font-family: $font-display;
    font-size: $text-body;
    font-weight: 600;
    color: $text-inverse;
    letter-spacing: $tracking-heading;
  }

  &__navbar-right {
    width: 180rpx;
  }

  &__progress-track {
    height: 4rpx;
    background: rgba(255, 255, 255, 0.15);
  }

  &__progress-fill {
    height: 100%;
    background: $gradient-cyan;
    transition-property: width;
    transition-duration: $duration-slow;
    transition-timing-function: $ease-out;
    border-radius: 0 2rpx 2rpx 0;
  }

  &__loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-secondary;
    font-size: $text-body-sm;
  }

  &__swiper {
    flex: 1;
    width: 100%;
  }

  &__slide {
    height: 100%;

    &-scroll {
      height: 100%;
      padding: $spacing-2 0 $spacing-4;
    }
  }

  &__footer {
    background: $surface;
    padding: $spacing-2 $spacing-4;
    padding-bottom: calc($spacing-3 + env(safe-area-inset-bottom));
    box-shadow: 0 -2rpx 16rpx rgba($brand-deep-blue, 0.06);
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: $spacing-3;
  }

  &__dot {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background: $divider;
    transition-property: background, transform;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--active {
      border: 3rpx solid $brand-cyan;
      background: transparent;
      transform: scale(1.25);
    }

    &--answered {
      background: $brand-cyan;
    }

    &--current-answered {
      background: $brand-cyan;
      border: 3rpx solid $brand-cyan-dark;
      transform: scale(1.25);
    }
  }

  &__nav {
    display: flex;
    gap: $spacing-3;
  }

  &__nav-spacer {
    flex: 1;
  }

  &__nav-btn {
    flex: 1;
    height: 80rpx;
    border-radius: $radius-lg;
    font-size: $text-body;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--prev {
      background: $surface-secondary;
      color: $text-primary;
      border: 1rpx solid $divider;
    }

    &--next {
      background: $surface-secondary;
      color: $text-primary;
      border: 1rpx solid $divider;
    }

    &--submit {
      flex: 2;
      background: $gradient-cyan;
      color: $text-inverse;
      box-shadow: $shadow-btn;
    }

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }
  }
}
</style>
