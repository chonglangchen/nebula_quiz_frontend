<template>
  <view class="result-page">
    <!-- Score hero -->
    <view class="result__hero">
      <n-navbar title="答题结果" show-back @back="handleBack" />

      <view v-if="loading" class="result__loading">
        <text>加载中…</text>
      </view>

      <template v-else-if="result">
        <!-- Score circle -->
        <view class="result__score-area">
          <n-progress-ring
            :progress="result.score / 100"
            :value="result.score + '分'"
            :label="grade.label"
            :size="240"
            :stroke-width="14"
            :color="grade.color"
          />
        </view>

        <!-- Stats row -->
        <view class="result__stats">
          <view class="result__stat">
            <text class="result__stat-value">{{ result.correctCount }}/{{ result.questionCount }}</text>
            <text class="result__stat-label">答对</text>
          </view>
          <view class="result__stat-divider" />
          <view class="result__stat">
            <text class="result__stat-value">{{ formatDurationCN(result.durationSeconds) }}</text>
            <text class="result__stat-label">用时</text>
          </view>
          <view class="result__stat-divider" />
          <view class="result__stat">
            <text class="result__stat-value">{{ isPassed ? '通过' : '未通过' }}</text>
            <text class="result__stat-label" :style="{ color: isPassed ? '#22C55E' : '#EF4444' }">结果</text>
          </view>
        </view>

        <!-- Overall progress -->
        <view class="result__overall-progress">
          <text class="result__progress-label">
            累计完成 {{ result.progress.answeredQuestionCount }}/{{ result.progress.totalQuestionCount }} 题
            ({{ Math.round(result.progress.completionRate * 100) }}%)
          </text>
          <view class="result__progress-track">
            <view
              class="result__progress-fill"
              :style="{ width: Math.round(result.progress.completionRate * 100) + '%' }"
            />
          </view>
        </view>
      </template>
    </view>

    <!-- Answer review -->
    <view v-if="result" class="result__review">
      <view class="result__review-header">
        <text class="result__review-title">答题详情</text>
        <text class="result__review-summary">
          答对 {{ result.correctCount }} 题 · 答错 {{ result.questionCount - result.correctCount }} 题
        </text>
      </view>

      <view class="result__questions">
        <n-question-card
          v-for="answer in result.answers"
          :key="answer.questionId"
          :question-id="answer.questionId"
          :sequence="answer.sequence"
          :total="result.questionCount"
          :content="answer.content"
          :options="answer.options"
          :selected-option="answer.selectedOption"
          :correct-option="answer.correctOption"
          :show-result="true"
          :is-correct="answer.correct"
          :knowledge-tag="answer.knowledgeTag"
        />
      </view>
    </view>

    <!-- Actions -->
    <view v-if="result" class="result__actions">
      <button class="result__btn result__btn--home" hover-class="result__btn--hover" @tap="goHome">
        <text>返回首页</text>
      </button>
      <button class="result__btn result__btn--review" hover-class="result__btn--hover" @tap="scrollToReview">
        <text>查看详情</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '@/store/quiz'
import { formatDurationCN, scoreToGrade } from '@/utils'

const quizStore = useQuizStore()
const loading = ref(true)

// Get sessionId from route
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const sessionId = currentPage?.options?.sessionId

const result = computed(() => quizStore.currentResult)

const grade = computed(() => {
  if (!result.value) return { grade: '-', label: '', color: '#64748B' }
  return scoreToGrade(result.value.score)
})

const isPassed = computed(() => (result.value?.score || 0) >= 60)

onMounted(async () => {
  try {
    if (sessionId) {
      await quizStore.loadResult(parseInt(sessionId))
    }
  } catch (e) {
    uni.showToast({ title: '加载结果失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

function handleBack() {
  uni.switchTab({ url: '/pages/index/index' })
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function scrollToReview() {
  uni.pageScrollTo({
    selector: '.result__review',
    duration: 300
  })
}
</script>

<style lang="scss" scoped>
.result-page {
  min-height: 100vh;
  background: $bg-cool;
}

.result {
  &__hero {
    background: $gradient-brand;
    padding-bottom: $spacing-8;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__loading {
    padding: $spacing-10 $spacing-4;
    color: rgba(255, 255, 255, 0.6);
    font-size: $text-body-sm;
  }

  &__score-area {
    margin: $spacing-4 0;
  }

  &__stats {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: $radius-lg;
    padding: $spacing-3 $spacing-5;
    backdrop-filter: blur(10rpx);
    width: calc(100% - $spacing-8);
    max-width: 560rpx;
  }

  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    &-value {
      font-family: $font-display;
      font-size: $text-body;
      font-weight: 700;
      color: $text-inverse;
      letter-spacing: $tracking-heading;
      margin-bottom: 4rpx;
    }

    &-label {
      font-size: $text-xs;
      color: rgba(255, 255, 255, 0.55);
    }

    &-divider {
      width: 2rpx;
      height: 40rpx;
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &__overall-progress {
    margin-top: $spacing-5;
    width: calc(100% - $spacing-8);
    max-width: 560rpx;
  }

  &__progress-label {
    display: block;
    font-size: $text-caption;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: $spacing-2;
    text-align: center;
  }

  &__progress-track {
    height: 6rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3rpx;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: $gradient-cyan;
    border-radius: 3rpx;
    transition-property: width;
    transition-duration: 800ms;
    transition-timing-function: $ease-out;
  }

  // Review section
  &__review {
    margin-top: -$spacing-2;
    position: relative;
    z-index: 2;

    &-header {
      padding: $spacing-4;
      text-align: center;
    }

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
      margin-bottom: $spacing-1;
    }

    &-summary {
      font-size: $text-body-sm;
      color: $text-secondary;
    }
  }

  &__questions {
    padding: 0 $spacing-2;
  }

  // Action buttons
  &__actions {
    position: sticky;
    bottom: 0;
    display: flex;
    gap: $spacing-3;
    padding: $spacing-4;
    padding-bottom: calc($spacing-4 + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, transparent 0%, $bg-cool 30%);
  }

  &__btn {
    flex: 1;
    height: 88rpx;
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

    &--home {
      background: $surface-secondary;
      color: $text-primary;
      border: 1rpx solid $divider;
    }

    &--review {
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
