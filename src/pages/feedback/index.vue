<template>
  <view class="feedback-page">
    <!-- Ambient Background Elements -->
    <view class="aura-blob aura-blob-top"></view>
    <view class="aura-blob aura-blob-bottom"></view>

    <HeaderBar
      title="意见反馈"
      :fixed="true"
      :placeholder="true"
      background-color="transparent"
    />

    <view class="content-container">
      <view class="main-content">
        
        <!-- Feedback Type Section -->
        <view class="card-section glass-card">
          <text class="section-title">反馈类型</text>
          <view class="type-grid">
            <view 
              v-for="type in feedbackTypes" 
              :key="type.value"
              class="type-btn"
              :class="{ 
                'active': selectedType === type.value
              }"
              @click="selectType(type.value)"
            >
              <text class="type-text">{{ type.label }}</text>
            </view>
          </view>
        </view>

        <!-- Feedback Content Section -->
        <view class="card-section glass-card">
          <text class="section-title">反馈内容</text>
          <textarea 
            v-model="content"
            placeholder="请详细描述您的反馈..." 
            class="feedback-textarea"
            :maxlength="500"
            placeholder-style="color: #94a3b8; font-size: 28rpx" 
          ></textarea>
        </view>

        <!-- Submit Button -->
        <view class="submit-container">
          <button 
            class="submit-btn" 
            :class="{ 'disabled': isSubmitting }"
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
            <text class="btn-text">{{ isSubmitting ? '提交中...' : '提交反馈' }}</text>
          </button>
        </view>

        <!-- Emergency Contact Section -->
        <view class="emergency-section glass-card">
          <view class="emergency-header">
            <u-icon name="server-fill" size="28" color="#7c4dff"></u-icon>
            <text class="emergency-title">紧急联系</text>
          </view>
          <text class="emergency-desc">
            如果您有紧急问题或需要更快的回复，请直接发送邮件至 <text class="email-highlight">{{ email }}</text>，我们会优先处理您的问题。
          </text>
          <view class="copy-btn" @click="copyEmail">
            <text class="copy-text">复制邮箱</text>
          </view>
        </view>

      </view>

      <view class="footer-brand">
        <text class="brand-text">感谢您对人生趋势的支持</text>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchSubmitFeedback } from '@/api/services';
import HeaderBar from '@/components/HeaderBar.vue';

const email = 'money1uk@qq.com';

const feedbackTypes = [
  { label: '问题反馈', value: 'problem' },
  { label: '功能建议', value: 'feature' },
  { label: '使用问题', value: 'usage' },
  { label: '其他', value: 'other' }
];

const selectedType = ref('problem');
const content = ref('');
const isSubmitting = ref(false);

const selectType = (value: string) => {
  selectedType.value = value;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  if (!selectedType.value) {
    uni.showToast({
      title: '请选择反馈类型',
      icon: 'none'
    });
    return;
  }

  if (!content.value.trim()) {
    uni.showToast({
      title: '请填写反馈内容',
      icon: 'none'
    });
    return;
  }

  isSubmitting.value = true;

  try {
    await fetchSubmitFeedback({
      feedback_type: selectedType.value,
      content: content.value
    });

    uni.showToast({
      title: '反馈提交成功',
      icon: 'success'
    });

    content.value = '';
    selectedType.value = 'problem';
    
    setTimeout(() => {
      uni.navigateBack();
    }, 500)

  } catch (error) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
    console.error('Submit feedback error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const copyEmail = () => {
  uni.setClipboardData({
    data: email,
    success: () => {
      uni.showToast({
        title: '邮箱已复制',
        icon: 'none'
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  background-color: #F8F9FF; /* Transcendental Ether base */
  padding-bottom: 48rpx;
  position: relative;
  overflow-x: hidden;
}

/* Ambient Background Blobs */
.aura-blob {
  position: absolute;
  width: 1200rpx;
  height: 1200rpx;
  background: radial-gradient(circle, rgba(124, 77, 255, 0.12) 0%, rgba(124, 77, 255, 0) 70%);
  filter: blur(160rpx);
  z-index: 0;
  pointer-events: none;
}

.aura-blob-top {
  top: -300rpx;
  right: -300rpx;
}

.aura-blob-bottom {
  bottom: -300rpx;
  left: -300rpx;
}

.content-container {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 16rpx 32rpx rgba(124, 77, 255, 0.04);
}

.card-section {
  border-radius: 48rpx;
  padding: 40rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 900;
    color: #191C20;
    margin-bottom: 32rpx;
    display: block;
  }
}

.type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-btn {
  padding: 16rpx 40rpx;
  border-radius: 9999rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(202, 195, 216, 0.4);
  transition: all 0.2s;
  
  .type-text {
    font-size: 26rpx;
    font-weight: 800;
    color: #64748b;
  }
  
  &.active {
    background-color: #ffffff;
    border-color: rgba(124, 77, 255, 0.4);
    box-shadow: 0 4rpx 12rpx rgba(124, 77, 255, 0.1);
    
    .type-text {
      color: #7c4dff;
    }
  }
}

.feedback-textarea {
  width: 100%;
  box-sizing: border-box;
  height: 350rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 32rpx;
  padding: 32rpx;
  font-size: 28rpx;
  color: #191C20;
  line-height: 1.6;
  border: 1px solid rgba(202, 195, 216, 0.2);
  transition: all 0.2s;
  
  &:focus {
    background-color: #ffffff;
    border-color: rgba(124, 77, 255, 0.4);
    box-shadow: 0 4rpx 12rpx rgba(124, 77, 255, 0.1);
  }
}

.submit-container {
  padding-top: 16rpx;
}

.submit-btn {
  width: 100%;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #7c4dff;
  border-radius: 999rpx;
  box-shadow: 0 16rpx 32rpx rgba(124, 77, 255, 0.2);
  transition: all 0.2s;
  border: none;
  
  &::after { border: none; }
  
  &:active {
    transform: scale(0.96);
  }
  
  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  
  .btn-text {
    font-size: 32rpx;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.1em;
  }
}

.emergency-section {
  border-radius: 48rpx;
  padding: 40rpx;
  background-color: rgba(124, 77, 255, 0.05);
  border: 1px solid rgba(124, 77, 255, 0.1);
  
  .emergency-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
    
    .emergency-title {
      font-size: 28rpx;
      font-weight: 900;
      color: #7c4dff;
    }
  }
  
  .emergency-desc {
    font-size: 26rpx;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 32rpx;
    display: block;
    font-weight: 500;
    
    .email-highlight {
      color: #7c4dff;
      font-weight: 800;
    }
  }
  
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 32rpx;
    background-color: #ffffff;
    border-radius: 999rpx;
    border: 1px solid rgba(202, 195, 216, 0.4);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
    
    &:active {
      background-color: #f8fafc;
      transform: scale(0.96);
    }
    
    .copy-text {
      font-size: 24rpx;
      font-weight: 800;
      color: #475569;
    }
  }
}

.footer-brand {
  margin-top: 64rpx;
  
  .brand-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.1em;
  }
}
</style>