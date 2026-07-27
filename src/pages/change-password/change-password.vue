<template>
  <view class="cp-page">
    <view class="cp__header">
      <text class="cp__header-title">修改密码</text>
      <text class="cp__header-desc">首次登录需要修改初始密码（默认 123456）</text>
    </view>

    <view class="cp__form">
      <view class="cp__field">
        <text class="cp__label">员工姓名</text>
        <input
          class="cp__input cp__input--disabled"
          :value="displayName"
          disabled
        />
      </view>
      <view class="cp__field">
        <text class="cp__label">原密码</text>
        <input
          class="cp__input"
          v-model="oldPassword"
          type="password"
          placeholder="请输入原密码"
        />
      </view>
      <view class="cp__field">
        <text class="cp__label">新密码</text>
        <input
          class="cp__input"
          v-model="newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
        />
      </view>
      <view class="cp__field">
        <text class="cp__label">确认新密码</text>
        <input
          class="cp__input"
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
        />
      </view>
    </view>

    <view class="cp__footer">
      <button
        class="cp__btn"
        hover-class="cp__btn--hover"
        :loading="loading"
        :disabled="!valid"
        @tap="handleSubmit"
      >
        <text class="cp__btn-text">确认修改</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { changePassword, getUserInfo } from '@/api/auth'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(false)
const displayName = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const valid = computed(() => {
  return oldPassword.value.length > 0
    && newPassword.value.length >= 6
    && newPassword.value === confirmPassword.value
    && newPassword.value !== oldPassword.value
})

onMounted(() => {
  displayName.value = uni.getStorageSync('nq_temp_name') || ''
})

async function handleSubmit() {
  if (!valid.value || loading.value) return
  loading.value = true
  try {
    await changePassword(oldPassword.value, newPassword.value)
    // Re-fetch user info to sync
    const user = await getUserInfo()
    userStore.setUser(user)
    uni.removeStorageSync('nq_temp_name')
    uni.showToast({ title: '密码修改成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    // Error handled by request interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.cp-page {
  min-height: 100vh;
  background: $bg-cool;
  padding: $spacing-4;
}

.cp {
  &__header {
    padding: $spacing-5 0 $spacing-4;

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h1;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
      margin-bottom: $spacing-2;
    }

    &-desc {
      font-size: $text-body-sm;
      color: $text-secondary;
    }
  }

  &__form {
    background: $surface;
    border-radius: $radius-lg;
    padding: $spacing-2 $spacing-4;
    box-shadow: $shadow-soft;
    margin-bottom: $spacing-8;
  }

  &__field {
    padding: $spacing-3 0;
    border-bottom: 1rpx solid $divider-light;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    display: block;
    font-size: $text-caption;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 12rpx;
  }

  &__input {
    width: 100%;
    height: 72rpx;
    font-size: $text-input;  /* 32rpx = 16px — prevents iOS zoom */
    color: $text-primary;
    background: transparent;

    &::placeholder {
      color: $text-tertiary;
    }

    &--disabled {
      color: $text-tertiary;
    }
  }

  &__footer {
    padding-bottom: calc($spacing-4 + env(safe-area-inset-bottom));
  }

  &__btn {
    width: 100%;
    height: 96rpx;
    background: $gradient-cyan;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }

    &[disabled] {
      opacity: 0.4;
    }
  }

  &__btn-text {
    font-size: $text-body;
    font-weight: 600;
    color: $text-inverse;
  }
}
</style>
