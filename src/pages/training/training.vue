<template>
  <view class="training-page">
    <!-- Material info header -->
    <view class="tr__header">
      <text class="tr__header-title">{{ material.title || 'AI基础认知与主流通用大模型应用' }}</text>
      <text class="tr__header-version">版本 {{ material.version || '2026.07' }}</text>
      <text class="tr__header-desc" v-if="!hasViewedPdf && !material.confirmed">请先阅读培训资料，阅读完成后确认</text>
      <text class="tr__header-desc" v-else>请仔细阅读以下培训内容，完成后点击底部确认按钮</text>
    </view>

    <!-- PDF preview area -->
    <view class="tr__content">
      <view v-if="loading" class="tr__loading">
        <text>加载培训材料中...</text>
      </view>
      <view v-else class="tr__pdf-section">
        <!-- PDF icon and info -->
        <view class="tr__pdf-card">
          <view class="tr__pdf-icon">
            <text class="tr__pdf-icon-text">PDF</text>
          </view>
          <view class="tr__pdf-info">
            <text class="tr__pdf-name">{{ material.title || 'AI基础认知与主流通用大模型应用' }}</text>
            <text class="tr__pdf-meta">{{ material.format || 'PDF' }} · 版本 {{ material.version || '2026.07' }}</text>
          </view>
        </view>
        <!-- View PDF button -->
        <button
          class="tr__view-btn"
          hover-class="tr__view-btn--hover"
          @tap="openPdf"
        >
          <text class="tr__view-btn-text">查看培训资料（PDF）</text>
        </button>
        <text class="tr__view-hint">点击上方按钮查看完整的培训材料，阅读完成后返回本页确认</text>
      </view>
    </view>

    <!-- Confirm button (only visible after viewing PDF) -->
    <view v-if="hasViewedPdf || material.confirmed" class="tr__footer">
      <view v-if="material.confirmed" class="tr__confirmed">
        <text class="tr__confirmed-icon">&#10003;</text>
        <text class="tr__confirmed-text">您已完成培训确认</text>
      </view>
      <button
        v-else
        class="tr__btn"
        hover-class="tr__btn--hover"
        :loading="confirming"
        @tap="handleConfirm"
      >
        <text class="tr__btn-text">我已阅读并确认</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { fetchTrainingMaterial, confirmTraining } from '@/api/training'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(true)
const confirming = ref(false)
const hasViewedPdf = ref(false)

const material = reactive({
  id: 'ai-basic-training',
  version: '2026.07',
  title: 'AI基础认知与主流通用大模型应用',
  format: 'PDF',
  pdfUrl: '',
  confirmed: false,
  confirmedAt: null
})

onMounted(async () => {
  try {
    const data = await fetchTrainingMaterial()
    Object.assign(material, data)
  } catch (e) {
    // Use default content
  } finally {
    loading.value = false
  }
})

function openPdf() {
  hasViewedPdf.value = true
  // Use backend API endpoint that serves PDF with Content-Disposition: inline for preview
  const url = '/api/v1/training/file'
  uni.navigateTo({ url: `/pages/training/pdf-view?path=${encodeURIComponent(url)}` })
}

async function handleConfirm() {
  if (confirming.value) return
  confirming.value = true
  try {
    const result = await confirmTraining(material.id, material.version)
    material.confirmed = result.confirmed
    material.confirmedAt = result.confirmedAt
    if (userStore.user) {
      userStore.user.trainingConfirmed = true
    }
    uni.showToast({ title: '确认成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    // Error handled by interceptor
  } finally {
    confirming.value = false
  }
}
</script>

<style lang="scss" scoped>
.training-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-cool;
}

.tr {
  &__header {
    padding: $spacing-5 $spacing-4 $spacing-4;
    background: $surface;
    text-align: center;
    border-bottom: 1rpx solid $divider-light;

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h2;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
      margin-bottom: $spacing-1;
    }

    &-version {
      display: block;
      font-size: $text-caption;
      color: $text-tertiary;
      margin-bottom: $spacing-3;
    }

    &-desc {
      font-size: $text-body-sm;
      color: $text-secondary;
      line-height: $leading-body;
    }
  }

  &__content {
    flex: 1;
    padding: $spacing-4;
    padding-bottom: 200rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__loading {
    padding: $spacing-10 $spacing-4;
    text-align: center;
    color: $text-secondary;
    font-size: $text-body-sm;
  }

  &__pdf-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__pdf-card {
    display: flex;
    align-items: center;
    background: $surface;
    border-radius: $radius-lg;
    padding: $spacing-4;
    margin-bottom: $spacing-5;
    box-shadow: $shadow-soft;
    width: 100%;
  }

  &__pdf-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: $radius-md;
    background: $gradient-cyan;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-3;
    flex-shrink: 0;

    &-text {
      font-size: $text-caption;
      font-weight: 700;
      color: $text-inverse;
      letter-spacing: $tracking-heading;
    }
  }

  &__pdf-info {
    flex: 1;
    min-width: 0;
  }

  &__pdf-name {
    display: block;
    font-size: $text-body;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__pdf-meta {
    font-size: $text-caption;
    color: $text-tertiary;
  }

  &__view-btn {
    width: 100%;
    height: 96rpx;
    background: $gradient-cyan;
    border-radius: $radius-lg;
    border: none;
    box-shadow: $shadow-btn;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-3;
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

  &__view-hint {
    font-size: $text-caption;
    color: $text-tertiary;
    text-align: center;
    line-height: $leading-body;
  }

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-4;
    padding-bottom: calc($spacing-4 + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, transparent 0%, $bg-cool 30%);
  }

  &__confirmed {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    background: $success-light;
    border-radius: $radius-lg;

    &-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: $success;
      color: $text-inverse;
      font-size: $text-caption;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: $spacing-2;
    }

    &-text {
      font-size: $text-body;
      color: $success;
      font-weight: 600;
    }
  }

  &__btn {
    width: 100%;
    height: 96rpx;
    background: $gradient-cyan;
    border-radius: $radius-lg;
    border: none;
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
}
</style>
