<template>
  <view class="feedback-page">
    <HeaderBar
      title="意见反馈"
      :fixed="true"
      :placeholder="true"
      background-color="#F1F0FA"
    />

    <view class="content-container">
      <!-- Header -->
      <!-- <view class="page-header">
        <text class="header-title">用户反馈</text>
      </view> -->

      <view class="main-content">
        
        <!-- Feedback Type Section -->
        <view class="card-section">
          <text class="section-title">反馈类型</text>
          <view class="type-grid">
            <view 
              v-for="type in feedbackTypes" 
              :key="type.value"
              class="type-btn"
              :class="{ 
                'active': selectedType === type.value,
                'active-problem': selectedType === 'problem' && type.value === 'problem',
                'active-feature': selectedType === 'feature' && type.value === 'feature',
                'active-usage': selectedType === 'usage' && type.value === 'usage',
                'active-other': selectedType === 'other' && type.value === 'other'
              }"
              @click="selectType(type.value)"
            >
              <text class="type-text">{{ type.label }}</text>
            </view>
          </view>
        </view>

        <!-- Feedback Content Section -->
        <view class="card-section">
          <text class="section-title">反馈内容</text>
          <textarea 
            v-model="content"
            placeholder="请详细描述您的反馈..." 
            class="feedback-textarea"
            :maxlength="500"
            placeholder-style="color: #94a3b8; font-size: 32rpx" 
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
        <view class="emergency-section">
          <view class="emergency-header">
            <u-icon name="server-fill" size="28" color="#6366f1"></u-icon>
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
  background-color: #F1F0FA;
  padding-bottom: 48rpx;
}

.content-container {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  width: 100%;
  max-width: 600rpx;
  display: flex;
  justify-content: center;
  padding: 32rpx 0;
  margin-bottom: 32rpx;
  
  .header-title {
    font-size: 36rpx;
    font-weight: 900;
    color: #1e293b;
    letter-spacing: -0.025em;
  }
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.card-section {
  background-color: #ffffff;
  border-radius: 64rpx;
  padding: 48rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  
  .section-title {
    font-size: 24rpx;
    font-weight: 900;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.1em;
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
  background-color: #f8fafc;
  border: 2rpx solid #f1f5f9;
  transition: all 0.2s;
  
  .type-text {
    font-size: 26rpx;
    font-weight: 900;
    color: #94a3b8;
  }
  
  &.active {
    background-color: #4f46e5; // indigo-600
    border-color: #4f46e5;
    box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.2);
    
    .type-text {
      color: #ffffff;
    }
  }
}

.feedback-textarea {
  width: 100%;
  box-sizing: border-box;
  height: 350rpx;
  background-color: #f8fafc;
  border-radius: 32rpx;
  padding: 32rpx;
  font-size: 32rpx;
  color: #334155;
  line-height: 1.6;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  
  &:focus {
    background-color: #ffffff;
    border-color: #818cf8;
  }
}
.submit-container {
  padding-top: 16rpx;
}

.submit-btn {
  width: 100%;
  padding: 16rpx 0;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.25);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.disabled {
    opacity: 0.7;
    pointer-events: none;
  }
  
  .btn-text {
    font-size: 32rpx;
    font-weight: 900;
    color: #ffffff;
  }
}

.emergency-section {
  background-color: rgba(235, 234, 245, 0.6);
  border-radius: 64rpx;
  padding: 48rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  
  .emergency-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
    
    .emergency-title {
      font-size: 28rpx;
      font-weight: 900;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.1em;
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
      color: #4f46e5;
      font-weight: 700;
      font-style: italic;
    }
  }
  
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 32rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    border: 2rpx solid #f1f5f9;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      background-color: #f8fafc;
    }
    
    .copy-text {
      font-size: 24rpx;
      font-weight: 900;
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
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }
}
</style>