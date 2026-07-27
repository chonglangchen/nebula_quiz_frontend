<template>
  <view class="home-page">
    <!-- Hero Banner -->
    <view class="home__hero">
      <n-navbar title="" />
      <!-- Hero title -->
      <view class="home__hero-title">
        <image class="home__hero-logo" src="/static/home-logo.png" mode="aspectFit" />
        <text class="home__hero-line2">"智学 AI·竞逐未来"</text>
        <text class="home__hero-line3">AI知识答题</text>
      </view>
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

    <!-- ====== Intro Modal — shown once per day ====== -->
    <view
      v-if="showIntro"
      class="home__modal-overlay"
      @tap="dismissIntro"
      @touchmove.stop.prevent
    >
      <view class="home__modal-card" @tap.stop>
        <view class="home__modal-head">
          <text class="home__modal-title">关于开展AI知识答题竞赛的通知</text>
        </view>

        <scroll-view class="home__modal-scroll" scroll-y>
          <view class="home__modal-body">
            <text class="home__modal-text">
              为贯彻落实国务院、省国资委关于加快推进省属企业智能体应用研究和人工智能赋能管理提升的有关要求，进一步服务集团数智化转型发展大局，根据集团对各部门、各权属企业干部职工关于人工智能应用意识和实操能力的要求，并依据《福建省大数据集团"智汇数据·AI赋能"AI效能提升行动方案》安排，现开展星云公司AI知识答题竞赛。
            </text>
          </view>

          <view class="home__modal-notice">
            <text class="home__modal-notice-text">
              题库共计200题，每日随机抽选20题，完成全部200题的同志可以凭答题平台页面至星云工会办公室处领取纪念礼品。
            </text>
          </view>

          <image class="home__modal-image" src="/static/ai.png" mode="widthFix" />
        </scroll-view>

        <view class="home__modal-footer">
          <button
            class="home__modal-btn"
            hover-class="home__modal-btn--hover"
            @tap="dismissIntro"
          >
            <text class="home__modal-btn-text">我知道了</text>
          </button>
        </view>
      </view>
    </view>

    <!-- ====== Main content card ====== -->
    <view v-if="quizStore.canStart" class="home__card">
      <button
        class="home__go-btn"
        hover-class="home__go-btn--hover"
        @tap="startQuiz"
      >
        <text class="home__go-btn-text">去答题</text>
      </button>
    </view>

    <!-- Today's status card — only when not in NOT_STARTED state -->
    <view v-if="!quizStore.canStart && !quizStore.loading" class="home__today-card">
      <!-- Training required -->
      <template v-if="quizStore.isTrainingRequired">
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

// ── Intro modal: show once per day ──
const INTRO_DISMISS_KEY = 'quiz_intro_dismissed'

function getDismissedDate() {
  try {
    return uni.getStorageSync(INTRO_DISMISS_KEY) || ''
  } catch (_) {
    return ''
  }
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const showIntro = ref(getDismissedDate() !== todayStr())

function dismissIntro() {
  showIntro.value = false
  uni.setStorageSync(INTRO_DISMISS_KEY, todayStr())
}

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
  // ── Hero ──
  &__hero {
    background: $gradient-brand;
    padding-bottom: 56rpx;
  }

  &__hero-title {
    padding: 16rpx $spacing-4 40rpx;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__hero-logo {
    width: 480rpx;
    height: 360rpx;
    margin-bottom: $spacing-3;
  }

  &__hero-line2 {
    display: block;
    font-family: $font-display;
    font-size: 52rpx;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 6rpx;
    margin-bottom: $spacing-3;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  }

  &__hero-line3 {
    display: block;
    font-family: $font-display;
    font-size: 52rpx;
    font-weight: 700;
    color: $text-inverse;
    letter-spacing: 8rpx;
    text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
  }

  &__welcome {
    padding: 16rpx $spacing-4 0;
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

  // ── Intro Modal ──
  &__modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-6 $spacing-4;
  }

  &__modal-card {
    width: 100%;
    max-width: 640rpx;
    max-height: 80vh;
    background: $surface;
    border-radius: $radius-xl;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
  }

  &__modal-head {
    padding: $spacing-5 $spacing-4 $spacing-3;
    text-align: center;
  }

  &__modal-title {
    font-family: $font-display;
    font-size: $text-h3;
    font-weight: 700;
    color: $brand-deep-blue;
    letter-spacing: $tracking-heading;
    line-height: 1.5;
  }

  &__modal-scroll {
    flex: 1;
    padding: 0 $spacing-4;
  }

  &__modal-body {
    margin-bottom: $spacing-3;
  }

  &__modal-text {
    font-size: $text-body-sm;
    color: $text-primary;
    line-height: 1.8;
    font-family: $font-body;
  }

  &__modal-notice {
    background: $danger-light;
    border-left: 6rpx solid $danger;
    border-radius: 0 $radius-sm $radius-sm 0;
    padding: $spacing-3;
    margin-bottom: $spacing-2;
  }

  &__modal-notice-text {
    font-size: $text-body-sm;
    color: $danger;
    font-weight: 600;
    line-height: 1.7;
  }

  &__modal-image {
    width: 100%;
    display: block;
    border-radius: $radius-lg;
    margin-top: $spacing-3;
  }

  &__modal-footer {
    padding: $spacing-3 $spacing-4 $spacing-5;
  }

  &__modal-btn {
    width: 100%;
    height: 88rpx;
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

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }

    &-text {
      font-size: $text-body;
      font-weight: 600;
      color: $text-inverse;
    }
  }

  // ── Main content card (only shows when canStart) ──
  &__card {
    margin: -40rpx $spacing-4 0;
    background: $surface;
    border-radius: $radius-xl;
    padding: $spacing-5 $spacing-4;
    box-shadow: $shadow-elevated;
    position: relative;
    z-index: 2;
  }

  &__go-btn {
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

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }

    &-text {
      font-size: $text-body;
      font-weight: 600;
      color: $text-inverse;
    }
  }

  // ── Today card ──
  &__today-card {
    margin: $spacing-4 $spacing-4 0;
    background: $surface;
    border-radius: $radius-xl;
    padding: $spacing-5 $spacing-4;
    box-shadow: $shadow-elevated;
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

  // ── Quick stats ──
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
