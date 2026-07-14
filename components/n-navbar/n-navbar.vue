<template>
  <view class="n-navbar" :style="navbarStyle">
    <!-- Status bar spacer -->
    <view class="n-navbar__status" :style="{ height: statusBarHeight + 'px' }" />
    <!-- Nav bar content -->
    <view class="n-navbar__inner">
      <view class="n-navbar__left" @tap="handleBack">
        <view v-if="showBack" class="n-navbar__back">
          <text class="n-navbar__back-icon">←</text>
        </view>
      </view>
      <view class="n-navbar__center">
        <text class="n-navbar__title">{{ title }}</text>
      </view>
      <view class="n-navbar__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  backgroundColor: { type: String, default: '#0B1D3A' },
  textColor: { type: String, default: '#FFFFFF' }
})

const emit = defineEmits(['back'])

const statusBarHeight = ref(20)

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {
    // fallback
  }
})

const navbarStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  color: props.textColor
}))

function handleBack() {
  if (props.showBack) {
    emit('back')
    uni.navigateBack({ delta: 1 })
  }
}
</script>

<style lang="scss" scoped>
.n-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 $spacing-4;
  }

  &__left {
    width: 80rpx;
    flex-shrink: 0;
  }

  &__back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &-icon {
      font-size: 36rpx;
      font-weight: 300;
      color: inherit;
    }
  }

  &__center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-h3;
    font-weight: 600;
    letter-spacing: $tracking-heading;
    color: inherit;
  }

  &__right {
    width: 80rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
