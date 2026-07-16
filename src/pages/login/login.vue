<template>
  <view class="login-page">
    <view class="login__card">
      <!-- Brand Logo -->
      <view class="login__logo-wrap">
        <image class="login__logo" src="/static/brand-logo.png" mode="aspectFit" />
      </view>

      <!-- Form -->
      <view class="login__form">
        <view class="login__field">
          <text class="login__label">账号</text>
          <input
            class="login__input"
            v-model="phone"
            type="text"
            placeholder="请输入账号名或手机号"
            placeholder-style="color: #94A3B8"
          />
        </view>
        <view class="login__field">
          <text class="login__label">密码</text>
          <input
            class="login__input"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            placeholder-style="color: #94A3B8"
          />
        </view>
      </view>

      <button
        class="login__btn"
        hover-class="login__btn--hover"
        :loading="loading"
        :disabled="!valid"
        @tap="handleLogin"
      >
        <text class="login__btn-text">登录</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { passwordLogin } from '@/api/auth'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(false)
const phone = ref('')
const password = ref('')

const valid = computed(() => {
  return phone.value.trim().length > 0 && password.value.length > 0
})

async function handleLogin() {
  if (!valid.value || loading.value) return
  loading.value = true
  try {
    const data = await passwordLogin(phone.value, password.value)

    if (data.mustChangePassword) {
      userStore.mustChangePassword = true
      uni.setStorageSync('nq_temp_phone', phone.value)
      uni.redirectTo({ url: '/pages/change-password/change-password' })
    } else {
      // Normalize: AuthUser has employeeNo, normalize to employeeId
      const user = { ...data.user, employeeId: data.user.employeeId || data.user.employeeNo }
      userStore.setUser(user)
      uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (e) {
    // Error handled by request interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-cool;
  padding: $spacing-4;
}

.login {
  &__card {
    width: 100%;
    max-width: 640rpx;
    background: $surface;
    border-radius: $radius-xl;
    padding: $spacing-8 $spacing-5 $spacing-6;
    box-shadow: $shadow-card;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__logo-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-6;
  }

  &__logo {
    width: 320rpx;
    height: 100rpx;
  }

  &__form {
    width: 100%;
    margin-bottom: $spacing-6;
  }

  &__field {
    margin-bottom: $spacing-4;

    &:last-child {
      margin-bottom: 0;
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
    height: 88rpx;
    font-size: $text-body;
    color: $text-primary;
    background: $surface-secondary;
    border-radius: $radius-md;
    padding: 0 $spacing-4;
    box-sizing: border-box;

    &::placeholder {
      color: $text-tertiary;
    }
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
