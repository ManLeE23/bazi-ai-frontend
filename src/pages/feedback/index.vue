<template>
  <view class="feedback-page">
    <u-navbar
      :is-back="false"
      :is-fixed="true"
      background="transparent"
      :border-bottom="false"
    >
      <view slot="left">
        <u-icon name="arrow-left" size="32" @click="handleBack"></u-icon>
        <text class="page-title">意见反馈</text>
      </view>
    </u-navbar>
    <!-- <view class="page-header">
      <button @click="handleBack" class="back-button">✕</button>
      <text class="page-title">意见反馈</text>
    </view> -->

    <view class="page-content">
      <view class="form-section">
        <text class="section-label">反馈类型</text>
        <view class="feedback-types">
          <button 
            v-for="type in feedbackTypes" 
            :key="type"
            @click="selectFeedbackType(type)"
            :class="['feedback-type-button', feedbackType === type ? 'selected' : '']"
          >
            {{ type }}
          </button>
        </view>
      </view>

      <view class="form-section">
        <text class="section-label">详细描述</text>
        <textarea 
          v-model="feedbackContent"
          placeholder="请详细描述您遇到的问题或建议，我们将尽快为您优化..."
          class="feedback-textarea"
        ></textarea>
      </view>

      <view class="form-section">
        <text class="section-label">联系方式 (可选)</text>
        <input 
          v-model="contactInfo"
          type="text" 
          placeholder="邮箱或手机号"
          class="contact-input"
        />
      </view>

      <button 
        @click="submitFeedback"
        class="submit-button"
      >
        提交反馈
      </button>

      <view class="footer-text">
        <text>感谢您的支持，LifeFlow 团队会阅读每一条建议</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const feedbackTypes = ['功能建议', '内容错误', '支付问题', '其他'];

const feedbackType = ref<string>('');
const feedbackContent = ref<string>('');
const contactInfo = ref<string>('');

const selectFeedbackType = (type: string) => {
  feedbackType.value = type;
};

const submitFeedback = () => {
  if (!feedbackType.value) {
    uni.showToast({
      title: '请选择反馈类型',
      icon: 'none'
    });
    return;
  }

  if (!feedbackContent.value.trim()) {
    uni.showToast({
      title: '请填写详细描述',
      icon: 'none'
    });
    return;
  }

  uni.showToast({
    title: '反馈提交成功',
    icon: 'success'
  });

  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};

const handleBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.feedback-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fbfbff;
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.page-header {
  padding-left: 48rpx;
  padding-right: 48rpx;
  padding-top: 96rpx;
  padding-bottom: 48rpx;
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  font-size: 32rpx;
  color: #64748b;
  border: none;
}

.back-button:active {
  transform: scale(0.95);
}

.page-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #334155;
}

.page-content {
  flex: 1;
  padding-left: 48rpx;
  padding-right: 48rpx;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.form-section {
  display: flex;
  flex-direction: column;
}

.section-label {
  font-size: 20rpx;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  margin-left: 8rpx;
}

.feedback-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 16rpx;
}

.feedback-type-button {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  border-radius: 32rpx;
  font-size: 20rpx;
  font-weight: 700;
  border: 1rpx solid #ffffff;
  transition: all 0.3s;
  background-color: #ffffff;
  color: #475569;
}

.feedback-type-button:active {
  transform: scale(0.95);
}

.feedback-type-button.selected {
  background-color: #4f46e5;
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(79, 70, 229, 0.3);
  border: none;
}

.feedback-textarea {
  width: 100%;
  margin-top: 16rpx;
  min-height: 200rpx;
  border-radius: 32rpx;
  padding: 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  outline: none;
  border: none;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  resize: none;
  transition: all 0.3s;
}

.feedback-textarea:focus {
  box-shadow: 0 0 0 4rpx rgba(99, 102, 241, 0.2);
}

.contact-input {
  width: 100%;
  margin-top: 16rpx;
  height: 112rpx;
  border-radius: 24rpx;
  padding-left: 40rpx;
  padding-right: 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  outline: none;
  border: none;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  transition: all 0.3s;
}

.contact-input:focus {
  box-shadow: 0 0 0 4rpx rgba(99, 102, 241, 0.2);
}

.submit-button {
  width: 100%;
  height: 112rpx;
  background-color: #1e293b;
  color: #ffffff;
  border-radius: 32rpx;
  font-size: 20rpx;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  box-shadow: 0 16rpx 48rpx rgba(30, 41, 59, 0.2);
  transition: all 0.3s;
  border: none;
  margin-top: 8rpx;
}

.submit-button:active {
  transform: scale(0.95);
}

.footer-text {
  text-align: center;
  padding-bottom: 80rpx;
}

.footer-text text {
  font-size: 20rpx;
  font-weight: 700;
  color: #cbd5e1;
}
</style>