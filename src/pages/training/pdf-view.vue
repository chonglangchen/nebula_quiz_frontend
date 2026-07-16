<template>
  <view class="pdf-page">
    <!-- Toolbar -->
    <view class="pdf-toolbar">
      <view class="pdf-back" @tap="goBack">
        <text class="pdf-back-arrow">←</text>
        <text class="pdf-back-text">返回</text>
      </view>
      <text class="pdf-title">培训资料</text>
      <text class="pdf-page-info">
        <template v-if="error">出错了</template>
        <template v-else-if="loading">加载中</template>
        <template v-else>{{ currentPage }}/{{ totalPages }}</template>
      </text>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="pdf-state pdf-state--loading">
      <text class="pdf-state-icon">⏳</text>
      <text class="pdf-state-text">加载培训资料中…</text>
    </view>

    <!-- Error -->
    <view v-else-if="error" class="pdf-state pdf-state--error">
      <text class="pdf-state-icon">😞</text>
      <text class="pdf-state-text">{{ error }}</text>
      <button class="pdf-retry-btn" hover-class="pdf-retry-btn--hover" @tap="loadPdf">
        重试
      </button>
    </view>

    <!-- PDF canvas render area -->
    <view
      v-show="!loading && !error"
      id="pdf-render-target"
      class="pdf-render-target"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// Use worker from installed npm package (no CDN dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

const loading = ref(true)
const error = ref('')
const totalPages = ref(0)
const currentPage = ref(0)

onMounted(() => {
  loadPdf()
})

onUnmounted(() => {
  // Clean up canvases
  const container = document.getElementById('pdf-render-target')
  if (container) {
    container.innerHTML = ''
  }
})

function goBack() {
  uni.navigateBack()
}

async function loadPdf() {
  loading.value = true
  error.value = ''
  totalPages.value = 0
  currentPage.value = 0

  // Read path from route params, or use default API endpoint
  const pages = getCurrentPages()
  const currentPageRoute = pages[pages.length - 1]
  const pathParam = currentPageRoute?.options?.path
  const pdfUrl = pathParam ? decodeURIComponent(pathParam) : '/api/v1/training/file'

  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise
    totalPages.value = pdf.numPages

    // Wait for container to be visible
    await nextTick()

    const container = document.getElementById('pdf-render-target')
    if (!container) {
      throw new Error('渲染容器未找到')
    }

    // Clear previous renders
    container.innerHTML = ''
    loading.value = false

    const screenWidth = window.innerWidth

    // Render all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const baseViewport = page.getViewport({ scale: 1 })
      // Scale to fit screen width with slight padding
      const scale = (screenWidth * 0.92) / baseViewport.width
      const viewport = page.getViewport({ scale })

      // Create canvas element
      const canvas = document.createElement('canvas')
      canvas.id = `pdf-page-${i}`
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.display = 'block'
      canvas.style.margin = '0 auto 8px auto'

      container.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      await page.render({
        canvasContext: ctx,
        viewport
      }).promise

      currentPage.value = i
    }
  } catch (e) {
    console.error('PDF load error:', e)
    error.value = '加载培训资料失败，请重试'
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.pdf-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #525659; /* dark bg matching PDF viewer style */
  z-index: 999;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  min-height: 88rpx;
  padding: 0 $spacing-4;
  padding-top: env(safe-area-inset-top);
  background: rgba(30, 41, 59, 0.95);
  flex-shrink: 0;
}

.pdf-back {
  display: flex;
  align-items: center;
  padding: $spacing-1 $spacing-2;
  cursor: pointer;

  &-arrow {
    font-size: 36rpx;
    color: $brand-cyan;
    margin-right: 4rpx;
  }

  &-text {
    font-size: $text-body-sm;
    color: $brand-cyan;
    font-weight: 500;
  }
}

.pdf-title {
  font-family: $font-display;
  font-size: $text-body;
  font-weight: 600;
  color: $text-inverse;
  letter-spacing: $tracking-heading;
}

.pdf-page-info {
  font-size: $text-caption;
  color: rgba(255, 255, 255, 0.55);
  min-width: 100rpx;
  text-align: right;
}

// State screens (loading / error)
.pdf-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-10 $spacing-4;

  &--loading {
    background: #525659;
  }

  &--error {
    background: $bg-cool;
  }

  &-icon {
    font-size: 80rpx;
    margin-bottom: $spacing-4;
  }

  &-text {
    font-size: $text-body;
    color: $text-inverse;
    text-align: center;
    line-height: $leading-body;

    .pdf-state--error & {
      color: $text-secondary;
    }
  }
}

.pdf-retry-btn {
  margin-top: $spacing-5;
  padding: $spacing-2 $spacing-6;
  background: $gradient-cyan;
  color: $text-inverse;
  border: none;
  border-radius: $radius-lg;
  font-size: $text-body;
  font-weight: 600;
  transition-property: transform, opacity;
  transition-duration: $duration-fast;
  transition-timing-function: $ease-out;

  &--hover {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

// PDF render area (scrollable)
.pdf-render-target {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: $spacing-2 0;
  padding-bottom: env(safe-area-inset-bottom);

  canvas {
    display: block;
    margin: 0 auto 24rpx auto;
    box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.3);
    border-radius: 4rpx;
  }
}
</style>
