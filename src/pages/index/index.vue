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
    >
      <!-- 背景触摸拦截层：阻止弹窗后页面滚动，不影响弹窗内 scroll-view -->
      <view class="home__modal-overlay-bg" @touchmove.stop.prevent />
      <view class="home__modal-card" @tap.stop>
        <view class="home__modal-scroll">
          <view class="home__modal-head">
            <text class="home__modal-title">关于开展AI知识答题竞赛的通知</text>
          </view>

          <view class="home__modal-body">
            <text class="home__modal-text">
              为贯彻落实国务院、省国资委关于加快推进省属企业智能体应用研究和人工智能赋能管理提升的有关要求，进一步服务集团数智化转型发展大局，根据集团对各部门、各权属企业干部职工关于人工智能应用意识和实操能力的要求，并依据《福建省大数据集团"智汇数据·AI赋能"AI效能提升行动方案》安排，现开展星云公司AI知识答题竞赛。
            </text>
          </view>

          <view class="home__modal-notice">
            <text class="home__modal-notice-text">
              本次AI知识答题竞赛已圆满结束，感谢各位同志的积极参与！答题功能已关闭，您仍可查看历史记录与错题回顾。
            </text>
          </view>

          <image class="home__modal-image" src="/static/ai.png" mode="widthFix" />

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
    </view>

    <!-- ====== Quiz closed notice ====== -->
    <view class="home__card home__card--closed">
      <view class="home__closed-icon">⏰</view>
      <text class="home__closed-title">答题活动已结束</text>
      <text class="home__closed-desc">本次AI知识答题竞赛已圆满结束，感谢大家的积极参与！您仍可查看历史答题记录和错题回顾。</text>
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
    justify-content: center;
    align-items: center;
    padding: $spacing-6 $spacing-4;
  }

  &__modal-overlay-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__modal-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 640rpx;
    max-height: 80vh;
    background: $surface;
    border-radius: $radius-xl;
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
    max-height: 80vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 $spacing-4 $spacing-4;
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
    padding: $spacing-4 0 0;
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

    &--closed {
      text-align: center;
    }
  }

  &__closed-icon {
    font-size: 64rpx;
    margin-bottom: $spacing-3;
  }

  &__closed-title {
    display: block;
    font-family: $font-display;
    font-size: $text-h2;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: $tracking-heading;
    margin-bottom: $spacing-3;
  }

  &__closed-desc {
    font-size: $text-body-sm;
    color: $text-secondary;
    line-height: 1.8;
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
