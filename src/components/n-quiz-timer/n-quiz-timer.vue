<template>
  <view class="n-quiz-timer" :class="urgencyClass">
    <view class="n-qt__icon">
      <view class="n-qt__clock" />
    </view>
    <text class="n-qt__time">{{ display }}</text>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { formatDuration } from '@/utils'

const props = defineProps({
  expiredAt: { type: String, default: null },
  durationSeconds: { type: Number, default: 1800 },
  running: { type: Boolean, default: true }
})

const emit = defineEmits(['timeout'])

const remaining = ref(props.durationSeconds)
let timer = null

const display = computed(() => formatDuration(remaining.value))

const urgencyClass = computed(() => {
  if (remaining.value <= 60) return 'n-quiz-timer--critical'
  if (remaining.value <= 300) return 'n-quiz-timer--warning'
  if (remaining.value <= 600) return 'n-quiz-timer--notice'
  return ''
})

function calcRemaining() {
  if (!props.expiredAt) {
    remaining.value = Math.max(0, remaining.value - 1)
  } else {
    const now = Date.now()
    const end = new Date(props.expiredAt).getTime()
    remaining.value = Math.max(0, Math.floor((end - now) / 1000))
  }
}

function start() {
  stop()
  if (props.expiredAt) {
    calcRemaining()
  } else {
    remaining.value = props.durationSeconds
  }
  timer = setInterval(() => {
    calcRemaining()
    if (remaining.value <= 0) {
      stop()
      emit('timeout')
    }
  }, 1000)
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  if (props.running) start()
})

onUnmounted(() => {
  stop()
})

watch(() => props.running, (val) => {
  if (val) start()
  else stop()
})
</script>

<style lang="scss" scoped>
.n-quiz-timer {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: $radius-full;

  &--notice {
    background: rgba($warning, 0.15);

    .n-qt__time {
      color: $warning;
    }
  }

  &--warning {
    background: rgba($warning, 0.2);
    animation: timerPulse 1s $ease-in-out infinite;

    .n-qt__time {
      color: $warning;
    }
  }

  &--critical {
    background: rgba($danger, 0.2);
    animation: timerPulse 0.5s $ease-in-out infinite;

    .n-qt__time {
      color: $danger;
    }
  }
}

.n-qt {
  &__icon {
    margin-right: 8rpx;
  }

  &__clock {
    width: 16rpx;
    height: 16rpx;
    border: 2rpx solid currentColor;
    border-radius: 50%;
    position: relative;
    opacity: 0.8;

    &::after {
      content: '';
      position: absolute;
      width: 1rpx;
      height: 5rpx;
      background: currentColor;
      top: 2rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &__time {
    font-size: $text-body-sm;
    font-weight: 700;
    font-family: $font-mono;
    color: $text-inverse;
    font-variant-numeric: tabular-nums;
    transition-property: color;
    transition-duration: $duration-normal;
    transition-timing-function: $ease-out;
  }
}

@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
