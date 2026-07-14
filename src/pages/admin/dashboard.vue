<template>
  <view class="admin-page">
    <!-- Overview cards -->
    <view class="admin__overview">
      <view class="admin__card admin__card--dark">
        <text class="admin__card-value">{{ dashboard.overview?.registeredUserCount || 0 }}</text>
        <text class="admin__card-label">总注册人数</text>
      </view>
      <view class="admin__card admin__card--cyan">
        <text class="admin__card-value">{{ dashboard.overview?.answeredUserCount || 0 }}</text>
        <text class="admin__card-label">今日已答题</text>
      </view>
      <view class="admin__card admin__card--teal">
        <text class="admin__card-value">{{ fmtPercent(dashboard.overview?.participationRate) }}%</text>
        <text class="admin__card-label">参与率</text>
      </view>
      <view class="admin__card admin__card--amber">
        <text class="admin__card-value">{{ fmtScore(dashboard.overview?.companyAverageScore) }}</text>
        <text class="admin__card-label">平均得分</text>
      </view>
    </view>

    <!-- Loading state -->
    <view v-if="loading" class="admin__loading">
      <n-skeleton height="200" :radius="12" style="margin-bottom: 16rpx" />
      <n-skeleton height="200" :radius="12" />
    </view>

    <!-- Department breakdown -->
    <template v-else-if="dashboard.departments?.length">
      <view class="admin__section">
        <text class="admin__section-title">部门统计</text>
      </view>

      <view class="admin__dept-list">
        <view
          v-for="dept in dashboard.departments"
          :key="dept.departmentCode"
          class="admin__dept-item"
        >
          <view class="admin__dept-info">
            <text class="admin__dept-name">{{ dept.departmentName }}</text>
            <text class="admin__dept-count">
              已答 {{ dept.answeredUserCount }}/{{ dept.registeredUserCount }}
              · 参与率 {{ fmtPercent(dept.participationRate) }}%
            </text>
          </view>
          <view class="admin__dept-score">
            <text class="admin__dept-score-value" :style="{ color: deptAvgColor(dept.averageScore) }">
              {{ fmtScore(dept.averageScore) }}
            </text>
            <text class="admin__dept-score-label">均分</text>
          </view>
        </view>
      </view>
    </template>

    <!-- Trend (7 days) -->
    <template v-if="dashboard.trend?.length">
      <view class="admin__section">
        <text class="admin__section-title">近7天趋势</text>
      </view>

      <view class="admin__trend-card">
        <!-- Mini chart: bar-like representation -->
        <view class="admin__trend-chart">
          <view
            v-for="(day, idx) in dashboard.trend"
            :key="idx"
            class="admin__trend-bar-col"
          >
            <view class="admin__trend-bar-wrapper">
              <view
                class="admin__trend-bar"
                :style="{ height: barHeight(day.answeredUserCount, maxAnswered) }"
              />
            </view>
            <text class="admin__trend-bar-label">{{ day.answeredUserCount }}</text>
            <text class="admin__trend-bar-date">{{ fmtShortDate(day.date) }}</text>
          </view>
        </view>

        <!-- Score trend -->
        <view class="admin__trend-scores">
          <view
            v-for="(day, idx) in dashboard.trend"
            :key="'s-' + idx"
            class="admin__trend-score-item"
          >
            <text class="admin__trend-score-date">{{ fmtShortDate(day.date) }}</text>
            <text class="admin__trend-score-val">{{ fmtScore(day.averageScore) }}分</text>
            <text class="admin__trend-score-people">{{ day.answeredUserCount }}人</text>
          </view>
        </view>
      </view>
    </template>

    <!-- Refresh -->
    <view class="admin__refresh">
      <text class="admin__refresh-text" @tap="refresh">
        更新时间: {{ lastUpdate }} · 点击刷新
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { fetchDashboard } from '@/api/admin'
import { formatDate } from '@/utils'

const loading = ref(true)
const lastUpdate = ref('')

const dashboard = reactive({
  asOf: null,
  date: null,
  overview: null,
  departments: [],
  trend: []
})

const maxAnswered = computed(() => {
  if (!dashboard.trend?.length) return 1
  return Math.max(1, ...dashboard.trend.map(d => d.answeredUserCount))
})

function fmtPercent(val) {
  if (val == null) return '0'
  return (val * 100).toFixed(1)
}

function fmtScore(val) {
  if (val == null || val === undefined) return '-'
  return val
}

function fmtShortDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(5) // MM-DD
}

function barHeight(count, max) {
  if (!count || !max) return '20rpx'
  const pct = count / max
  return `${20 + pct * 100}rpx`
}

function deptAvgColor(score) {
  if (score == null) return '#94A3B8'
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#0EA5E9'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

onMounted(async () => {
  await refresh()
})

async function refresh() {
  loading.value = true
  try {
    const data = await fetchDashboard()
    Object.assign(dashboard, data)
    lastUpdate.value = formatDate(new Date())
  } catch (e) {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background: $bg-cool;
  padding-bottom: $spacing-4;
}

.admin {
  // Overview grid
  &__overview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-3;
    padding: $spacing-4;
  }

  &__card {
    padding: $spacing-4;
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;

    &--dark {
      background: $brand-deep-blue;
      .admin__card-value { color: $text-inverse; }
      .admin__card-label { color: rgba(255, 255, 255, 0.6); }
    }
    &--cyan {
      background: linear-gradient(135deg, $brand-cyan, $brand-cyan-dark);
      .admin__card-value { color: $text-inverse; }
      .admin__card-label { color: rgba(255, 255, 255, 0.7); }
    }
    &--teal {
      background: linear-gradient(135deg, $brand-teal, #0D9488);
      .admin__card-value { color: $text-inverse; }
      .admin__card-label { color: rgba(255, 255, 255, 0.7); }
    }
    &--amber {
      background: linear-gradient(135deg, $warning, #D97706);
      .admin__card-value { color: $text-inverse; }
      .admin__card-label { color: rgba(255, 255, 255, 0.7); }
    }

    &-value {
      font-family: $font-display;
      font-size: $text-h1;
      font-weight: 700;
      letter-spacing: $tracking-heading;
      margin-bottom: 4rpx;
    }

    &-label {
      font-size: $text-caption;
    }
  }

  &__loading {
    padding: $spacing-4;
  }

  &__section {
    padding: $spacing-4 $spacing-4 $spacing-2;

    &-title {
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
    }
  }

  // Department list
  &__dept-list {
    margin: 0 $spacing-4;
    background: $surface;
    border-radius: $radius-lg;
    box-shadow: $shadow-soft;
    overflow: hidden;
  }

  &__dept-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-3 $spacing-4;
    border-bottom: 1rpx solid $divider-light;

    &:last-child {
      border-bottom: none;
    }
  }

  &__dept-info {
    flex: 1;
    min-width: 0;
  }

  &__dept-name {
    display: block;
    font-size: $text-body-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  &__dept-count {
    font-size: $text-xs;
    color: $text-tertiary;
  }

  &__dept-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: $spacing-3;

    &-value {
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      letter-spacing: $tracking-heading;
    }

    &-label {
      font-size: $text-xs;
      color: $text-tertiary;
    }
  }

  // Trend
  &__trend-card {
    margin: 0 $spacing-4;
    background: $surface;
    border-radius: $radius-lg;
    padding: $spacing-4;
    box-shadow: $shadow-soft;
  }

  &__trend-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 180rpx;
    margin-bottom: $spacing-4;
    padding-bottom: 0;
  }

  &__trend-bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  &__trend-bar-wrapper {
    height: 120rpx;
    display: flex;
    align-items: flex-end;
    margin-bottom: 4rpx;
  }

  &__trend-bar {
    width: 36rpx;
    background: $gradient-cyan;
    border-radius: $radius-sm $radius-sm 0 0;
    transition-property: height;
    transition-duration: 600ms;
    transition-timing-function: $ease-out;
    min-height: 8rpx;
  }

  &__trend-bar-label {
    font-size: $text-xs;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 2rpx;
  }

  &__trend-bar-date {
    font-size: 18rpx;
    color: $text-tertiary;
  }

  &__trend-scores {
    border-top: 1rpx solid $divider-light;
    padding-top: $spacing-3;
  }

  &__trend-score-item {
    display: flex;
    align-items: center;
    padding: $spacing-1 0;
  }

  &__trend-score-date {
    font-size: $text-caption;
    color: $text-secondary;
    width: 100rpx;
  }

  &__trend-score-val {
    font-size: $text-body-sm;
    font-weight: 600;
    color: $text-primary;
    flex: 1;
  }

  &__trend-score-people {
    font-size: $text-caption;
    color: $text-tertiary;
  }

  // Refresh
  &__refresh {
    text-align: center;
    padding: $spacing-5 $spacing-4;

    &-text {
      font-size: $text-caption;
      color: $text-tertiary;
    }
  }
}
</style>
