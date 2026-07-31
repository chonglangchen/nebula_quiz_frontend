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

    <!-- Export section -->
    <view class="admin__section">
      <text class="admin__section-title">数据导出</text>
    </view>

    <view class="admin__export-card">
      <!-- Export 1: Employee details -->
      <view class="admin__export-item">
        <view class="admin__export-info">
          <text class="admin__export-name">员工答题明细</text>
          <text class="admin__export-desc">导出指定日期所有已答题员工的答题记录</text>
        </view>
        <view class="admin__export-controls">
          <picker mode="date" :value="exportDate1" @change="e => exportDate1 = e.detail.value">
            <view class="admin__export-date">
              <text>{{ exportDate1 || '选择日期' }}</text>
            </view>
          </picker>
          <view class="admin__export-btn" hover-class="admin__export-btn--hover" @tap="handleExport1">
            <text class="admin__export-btn-text">导出</text>
          </view>
        </view>
      </view>

      <!-- Export 2: Department status -->
      <view class="admin__export-item">
        <view class="admin__export-info">
          <text class="admin__export-name">部门员工答题情况</text>
          <text class="admin__export-desc">导出指定部门所有员工在指定日期的答题状态</text>
        </view>
        <view class="admin__export-controls">
          <picker mode="date" :value="exportDate2" @change="e => exportDate2 = e.detail.value">
            <view class="admin__export-date">
              <text>{{ exportDate2 || '选择日期' }}</text>
            </view>
          </picker>
          <picker :range="deptOptions" @change="e => exportDept = deptOptions[e.detail.value]">
            <view class="admin__export-date">
              <text>{{ exportDept || '选择部门' }}</text>
            </view>
          </picker>
          <view class="admin__export-btn" hover-class="admin__export-btn--hover" @tap="handleExport2">
            <text class="admin__export-btn-text">导出</text>
          </view>
        </view>
      </view>

      <!-- Export 3: Participation rate -->
      <view class="admin__export-item admin__export-item--last">
        <view class="admin__export-info">
          <text class="admin__export-name">部门参与率统计</text>
          <text class="admin__export-desc">按日期和部门聚合统计参与人数与参与率</text>
        </view>
        <view class="admin__export-controls">
          <picker mode="date" :value="exportStartDate" @change="e => exportStartDate = e.detail.value">
            <view class="admin__export-date">
              <text>{{ exportStartDate || '开始日期' }}</text>
            </view>
          </picker>
          <picker mode="date" :value="exportEndDate" @change="e => exportEndDate = e.detail.value">
            <view class="admin__export-date">
              <text>{{ exportEndDate || '结束日期' }}</text>
            </view>
          </picker>
          <view class="admin__export-btn" hover-class="admin__export-btn--hover" @tap="handleExport3">
            <text class="admin__export-btn-text">导出</text>
          </view>
        </view>
      </view>
    </view>

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
import { fetchDashboard, exportEmployeeDetails, exportDepartmentStatus, exportParticipationRate } from '@/api/admin'
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

// ── Export state ──
const exportDate1 = ref('')
const exportDate2 = ref('')
const exportStartDate = ref('')
const exportEndDate = ref('')
const exportDept = ref('')
const deptOptions = computed(() => {
  return (dashboard.departments || []).map(d => d.departmentName)
})

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
  // Maps to SCSS design tokens: $success, $brand-cyan, $warning, $danger
  if (score == null) return '#94A3B8' /* $text-tertiary */
  if (score >= 80) return '#22C55E' /* $success */
  if (score >= 60) return '#0EA5E9' /* $brand-cyan */
  if (score >= 40) return '#F59E0B' /* $warning */
  return '#EF4444' /* $danger */
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
    // Set default export dates
    const today = getTodayStr()
    if (!exportDate1.value) exportDate1.value = today
    if (!exportDate2.value) exportDate2.value = today
    if (!exportStartDate.value) exportStartDate.value = today
    if (!exportEndDate.value) exportEndDate.value = today
  } catch (e) {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

// ── Export handlers ──
async function handleExport1() {
  if (!exportDate1.value) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }
  await exportEmployeeDetails(exportDate1.value)
}

async function handleExport2() {
  if (!exportDate2.value) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }
  if (!exportDept.value) {
    uni.showToast({ title: '请选择部门', icon: 'none' })
    return
  }
  await exportDepartmentStatus(exportDate2.value, exportDept.value)
}

async function handleExport3() {
  if (!exportStartDate.value) {
    uni.showToast({ title: '请选择开始日期', icon: 'none' })
    return
  }
  if (!exportEndDate.value) {
    uni.showToast({ title: '请选择结束日期', icon: 'none' })
    return
  }
  await exportParticipationRate(exportStartDate.value, exportEndDate.value)
}
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background: $bg-cool;
  padding-bottom: calc($spacing-4 + env(safe-area-inset-bottom));
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
      background: linear-gradient(135deg, $brand-teal, $brand-teal-dark);
      .admin__card-value { color: $text-inverse; }
      .admin__card-label { color: rgba(255, 255, 255, 0.7); }
    }
    &--amber {
      background: linear-gradient(135deg, $warning, $brand-amber-dark);
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

  // Export
  &__export-card {
    margin: 0 $spacing-4;
    background: $surface;
    border-radius: $radius-lg;
    box-shadow: $shadow-soft;
    overflow: hidden;
  }

  &__export-item {
    padding: $spacing-4;
    border-bottom: 1rpx solid $divider-light;

    &--last {
      border-bottom: none;
    }
  }

  &__export-info {
    margin-bottom: $spacing-3;
  }

  &__export-name {
    display: block;
    font-size: $text-body-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  &__export-desc {
    font-size: $text-xs;
    color: $text-tertiary;
  }

  &__export-controls {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__export-date {
    padding: $spacing-1 $spacing-3;
    background: $surface-secondary;
    border: 1rpx solid $divider;
    border-radius: $radius-sm;
    height: 64rpx;
    display: flex;
    align-items: center;

    text {
      font-size: $text-caption;
      color: $text-secondary;
    }
  }

  &__export-btn {
    padding: $spacing-1 $spacing-4;
    background: $gradient-cyan;
    border-radius: $radius-sm;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-btn;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--hover {
      opacity: 0.85;
      transform: scale(0.96);
    }

    &-text {
      font-size: $text-caption;
      font-weight: 600;
      color: $text-inverse;
    }
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
