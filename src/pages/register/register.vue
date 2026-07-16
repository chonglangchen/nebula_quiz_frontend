<template>
  <view class="register-page">
    <!-- Header -->
    <view class="reg__header">
      <image class="reg__logo" src="/static/brand-logo.png" mode="aspectFit" />
      <text class="reg__header-title">实名注册</text>
      <text class="reg__header-desc">请填写真实信息，完成注册后即可开始答题</text>
    </view>

    <!-- Form -->
    <view class="reg__form">
      <!-- Name -->
      <view class="reg__field">
        <text class="reg__label">真实姓名</text>
        <input
          class="reg__input"
          v-model="form.realName"
          placeholder="请输入您的真实姓名"
          placeholder-style="color: #94A3B8"
          maxlength="50"
        />
      </view>

      <!-- Employee ID -->
      <view class="reg__field">
        <text class="reg__label">工号</text>
        <input
          class="reg__input"
          v-model="form.employeeNo"
          placeholder="请输入您的工号"
          placeholder-style="color: #94A3B8"
          maxlength="32"
        />
      </view>

      <!-- Department -->
      <view class="reg__field">
        <text class="reg__label">所属部门</text>
        <picker
          mode="selector"
          :range="departmentNames"
          @change="handleDeptChange"
        >
          <view class="reg__picker" :class="{ 'reg__picker--placeholder': !form.departmentName }">
            <text>{{ form.departmentName || '请选择部门' }}</text>
            <text class="reg__picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- Phone -->
      <view class="reg__field">
        <text class="reg__label">手机号</text>
        <input
          class="reg__input"
          v-model="form.phone"
          type="number"
          placeholder="请输入11位手机号"
          placeholder-style="color: #94A3B8"
          maxlength="11"
        />
      </view>
    </view>

    <!-- Submit -->
    <view class="reg__footer">
      <button
        class="reg__btn"
        hover-class="reg__btn--hover"
        :loading="loading"
        :disabled="!valid"
        @tap="handleSubmit"
      >
        <text class="reg__btn-text">提交注册</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { register } from '@/api/auth'
import { fetchDepartments } from '@/api/auth'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(false)

// Get params from login page
const query = uni.getLaunchOptionsSync?.()?.query || {}
// For H5, parse query string
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const options = currentPage?.options || {}

const registrationToken = ref(options.token || '')

const departments = ref([])
const departmentNames = computed(() => departments.value.map(d => d.name || d.code))

const form = reactive({
  realName: '',
  employeeNo: '',
  departmentCode: '',
  departmentName: '',
  phone: ''
})

const valid = computed(() => {
  return form.realName.length >= 2
    && form.employeeNo.length > 0
    && form.departmentCode.length > 0
    && /^1[3-9]\d{9}$/.test(form.phone)
})

onMounted(async () => {
  try {
    departments.value = await fetchDepartments()
  } catch (e) {
    // ignore
  }
})

function handleDeptChange(e) {
  const idx = e.detail.value
  const dept = departments.value[idx]
  if (dept) {
    form.departmentCode = dept.code
    form.departmentName = dept.name
  }
}

async function handleSubmit() {
  if (!valid.value || loading.value) return
  loading.value = true
  try {
    const payload = await register({
      registrationToken: registrationToken.value,
      realName: form.realName,
      employeeNo: form.employeeNo,
      departmentCode: form.departmentCode,
      phone: form.phone
    })
    userStore.setUser(payload.user)
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    // Error toast handled by request interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: $bg-cool;
  padding: $spacing-4;
}

.reg {
  &__header {
    padding: $spacing-5 0 $spacing-4;
    margin-bottom: $spacing-3;
    text-align: center;

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
      line-height: $leading-body;
    }
  }

  &__logo {
    width: 320rpx;
    height: 100rpx;
    margin-bottom: $spacing-5;
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
    letter-spacing: 0.02em;
  }

  &__input {
    width: 100%;
    height: 72rpx;
    font-size: $text-body;
    color: $text-primary;
    background: transparent;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  &__picker {
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &--placeholder {
      color: $text-tertiary;
    }

    &-arrow {
      font-size: 40rpx;
      color: $text-tertiary;
      font-weight: 300;
    }
  }

  &__footer {
    padding-bottom: $spacing-4;
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
    box-shadow: $shadow-btn;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }

    &[disabled] {
      opacity: 0.4;
      box-shadow: none;
    }

    &-text {
      font-size: $text-body;
      font-weight: 600;
      color: $text-inverse;
    }
  }
}
</style>
