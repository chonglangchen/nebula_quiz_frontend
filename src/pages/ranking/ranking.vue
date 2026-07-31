<template>
  <view class="ranking-page">
    <!-- Hero header -->
    <view class="ranking__hero">
      <view class="ranking__hero-inner">
        <text class="ranking__hero-title">答题排名</text>
        <text class="ranking__hero-subtitle">职工 AI 知识答题成绩排名</text>
      </view>
      <!-- Date picker -->
      <picker mode="date" :value="selectedDate" @change="onDateChange">
        <view class="ranking__date-picker">
          <text class="ranking__date-text">{{ selectedDate }}</text>
          <text class="ranking__date-arrow">&#9660;</text>
        </view>
      </picker>
    </view>

    <!-- Personal rank card -->
    <view class="ranking__personal-card">
      <n-skeleton v-if="loading" height="180" :radius="16" />
      <template v-else-if="personalRank">
        <view class="ranking__personal-rank">
          <text class="ranking__personal-rank-num">{{ personalRank.rank }}</text>
          <text class="ranking__personal-rank-label">/ {{ personalRank.totalUsers }}</text>
        </view>
        <view class="ranking__personal-info">
          <text class="ranking__personal-name">{{ personalRank.realName }}</text>
          <text class="ranking__personal-dept">{{ personalRank.department }}</text>
        </view>
        <view class="ranking__personal-stats">
          <view class="ranking__personal-stat">
            <text class="ranking__personal-stat-val">{{ personalRank.score }}分</text>
            <text class="ranking__personal-stat-label">得分</text>
          </view>
          <view class="ranking__personal-divider" />
          <view class="ranking__personal-stat">
            <text class="ranking__personal-stat-val">{{ personalRank.correctCount }}/{{ personalRank.totalQuestions }}</text>
            <text class="ranking__personal-stat-label">答对</text>
          </view>
        </view>
      </template>
      <template v-else>
        <view class="ranking__personal-empty">
          <text class="ranking__personal-empty-title">当日未答题</text>
          <text class="ranking__personal-empty-desc">完成今日答题后即可查看排名</text>
        </view>
      </template>
    </view>

    <!-- View toggle: Personal / Department -->
    <view class="ranking__view-toggle">
      <view
        class="ranking__view-tab"
        :class="{ 'ranking__view-tab--active': viewMode === 'personal' }"
        hover-class="ranking__view-tab--hover"
        @tap="viewMode = 'personal'"
      >
        <text class="ranking__view-tab-text">个人排名</text>
      </view>
      <view
        class="ranking__view-tab"
        :class="{ 'ranking__view-tab--active': viewMode === 'department' }"
        hover-class="ranking__view-tab--hover"
        @tap="viewMode = 'department'"
      >
        <text class="ranking__view-tab-text">部门排名</text>
      </view>
    </view>

    <!-- ===== Personal Ranking List ===== -->
    <template v-if="viewMode === 'personal'">
      <view class="ranking__list">
        <n-skeleton v-if="loading" height="300" :radius="12" />
        <n-empty-state
          v-else-if="userRankings.length === 0"
          title="暂无排名数据"
          description="所选日期暂无答题记录"
        />
        <view
          v-for="user in userRankings"
          :key="user.rank"
          class="ranking__item"
          :class="{ 'ranking__item--self': user.rank === personalRank?.rank }"
        >
          <view class="ranking__item-rank" :class="rankBadgeClass(user.rank)">
            <text class="ranking__item-rank-num">{{ user.rank }}</text>
          </view>
          <view class="ranking__item-info">
            <text class="ranking__item-name">{{ user.realName }}</text>
            <text class="ranking__item-dept">{{ user.department }}</text>
          </view>
          <view class="ranking__item-score">
            <text class="ranking__item-score-val" :style="{ color: scoreColor(user.score) }">
              {{ user.score }}分
            </text>
            <text class="ranking__item-score-meta">{{ user.correctCount }}/{{ user.totalQuestions }}</text>
          </view>
        </view>
      </view>
    </template>

    <!-- ===== Department Ranking ===== -->
    <template v-if="viewMode === 'department'">
      <!-- Sort toggle -->
      <view class="ranking__sort-bar">
        <view
          class="ranking__sort-btn"
          :class="{ 'ranking__sort-btn--active': deptSort === 'accuracy' }"
          hover-class="ranking__sort-btn--hover"
          @tap="deptSort = 'accuracy'"
        >
          <text class="ranking__sort-btn-text">正确率排名</text>
        </view>
        <view
          class="ranking__sort-btn"
          :class="{ 'ranking__sort-btn--active': deptSort === 'participation' }"
          hover-class="ranking__sort-btn--hover"
          @tap="deptSort = 'participation'"
        >
          <text class="ranking__sort-btn-text">参与率排名</text>
        </view>
      </view>

      <view class="ranking__list">
        <n-skeleton v-if="loading" height="300" :radius="12" />
        <n-empty-state
          v-else-if="currentDepartments.length === 0"
          title="暂无排名数据"
          description="所选日期暂无部门答题记录"
        />
        <view
          v-for="dept in currentDepartments"
          :key="dept.departmentName"
          class="ranking__item"
        >
          <view class="ranking__item-rank" :class="rankBadgeClass(dept.rank)">
            <text class="ranking__item-rank-num">{{ dept.rank }}</text>
          </view>
          <view class="ranking__item-info">
            <text class="ranking__item-name">{{ dept.departmentName }}</text>
            <text class="ranking__item-dept">{{ dept.participatedCount }}/{{ dept.memberCount }} 人参与</text>
          </view>
          <view class="ranking__item-score">
            <text
              class="ranking__item-score-val"
              :style="{ color: deptValueColor(dept) }"
            >
              {{ deptSort === 'accuracy' ? fmtPercent(dept.accuracyRate) + '%' : fmtPercent(dept.participationRate) + '%' }}
            </text>
            <text class="ranking__item-score-meta">
              {{ deptSort === 'accuracy' ? '正确率' : '参与率' }}
            </text>
          </view>
        </view>
      </view>
    </template>

    <!-- Bottom safe area -->
    <view class="ranking__bottom" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchRanking } from '@/api/ranking'

const loading = ref(true)
const personalRank = ref(null)
const userRankings = ref([])
const departmentsByAccuracy = ref([])
const departmentsByParticipation = ref([])
const viewMode = ref('personal')
const deptSort = ref('accuracy')

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const selectedDate = ref(getTodayStr())

const currentDepartments = computed(() => {
  return deptSort.value === 'accuracy'
    ? departmentsByAccuracy.value
    : departmentsByParticipation.value
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const data = await fetchRanking(selectedDate.value)
    personalRank.value = data.personalRank
    userRankings.value = data.userRankings || []
    departmentsByAccuracy.value = data.departmentsByAccuracy || []
    departmentsByParticipation.value = data.departmentsByParticipation || []
  } catch (e) {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function onDateChange(e) {
  selectedDate.value = e.detail.value
  await loadData()
}

function fmtPercent(val) {
  if (val == null || val === undefined) return '0'
  return val % 1 === 0 ? Math.round(val).toString() : val.toFixed(1)
}

function rankBadgeClass(rank) {
  if (rank === 1) return 'ranking__item-rank--gold'
  if (rank === 2) return 'ranking__item-rank--silver'
  if (rank === 3) return 'ranking__item-rank--bronze'
  return ''
}

function scoreColor(score) {
  if (score == null) return '#94A3B8'
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#0EA5E9'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

function deptValueColor(dept) {
  const val = deptSort.value === 'accuracy' ? dept.accuracyRate : dept.participationRate
  if (val == null) return '#94A3B8'
  if (val >= 80) return '#22C55E'
  if (val >= 60) return '#0EA5E9'
  if (val >= 40) return '#F59E0B'
  return '#EF4444'
}
</script>

<style lang="scss" scoped>
.ranking-page {
  min-height: 100vh;
  background: $bg-cool;
}

.ranking {
  // ── Hero ──
  &__hero {
    background: $gradient-brand;
    padding: $spacing-4 $spacing-4 $spacing-5;

    &-inner {
      text-align: center;
      margin-bottom: $spacing-4;
    }

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h1;
      font-weight: 700;
      color: $text-inverse;
      letter-spacing: $tracking-heading;
    }

    &-subtitle {
      display: block;
      font-size: $text-caption;
      color: rgba(255, 255, 255, 0.55);
      margin-top: $spacing-1;
    }
  }

  &__date-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.12);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    border-radius: $radius-full;
    padding: $spacing-2 $spacing-5;
    margin: 0 auto;
    width: fit-content;
  }

  &__date-text {
    font-size: $text-body-sm;
    color: $text-inverse;
    font-weight: 500;
  }

  &__date-arrow {
    font-size: 16rpx;
    color: rgba(255, 255, 255, 0.5);
    margin-left: $spacing-2;
  }

  // ── Personal Card ──
  &__personal-card {
    margin: -$spacing-3 $spacing-4 0;
    background: $surface;
    border-radius: $radius-xl;
    padding: $spacing-5 $spacing-4;
    box-shadow: $shadow-elevated;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__personal-rank {
    display: flex;
    align-items: baseline;
    margin-bottom: $spacing-2;

    &-num {
      font-family: $font-display;
      font-size: 72rpx;
      font-weight: 700;
      color: $brand-cyan;
      letter-spacing: $tracking-heading;
      line-height: 1;
    }

    &-label {
      font-size: $text-body;
      color: $text-tertiary;
      margin-left: 6rpx;
    }
  }

  &__personal-info {
    text-align: center;
    margin-bottom: $spacing-3;
  }

  &__personal-name {
    display: block;
    font-family: $font-display;
    font-size: $text-h3;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: $tracking-heading;
  }

  &__personal-dept {
    display: block;
    font-size: $text-caption;
    color: $text-secondary;
    margin-top: 4rpx;
  }

  &__personal-stats {
    display: flex;
    align-items: center;
    width: 100%;
    padding: $spacing-3 0 0;
    border-top: 1rpx solid $divider-light;
  }

  &__personal-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    &-val {
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
    }

    &-label {
      font-size: $text-xs;
      color: $text-tertiary;
      margin-top: 4rpx;
    }
  }

  &__personal-divider {
    width: 2rpx;
    height: 48rpx;
    background: $divider;
  }

  &__personal-empty {
    padding: $spacing-3 0;
    text-align: center;

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      color: $text-secondary;
      letter-spacing: $tracking-heading;
      margin-bottom: $spacing-2;
    }

    &-desc {
      font-size: $text-caption;
      color: $text-tertiary;
    }
  }

  // ── View toggle ──
  &__view-toggle {
    display: flex;
    margin: $spacing-4 $spacing-4 0;
    background: $surface;
    border-radius: $radius-lg;
    padding: 6rpx;
    box-shadow: $shadow-soft;
  }

  &__view-tab {
    flex: 1;
    text-align: center;
    padding: $spacing-2 0;
    border-radius: $radius-md;
    transition-property: background-color, box-shadow;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--active {
      background: $gradient-cyan;
      box-shadow: $shadow-btn;
    }

    &--hover {
      opacity: 0.8;
    }

    &-text {
      font-size: $text-body-sm;
      font-weight: 600;
      color: $text-secondary;
      transition-property: color;
      transition-duration: $duration-fast;
      transition-timing-function: $ease-out;

      .ranking__view-tab--active & {
        color: $text-inverse;
      }
    }
  }

  // ── Department sort toggle ──
  &__sort-bar {
    display: flex;
    margin: $spacing-2 $spacing-4;
    background: $surface-secondary;
    border-radius: $radius-lg;
    padding: 6rpx;
  }

  &__sort-btn {
    flex: 1;
    text-align: center;
    padding: $spacing-2 0;
    border-radius: $radius-md;
    transition-property: background-color, box-shadow;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--active {
      background: $surface;
      box-shadow: $shadow-soft;
    }

    &--hover {
      opacity: 0.8;
    }

    &-text {
      font-size: $text-body-sm;
      font-weight: 600;
      color: $text-secondary;
      transition-property: color;
      transition-duration: $duration-fast;
      transition-timing-function: $ease-out;

      .ranking__sort-btn--active & {
        color: $brand-cyan;
      }
    }
  }

  // ── List (shared) ──
  &__list {
    margin: $spacing-3 $spacing-4 0;
    background: $surface;
    border-radius: $radius-lg;
    box-shadow: $shadow-soft;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: $spacing-3 $spacing-4;
    border-bottom: 1rpx solid $divider-light;
    transition-property: background-color;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &:last-child {
      border-bottom: none;
    }

    &--self {
      background: rgba($brand-cyan, 0.04);
    }
  }

  &__item-rank {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: $surface-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-3;
    flex-shrink: 0;

    &--gold {
      background: linear-gradient(135deg, #F59E0B, #D97706);
      .ranking__item-rank-num { color: #FFFFFF; }
    }

    &--silver {
      background: linear-gradient(135deg, #94A3B8, #64748B);
      .ranking__item-rank-num { color: #FFFFFF; }
    }

    &--bronze {
      background: linear-gradient(135deg, #D97706, #92400E);
      .ranking__item-rank-num { color: #FFFFFF; }
    }

    &-num {
      font-family: $font-display;
      font-size: $text-body-sm;
      font-weight: 700;
      color: $text-secondary;
    }
  }

  &__item-info {
    flex: 1;
    min-width: 0;
  }

  &__item-name {
    display: block;
    font-size: $text-body-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  &__item-dept {
    font-size: $text-xs;
    color: $text-tertiary;
  }

  &__item-score {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: $spacing-3;

    &-val {
      font-family: $font-display;
      font-size: $text-h3;
      font-weight: 700;
      letter-spacing: $tracking-heading;
    }

    &-meta {
      font-size: $text-xs;
      color: $text-tertiary;
    }
  }

  // ── Bottom safe area ──
  &__bottom {
    height: calc($spacing-4 + env(safe-area-inset-bottom));
  }
}
</style>
