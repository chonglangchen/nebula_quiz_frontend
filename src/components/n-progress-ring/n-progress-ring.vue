<template>
  <view class="n-progress-ring" :style="containerStyle">
    <svg :width="sizePx" :height="sizePx" :viewBox="`0 0 ${svgSize} ${svgSize}`">
      <!-- Background circle -->
      <circle
        :cx="halfSize"
        :cy="halfSize"
        :r="radius"
        fill="none"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
      />
      <!-- Progress arc -->
      <circle
        v-if="clampedProgress > 0"
        :cx="halfSize"
        :cy="halfSize"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90, 50, 50)"
      />
    </svg>
    <!-- Center content -->
    <view class="n-progress-ring__center">
      <text class="n-progress-ring__value" :style="valueStyle">{{ displayValue }}</text>
      <text v-if="label" class="n-progress-ring__label">{{ label }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 }, // 0-1
  value: { type: [Number, String], default: null },
  label: { type: String, default: '' },
  size: { type: Number, default: 200 }, // rpx
  strokeWidth: { type: Number, default: 12 }, // rpx
  color: { type: String, default: '#0EA5E9' /* $brand-cyan */ },
  bgColor: { type: String, default: '#E2E8F0' /* $divider */ },
  textColor: { type: String, default: '#ffffff' /* $text-inverse */ }
})

const clampedProgress = computed(() => Math.max(0, Math.min(1, props.progress)))

const displayValue = computed(() => {
  if (props.value !== null && props.value !== undefined) return props.value
  return Math.round(clampedProgress.value * 100) + '%'
})

// SVG coordinate system (percentage-based, 0-100)
const svgSize = 100
const halfSize = svgSize / 2
const radius = (svgSize - props.strokeWidth) / 2

const containerStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`
}))

// Convert rpx to px approximation for the SVG viewport
const sizePx = computed(() => `${props.size / 2}px`)

const circumference = computed(() => 2 * Math.PI * radius)
const dashOffset = computed(() => {
  return circumference * (1 - clampedProgress.value)
})

const valueStyle = computed(() => ({
  color: props.textColor,
  fontSize: `${props.size * 0.22}rpx`
}))
</script>

<style lang="scss" scoped>
.n-progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__center {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  &__value {
    font-family: $font-display;
    font-weight: 700;
    letter-spacing: $tracking-heading;
    line-height: 1.1;
  }

  &__label {
    font-size: $text-xs;
    color: $text-secondary;
    margin-top: 4rpx;
  }
}
</style>
