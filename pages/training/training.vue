<template>
  <view class="training-page">
    <!-- Material info header -->
    <view class="tr__header">
      <text class="tr__header-title">{{ material.title || 'AI基础认知与主流通用大模型应用' }}</text>
      <text class="tr__header-version">版本 {{ material.version || '2026.07' }}</text>
      <text class="tr__header-desc">请仔细阅读以下培训内容，完成后点击底部确认按钮</text>
    </view>

    <!-- Content area -->
    <view class="tr__content">
      <view v-if="loading" class="tr__loading">
        <text>加载培训材料中...</text>
      </view>
      <view v-else class="tr__viewer">
        <view class="tr__chapter" v-for="(chapter, idx) in chapters" :key="idx">
          <view class="tr__chapter-header">
            <view class="tr__chapter-num">{{ idx + 1 }}</view>
            <text class="tr__chapter-title">{{ chapter.title }}</text>
          </view>
          <text class="tr__chapter-body">{{ chapter.content }}</text>
        </view>
      </view>
    </view>

    <!-- Confirm button -->
    <view class="tr__footer">
      <view v-if="material.confirmed" class="tr__confirmed">
        <text class="tr__confirmed-icon">&#10003;</text>
        <text class="tr__confirmed-text">您已完成培训确认</text>
      </view>
      <button
        v-else
        class="tr__btn"
        hover-class="tr__btn--hover"
        :loading="confirming"
        @tap="handleConfirm"
      >
        <text class="tr__btn-text">我已阅读并确认</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { fetchTrainingMaterial, confirmTraining } from '@/api/training'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(true)
const confirming = ref(false)

const material = reactive({
  id: 'ai-basic-training',
  version: '2026.07',
  title: 'AI基础认知与主流通用大模型应用',
  format: 'PDF',
  pdfUrl: '',
  confirmed: false,
  confirmedAt: null
})

const chapters = [
  {
    title: '人工智能基本概念',
    content: '人工智能（AI）是研究、开发用于模拟和扩展人类智能的理论、方法及应用系统的一门技术科学。包括机器学习、深度学习、自然语言处理、计算机视觉等核心领域。机器学习是实现AI的核心方法，通过数据训练让系统自动改进性能。深度学习是机器学习的分支，利用多层神经网络处理复杂模式识别任务。'
  },
  {
    title: '大模型技术概述',
    content: '大语言模型（LLM）是基于Transformer架构的大规模预训练模型。通过对海量文本数据的学习，获得了强大的语言理解和生成能力。ChatGPT、文心一言、通义千问等都是典型的大模型产品。这些模型能够完成文本生成、问答、编程辅助、翻译等多种任务，正在深刻改变人们的工作和生活方式。'
  },
  {
    title: '国内主流大模型产品',
    content: '百度文心一言：基于文心大模型，支持多轮对话和多模态交互。阿里通义千问：支持文本和多模态，深度整合阿里生态。字节豆包/云雀：字节跳动旗下大模型产品，多模态能力突出。腾讯混元：整合微信生态，提供AI对话与内容生成。讯飞星火：讯飞认知大模型，侧重语音和自然语言处理。月之暗面Kimi：长文本处理能力突出。'
  },
  {
    title: 'AIGC生成式人工智能应用',
    content: 'AIGC（AI Generated Content）涵盖AI绘画（Midjourney、Stable Diffusion、文心一格）、AI写作（文案、脚本、报告）、AI视频（Sora、Runway）、AI音频（语音合成、音乐生成）等领域。在日常办公中，AIGC可助力文档撰写、PPT制作、会议纪要整理、邮件自动回复等场景。'
  },
  {
    title: 'AI办公效率工具',
    content: 'AI已深入办公场景：飞书智能伙伴、钉钉AI助手提供智能日程管理；WPS AI支持文档智能排版和内容生成；讯飞听见实现语音转文字；各类AI翻译工具打破语言壁垒。合理运用这些工具可显著提升工作效率，但需要掌握有效的提示词工程技巧。'
  },
  {
    title: 'AI安全与合规常识',
    content: '使用AI工具时需关注：数据安全（不将敏感信息输入公共AI服务）、算法偏见（AI可能继承训练数据的偏见）、版权归属（AI生成内容的版权问题尚存争议）、深度伪造（AI换脸、声音克隆的风险）、法规合规（遵守《生成式人工智能服务管理暂行办法》等法规）。企业应建立AI使用规范，保障信息安全。'
  }
]

onMounted(async () => {
  try {
    const data = await fetchTrainingMaterial()
    Object.assign(material, data)
  } catch (e) {
    // Use default content
  } finally {
    loading.value = false
  }
})

async function handleConfirm() {
  if (confirming.value) return
  confirming.value = true
  try {
    const result = await confirmTraining(material.id, material.version)
    material.confirmed = result.confirmed
    material.confirmedAt = result.confirmedAt
    if (userStore.user) {
      userStore.user.trainingConfirmed = true
    }
    uni.showToast({ title: '确认成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    // Error handled by interceptor
  } finally {
    confirming.value = false
  }
}
</script>

<style lang="scss" scoped>
.training-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-cool;
}

.tr {
  &__header {
    padding: $spacing-5 $spacing-4 $spacing-4;
    background: $surface;
    text-align: center;
    border-bottom: 1rpx solid $divider-light;

    &-title {
      display: block;
      font-family: $font-display;
      font-size: $text-h2;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: $tracking-heading;
      margin-bottom: $spacing-1;
    }

    &-version {
      display: block;
      font-size: $text-caption;
      color: $text-tertiary;
      margin-bottom: $spacing-3;
    }

    &-desc {
      font-size: $text-body-sm;
      color: $text-secondary;
      line-height: $leading-body;
    }
  }

  &__content {
    flex: 1;
    padding: $spacing-3 $spacing-4;
    padding-bottom: 200rpx;
  }

  &__loading {
    padding: $spacing-10 $spacing-4;
    text-align: center;
    color: $text-secondary;
    font-size: $text-body-sm;
  }

  &__chapter {
    background: $surface;
    border-radius: $radius-md;
    padding: $spacing-4;
    margin-bottom: $spacing-3;
    box-shadow: $shadow-soft;

    &-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: $spacing-3;
    }

    &-num {
      width: 44rpx;
      height: 44rpx;
      border-radius: 50%;
      background: $gradient-cyan;
      color: $text-inverse;
      font-size: $text-caption;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: $spacing-3;
      margin-top: 2rpx;
    }

    &-title {
      font-family: $font-display;
      font-size: $text-body;
      font-weight: 600;
      color: $text-primary;
      letter-spacing: $tracking-heading;
      line-height: 1.4;
    }

    &-body {
      font-size: $text-body-sm;
      color: $text-secondary;
      line-height: $leading-body;
    }
  }

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-4;
    padding-bottom: calc($spacing-4 + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, transparent 0%, $bg-cool 30%);
  }

  &__confirmed {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    background: $success-light;
    border-radius: $radius-lg;

    &-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: $success;
      color: $text-inverse;
      font-size: $text-caption;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: $spacing-2;
    }

    &-text {
      font-size: $text-body;
      color: $success;
      font-weight: 600;
    }
  }

  &__btn {
    width: 100%;
    height: 96rpx;
    background: $gradient-cyan;
    border-radius: $radius-lg;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-property: transform, opacity;
    transition-duration: $duration-fast;
    transition-timing-function: $ease-out;

    &--hover {
      opacity: 0.85;
      transform: scale(0.98);
    }

    &-text {
      font-size: $text-body;
      font-weight: 600;
      color: $text-inverse;
    }
  }
}
</style>
