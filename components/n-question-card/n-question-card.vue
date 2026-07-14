<template>
  <view class="n-question-card">
    <!-- Question number badge -->
    <view class="n-qc__header">
      <view class="n-qc__badge">
        <text class="n-qc__badge-text">{{ sequence }}/{{ total }}</text>
      </view>
      <view v-if="knowledgeTag" class="n-qc__tag">
        <text class="n-qc__tag-text">{{ knowledgeTag }}</text>
      </view>
    </view>

    <!-- Question content -->
    <view class="n-qc__body">
      <text class="n-qc__content">{{ content }}</text>
    </view>

    <!-- Options -->
    <view class="n-qc__options">
      <view
        v-for="(option, index) in options"
        :key="option.key"
        class="n-qc__option"
        :class="optionClass(option.key)"
        @tap="handleSelect(option.key)"
      >
        <view class="n-qc__option-indicator">
          <text class="n-qc__option-letter">{{ option.key }}</text>
        </view>
        <view class="n-qc__option-text">
          <text>{{ option.content }}</text>
        </view>
        <view v-if="showResult && isCorrectOption(option.key)" class="n-qc__option-icon n-qc__option-icon--correct">
          <text>&#10003;</text>
        </view>
        <view v-if="showResult && isWrongSelection(option.key)" class="n-qc__option-icon n-qc__option-icon--wrong">
          <text>&#10007;</text>
        </view>
      </view>
    </view>

    <!-- Result explanation -->
    <view v-if="showResult && !isCorrect" class="n-qc__explanation">
      <view class="n-qc__explanation-header">
        <text class="n-qc__explanation-label">知识点</text>
      </view>
      <text class="n-qc__explanation-text">{{ knowledgeTag || '请复习相关知识点' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  questionId: { type: [Number, String], required: true },
  sequence: { type: Number, default: 1 },
  total: { type: Number, default: 5 },
  content: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  selectedOption: { type: String, default: null },
  correctOption: { type: String, default: null },
  showResult: { type: Boolean, default: false },
  isCorrect: { type: Boolean, default: false },
  knowledgeTag: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

function optionClass(key) {
  const classes = []
  if (key === props.selectedOption) classes.push('n-qc__option--selected')
  if (props.showResult) {
    if (key === props.correctOption) classes.push('n-qc__option--correct')
    if (key === props.selectedOption && key !== props.correctOption) classes.push('n-qc__option--wrong')
  }
  if (!props.showResult && props.disabled) classes.push('n-qc__option--disabled')
  return classes
}

function isCorrectOption(key) {
  return props.showResult && key === props.correctOption
}

function isWrongSelection(key) {
  return props.showResult && key === props.selectedOption && key !== props.correctOption
}

function handleSelect(key) {
  if (props.showResult || props.disabled) return
  emit('select', { questionId: props.questionId, option: key })
}
</script>

<style lang="scss" scoped>
.n-question-card {
  padding: $spacing-4;
}

.n-qc {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-4;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 6rpx 20rpx;
    background: $gradient-cyan;
    border-radius: $radius-full;

    &-text {
      font-size: $text-caption;
      color: $text-inverse;
      font-weight: 600;
    }
  }

  &__tag {
    padding: 6rpx 16rpx;
    background-color: $surface-secondary;
    border-radius: $radius-sm;
    border: 1rpx solid $divider;

    &-text {
      font-size: $text-xs;
      color: $text-secondary;
    }
  }

  &__body {
    margin-bottom: $spacing-5;
  }

  &__content {
    font-size: $text-body;
    font-family: $font-body;
    color: $text-primary;
    line-height: $leading-body;
    font-weight: 500;
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }

  &__option {
    display: flex;
    align-items: center;
    padding: $spacing-3;
    background: $surface;
    border: 2rpx solid $divider;
    border-radius: $radius-md;
    transition-property: border-color, background-color, transform;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &:active:not(&--disabled) {
      transform: scale(0.985);
    }

    &--selected {
      border-color: $brand-cyan;
      background: $gradient-card-accent;

      .n-qc__option-indicator {
        background: $gradient-cyan;
        color: $text-inverse;
      }
    }

    &--correct {
      border-color: $success;
      background: $success-light;

      .n-qc__option-indicator {
        background: $success;
        color: $text-inverse;
      }
    }

    &--wrong {
      border-color: $danger;
      background: $danger-light;

      .n-qc__option-indicator {
        background: $danger;
        color: $text-inverse;
      }
    }

    &--disabled {
      opacity: 0.6;
    }

    &-indicator {
      width: 48rpx;
      height: 48rpx;
      border-radius: $radius-full;
      background: $bg-cool;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: $spacing-3;
      transition-property: background, color;
      transition-duration: $duration-fast;
      transition-timing-function: $ease-out;
    }

    &-letter {
      font-size: $text-caption;
      font-weight: 700;
      font-family: $font-display;
    }

    &-text {
      flex: 1;
      font-size: $text-body-sm;
      color: $text-primary;
      line-height: 1.6;
    }

    &-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: $radius-full;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: $spacing-2;
      font-size: $text-caption;
      font-weight: 700;

      &--correct {
        background: $success;
        color: $text-inverse;
      }

      &--wrong {
        background: $danger;
        color: $text-inverse;
      }
    }
  }

  &__explanation {
    margin-top: $spacing-4;
    padding: $spacing-3;
    background: $surface-secondary;
    border-radius: $radius-md;
    border-left: 4rpx solid $brand-cyan;

    &-header {
      display: flex;
      align-items: center;
      margin-bottom: $spacing-1;
    }

    &-label {
      font-size: $text-caption;
      color: $text-secondary;
      font-weight: 600;
    }

    &-text {
      font-size: $text-body-sm;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}
</style>
