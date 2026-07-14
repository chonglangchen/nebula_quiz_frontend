<template>
  <view class="n-skeleton" :style="skeletonStyle">
    <view class="n-skeleton__shimmer" />
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: 32 },
  radius: { type: [Number, String], default: 8 },
  borderRadius: { type: String, default: '' }
})

const skeletonStyle = computed(() => {
  const r = props.borderRadius || `${props.radius}rpx`
  return {
    width: typeof props.width === 'number' ? `${props.width}rpx` : props.width,
    height: typeof props.height === 'number' ? `${props.height}rpx` : props.height,
    borderRadius: r
  }
})
</script>

<style lang="scss" scoped>
.n-skeleton {
  position: relative;
  overflow: hidden;
  background: $divider;

  &__shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.5) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
