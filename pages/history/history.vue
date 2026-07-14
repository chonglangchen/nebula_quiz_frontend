<template>
  <view class="history-page">
    <!-- Summary bar -->
    <view class="hist__summary">
      <view class="hist__summary-item">
        <text class="hist__summary-value">{{ totalRecords }}</text>
        <text class="hist__summary-label">次答题</text>
      </view>
      <view class="hist__summary-item">
        <text class="hist__summary-value">{{ userStore.user?.statistics?.averageScore || 0 }}分</text>
        <text class="hist__summary-label">平均分</text>
      </view>
    </view>

    <!-- List -->
    <scroll-view
      class="hist__list"
      scroll-y
      @scrolltolower="loadMore"
      lower-threshold="100"
    >
      <view v-if="loading && records.length === 0" class="hist__loading">
        <n-skeleton height="100" :radius="12" style="margin-bottom: 16rpx" />
        <n-skeleton height="100" :radius="12" style="margin-bottom: 16rpx" />
        <n-skeleton height="100" :radius="12" />
      </view>

      <n-empty-state
        v-else-if="!loading && records.length === 0"
        title="暂无答题记录"
        description="完成答题后，记录将显示在这里"
      />

      <view
        v-for="record in records"
        :key="record.sessionId"
        class="hist__card"
        hover-class="hist__card--hover"
        @tap="viewResult(record.sessionId)"
      >
        <view class="hist__card-top">
          <view class="hist__card-date">
            <text class="hist__card-day">{{ formatDateRelative(record.date) }}</text>
            <text class="hist__card-full">{{ record.date }}</text>
          </view>
          <view class="hist__card-score" :style="{ color: scoreToGrade(record.score).color }">
            <text class="hist__card-score-num">{{ record.score }}</text>
            <text class="hist__card-score-unit">分</text>
          </view>
        </view>
        <view class="hist__card-bottom">
          <view class="hist__card-meta">
            <text>答对 {{ record.correctCount }}/{{ record.questionCount }}</text>
          </view>
          <view class="hist__card-meta">
            <text>用时 {{ formatDurationCN(record.durationSeconds) }}</text>
          </view>
          <view class="hist__card-meta">
            <text class="hist__card-reason">{{ record.submitReason === 'TIMEOUT' ? '超时交卷' : '手动交卷' }}</text>
          </view>
        </view>
        <view class="hist__card-arrow">
          <text>›</text>
        </view>
      </view>

      <!-- Load more -->
      <view v-if="hasMore" class="hist__more">
        <text v-if="loadingMore" class="hist__more-text">加载中…</text>
        <text v-else class="hist__more-text" @tap="loadMore">加载更多</text>
      </view>
      <view v-else-if="records.length > 0" class="hist__more">
        <text class="hist__more-text">— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '@/store/quiz'
import { useUserStore } from '@/store/user'
import { formatDateRelative, formatDurationCN, scoreToGrade } from '@/utils'

const quizStore = useQuizStore()
const userStore = useUserStore()

const loading = ref(true)
const loadingMore = ref(false)
const page = ref(1)
const pageSize = 20

const records = computed(() => quizStore.historyData?.items || [])
const totalRecords = computed(() => quizStore.historyData?.total || 0)
const totalPages = computed(() => quizStore.historyData?.totalPages || 0)
const hasMore = computed(() => page.value < totalPages.value)

onMounted(async () => {
  try {
    await quizStore.loadHistory(1, pageSize)
    page.value = 1
  } finally {
    loading.value = false
  }
})

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const nextPage = page.value + 1
    const result = await quizStore.loadHistory(nextPage, pageSize)
    page.value = nextPage
  } finally {
    loadingMore.value = false
  }
}

function viewResult(sessionId) {
  uni.navigateTo({
    url: `/pages/result/result?sessionId=${sessionId}`
  })
}
</script>

<style lang="scss" scoped>
.history-page {
  min-height: 100vh;
  background: $bg-cool;
  display: flex;
  flex-direction: column;
}

.hist {
  &__summary {
    display: flex;
    background: $surface;
    padding: $spacing-4;
    margin-bottom: $spacing-2;
  }

  &__summary-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    &-value {
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      color: $brand-cyan;
      letter-spacing: $tracking-heading;
    }

    &-label {
      font-size: $text-xs;
      color: $text-secondary;
      margin-top: 4rpx;
    }
  }

  &__list {
    flex: 1;
    padding: $spacing-2 $spacing-4;
  }

  &__loading {
    padding: $spacing-4 0;
  }

  &__card {
    position: relative;
    background: $surface;
    border-radius: $radius-lg;
    padding: $spacing-4;
    margin-bottom: $spacing-3;
    box-shadow: $shadow-soft;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--hover {
      transform: scale(0.985);
      opacity: 0.9;
    }

    &-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: $spacing-3;
    }

    &-date {
      display: flex;
      flex-direction: column;
    }

    &-day {
      font-family: $font-display;
      font-size: $text-body;
      font-weight: 600;
      color: $text-primary;
      letter-spacing: $tracking-heading;
    }

    &-full {
      font-size: $text-caption;
      color: $text-secondary;
      margin-top: 4rpx;
    }

    &-score {
      display: flex;
      align-items: baseline;

      &-num {
        font-family: $font-display;
        font-size: 52rpx;
        font-weight: 700;
        letter-spacing: $tracking-heading;
      }

      &-unit {
        font-size: $text-body-sm;
        margin-left: 4rpx;
        font-weight: 600;
      }
    }

    &-bottom {
      display: flex;
      gap: $spacing-4;
    }

    &-meta {
      font-size: $text-caption;
      color: $text-secondary;
    }

    &-reason {
      color: $text-tertiary;
    }

    &-arrow {
      position: absolute;
      right: $spacing-4;
      top: 50%;
      transform: translateY(-50%);
      font-size: 36rpx;
      color: $text-tertiary;
      font-weight: 300;
    }
  }

  &__more {
    text-align: center;
    padding: $spacing-4;

    &-text {
      font-size: $text-caption;
      color: $text-tertiary;
    }
  }
}
</style>
