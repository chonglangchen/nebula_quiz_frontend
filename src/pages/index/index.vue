<template>
  <view class="home-page">
    <!-- Hero Banner -->
    <view class="home__hero">
      <n-navbar title="星云答题" />
      <view class="home__welcome">
        <view class="home__greeting">
          <text class="home__greeting-text">{{ greetingText }}</text>
          <text class="home__user-name">{{ userStore.displayName }}</text>
        </view>
        <view class="home__progress-box">
          <text class="home__progress-num">{{ userStore.answeredCount }}/{{ userStore.totalQuestionCount }}</text>
          <text class="home__progress-label">已答题数</text>
        </view>
      </view>
    </view>

    <!-- Today's status card -->
    <view class="home__today-card">
      <!-- Loading -->
      <template v-if="quizStore.loading">
        <view class="home__loading">
          <n-skeleton height="48" :radius="12" style="margin-bottom: 16rpx" />
          <n-skeleton height="32" :radius="8" width="60%" />
        </view>
      </template>

      <!-- Training required -->
      <template v-else-if="quizStore.isTrainingRequired">
        <view class="home__status">
          <text class="home__status-title">请先完成培训确认</text>
          <text class="home__status-desc">首次答题前需要阅读培训材料</text>
        </view>
        <button class="home__cta" hover-class="home__cta--hover" @tap="goTraining">
          <text class="home__cta-text">前往确认</text>
        </button>
      </template>

      <!-- In progress -->
      <template v-else-if="quizStore.isInProgress">
        <view class="home__status">
          <view class="home__status-badge home__status-badge--active">
            <text>答题中</text>
          </view>
          <text class="home__status-title">您有一场答题正在进行</text>
          <text class="home__status-desc">继续完成今日的答题挑战</text>
        </view>
        <button class="home__cta" hover-class="home__cta--hover" @tap="continueQuiz">
          <text class="home__cta-text">继续答题</text>
        </button>
      </template>

      <!-- Submitted today -->
      <template v-else-if="quizStore.isSubmitted">
        <view class="home__status">
          <view class="home__status-badge home__status-badge--done">
            <text>已完成</text>
          </view>
          <text class="home__status-title">今日答题已完成</text>
          <text class="home__status-desc">明天再来挑战新题目吧</text>
        </view>
        <button class="home__cta home__cta--secondary" hover-class="home__cta--hover" @tap="viewTodayResult">
          <text class="home__cta-text--secondary">查看结果</text>
        </button>
      </template>

      <!-- All completed -->
      <template v-else-if="quizStore.isAllCompleted">
        <view class="home__status">
          <text class="home__status-title">恭喜完成全部题目</text>
          <text class="home__status-desc">您已答完题库中所有200道题目</text>
        </view>
      </template>

      <!-- Not started (can start) -->
      <template v-else>
        <view class="home__status">
          <text class="home__status-title">今日答题待挑战</text>
          <text class="home__status-desc">{{ todayInfo.questionCount }}道题目 / {{ todayInfo.durationMinutes }}分钟限时 / 每天限答1次</text>
        </view>
        <button class="home__cta" hover-class="home__cta--hover" @tap="startQuiz">
          <text class="home__cta-text">开始答题</text>
        </button>
      </template>
    </view>

    <!-- Quick stats -->
    <view class="home__quick-stats">
      <view class="home__stat-item" @tap="goHistory">
        <text class="home__stat-value">{{ userStore.user?.statistics?.quizCount || 0 }}</text>
        <text class="home__stat-label">累计答题</text>
      </view>
      <view class="home__stat-item">
        <text class="home__stat-value">{{ userStore.user?.statistics?.averageScore || 0 }}分</text>
        <text class="home__stat-label">平均得分</text>
      </view>
      <view class="home__stat-item">
        <text class="home__stat-value">{{ Math.round(userStore.completionRate * 100) }}%</text>
        <text class="home__stat-label">完成进度</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useQuizStore } from '@/store/quiz'
import { QUIZ_CONFIG } from '@/utils/constants'

const userStore = useUserStore()
const quizStore = useQuizStore()

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，'
  if (hour < 9) return '早上好，'
  if (hour < 12) return '上午好，'
  if (hour < 14) return '中午好，'
  if (hour < 18) return '下午好，'
  return '晚上好，'
})

const todayInfo = computed(() => ({
  questionCount: quizStore.todayStatus?.questionCount || QUIZ_CONFIG.DAILY_QUESTION_COUNT,
  durationMinutes: Math.floor((quizStore.todayStatus?.durationSeconds || QUIZ_CONFIG.DURATION_SECONDS) / 60)
}))

onMounted(async () => {
  await userStore.refreshUser().catch(() => {})
  await quizStore.loadToday()
})

onShow(async () => {
  await quizStore.loadToday()
})

function goTraining() {
  uni.navigateTo({ url: '/pages/training/training' })
}

function continueQuiz() {
  const sessionId = quizStore.todayStatus?.sessionId
  if (sessionId) {
    uni.navigateTo({ url: `/pages/quiz/quiz?sessionId=${sessionId}` })
  }
}

function viewTodayResult() {
  const sessionId = quizStore.todayStatus?.sessionId
  if (sessionId) {
    uni.navigateTo({ url: `/pages/result/result?sessionId=${sessionId}` })
  }
}

async function startQuiz() {
  try {
    await quizStore.startQuiz()
    const sessionId = quizStore.currentSession?.sessionId
    if (sessionId) {
      uni.navigateTo({ url: `/pages/quiz/quiz?sessionId=${sessionId}` })
    }
  } catch (e) {
    // Error handled by interceptor
  }
}

function goHistory() {
  uni.switchTab({ url: '/pages/history/history' })
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: $bg-cool;
}

.home {
  &__hero {
    background: $gradient-brand;
    padding-bottom: $spacing-8;
  }

  &__welcome {
    padding: 0 $spacing-4;
  }

  &__greeting {
    margin-bottom: $spacing-4;

    &-text {
      font-size: $text-body-sm;
      color: rgba(255, 255, 255, 0.6);
    }

    &-name {
      display: block;
      font-family: $font-display;
      font-size: $text-h1;
      font-weight: 700;
      color: $text-inverse;
      letter-spacing: $tracking-heading;
      margin-top: 4rpx;
    }
  }

  &__user-name {
    display: block;
    font-family: $font-display;
    font-size: $text-h1;
    font-weight: 700;
    color: $text-inverse;
    letter-spacing: $tracking-heading;
    margin-top: 4rpx;
  }

  &__progress-box {
    text-align: center;
    padding: $spacing-4 0;
    background: rgba(255, 255, 255, 0.06);
    border-radius: $radius-lg;
  }

  &__progress-num {
    display: block;
    font-family: $font-display;
    font-size: $text-h2;
    font-weight: 700;
    color: $text-inverse;
    letter-spacing: $tracking-heading;
  }

  &__progress-label {
    font-size: $text-xs;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4rpx;
  }

  // Today card
  &__today-card {
    margin: -$spacing-3 $spacing-4 0;
    background: $surface;
    border-radius: $radius-xl;
    padding: $spacing-5 $spacing-4;
    box-shadow: $shadow-elevated;
    position: relative;
    z-index: 2;
    text-align: center;
  }

  &__loading {
    padding: $spacing-2 0;
  }

  &__status {
    margin-bottom: $spacing-5;

    &-badge {
      display: inline-flex;
      padding: 6rpx 20rpx;
      border-radius: $radius-full;
      margin-bottom: $spacing-3;
      font-size: $text-caption;
      font-weight: 600;

      &--active {
        background: $warning-light;
        color: $warning;
      }

      &--done {
        background: $success-light;
        color: $success;
      }
    }

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h2;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
      margin-bottom: $spacing-2;
    }

    &-desc {
      font-size: $text-body-sm;
      color: $text-secondary;
      line-height: $leading-body;
    }
  }

  &__cta {
    width: 100%;
    height: 96rpx;
    background: $gradient-cyan;
    border-radius: $radius-lg;
    border: none;
    box-shadow: $shadow-btn;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--secondary {
      background: $surface-secondary;
      box-shadow: none;
      border: 1rpx solid $divider;
    }

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }

    &-text {
      font-size: $text-body;
      font-weight: 600;
      color: $text-inverse;
    }

    &-text--secondary {
      font-size: $text-body;
      font-weight: 600;
      color: $text-primary;
    }
  }

  // Quick stats
  &__quick-stats {
    display: flex;
    margin: $spacing-4;
    gap: $spacing-3;
  }

  &__stat-item {
    flex: 1;
    background: $surface;
    border-radius: $radius-lg;
    padding: $spacing-3 $spacing-2;
    text-align: center;
    box-shadow: $shadow-soft;
  }

  &__stat-value {
    display: block;
    font-family: $font-display;
    font-size: $text-h3;
    font-weight: 700;
    color: $brand-cyan;
    letter-spacing: $tracking-heading;
    margin-bottom: 4rpx;
  }

  &__stat-label {
    font-size: $text-xs;
    color: $text-secondary;
  }
}
</style>
