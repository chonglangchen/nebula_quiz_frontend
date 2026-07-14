<template>
  <view class="n-empty-state">
    <view v-if="icon" class="n-empty__icon">
      <text>{{ icon }}</text>
    </view>
    <text class="n-empty__title">{{ title }}</text>
    <text v-if="description" class="n-empty__desc">{{ description }}</text>
    <view v-if="$slots.action" class="n-empty__action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.n-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-10 $spacing-4;
}

.n-empty {
  &__icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-xl;
    background: $gradient-card-accent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 52rpx;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-h3;
    font-weight: 600;
    color: $text-primary;
    letter-spacing: $tracking-heading;
    margin-bottom: $spacing-2;
  }

  &__desc {
    font-size: $text-body-sm;
    color: $text-secondary;
    text-align: center;
    line-height: $leading-body;
    max-width: 480rpx;
  }

  &__action {
    margin-top: $spacing-5;
  }
}
</style>
