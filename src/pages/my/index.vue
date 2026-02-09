<template>
  <view class="my-page">
    <u-navbar
      :is-back="false"
      :is-fixed="true"
      background="transparent"
      :border-bottom="false"
    />
    <view class="page-container">
      <view class="page-header">
        <text class="header-title">个人中心</text>
      </view>

      <!-- VIP Section -->
      <template v-if="!isPro">
        <view class="vip-section">
          <view class="vip-content">
            <view class="relative-z-index">
              <text class="vip-status">人生趋势（基础版）</text>
              <text class="vip-level">未升级 Pro 版本</text>
              <button class="upgrade-btn" @click="goToUpgrade">
                订阅 Pro 版本，获取无限分析
              </button>
            </view>
          </view>
        </view>
      </template>

      <!-- Pro VIP Section -->
      <template v-else>
        <view class="pro-vip-section">
          <view class="pro-badge-wrapper">
            <view class="pro-badge">Pro</view>
          </view>

          <view class="blur-circle"></view>

          <view class="relative-z-index">
            <view class="pro-header">
              <view class="check-icon-wrapper">
                <text class="check-icon">✓</text>
              </view>
              <view class="pro-text-wrapper">
                <text class="pro-title">Pro 版订阅中</text>
                <text class="pro-validity">有效期至 2027.01.19</text>
              </view>
            </view>

            <view class="pro-features">
              <view class="feature-item">
                <text class="feature-title">无限次</text>
                <text class="feature-desc">深度诊断</text>
              </view>
              <view class="feature-item feature-item-divider">
                <text class="feature-title">优先</text>
                <text class="feature-desc">AI 响应</text>
              </view>
              <view class="feature-item">
                <text class="feature-title">解锁</text>
                <text class="feature-desc">核心模型</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- Invitation Section -->
      <view class="invite-section glass">
        <view class="section-header">
          <text class="section-title">邀请有礼</text>
        </view>
        
        <view class="invite-content">
          <view class="info-row">
             <text class="label">我的邀请码</text>
             <view class="value-box" @click="copyInviteCode">
                <text class="value highlight">{{ inviteCode || '--' }}</text>
                <text class="copy-hint">复制</text>
             </view>
          </view>
          
          <view class="info-row">
             <text class="label">当前积分</text>
             <text class="value">{{ tokenBalance }}</text>
          </view>
          
           <view class="info-row">
             <text class="label">免费深度诊断</text>
             <text class="value">{{ freeDeepSessions }} / 3</text>
          </view>
        </view>
        
        <view class="input-section">
          <input 
            class="invite-input" 
            v-model="inputInviteCode" 
            placeholder="输入好友邀请码" 
            placeholder-class="input-placeholder"
          />
          <button class="redeem-btn" @click="handleApplyInvite">兑换</button>
        </view>
      </view>

      <!-- Recent Chats Section -->
      <!-- Removed RecentChats component -->

      <!-- Other Options -->
      <!-- <view class="other-options">
        <view class="option-item" @click="goToOrder">
          <text class="option-text">我的订单记录</text>
          <text class="option-arrow">→</text>
        </view>
        <view class="option-item" @click="goToFeedback">
          <text class="option-text">意见反馈</text>
          <text class="option-arrow">→</text>
        </view>
      </view> -->
    </view>

    <!-- Bottom Navigation -->
    <Tabbar :current="1" />
  </view>
</template>

<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue';
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { fetchSystemUserInfo, fetchMembershipInfo, fetchApplyInvite } from '@/api/services';

const currentPage = ref('my');
const isPro = ref(false);
const inviteCode = ref('');
const tokenBalance = ref(0);
const freeDeepSessions = ref(0);
const inputInviteCode = ref('');

const loadData = async () => {
  try {
    const userInfo = await fetchSystemUserInfo() as any;
    if (userInfo && userInfo.data) {
       // Assuming the interceptor returns the raw response or the data object.
       // If interceptor works as expected, it returns 'data'.
       // But wait, the interceptor code says:
       // if (code === 200) return Promise.resolve(data);
       // So it returns the full data object which contains 'data' property?
       // Usually API returns { code: 200, data: { ... }, msg: "..." }
       // So userInfo will be { code: 200, data: { ... }, msg: ... }
       // So I should access userInfo.data.invite_code ?
       
       // Let's assume the standard format.
       const data = userInfo.data || userInfo;
       inviteCode.value = data.invite_code;
       freeDeepSessions.value = data.free_deep_sessions_total;
    }
    
    const membershipInfo = await fetchMembershipInfo() as any;
    if (membershipInfo) {
       const data = membershipInfo.data || membershipInfo;
       tokenBalance.value = data.token_balance;
    }
  } catch (error) {
    console.error('Failed to load user info', error);
  }
};

const handleApplyInvite = async () => {
  if (!inputInviteCode.value) {
    uni.showToast({ title: '请输入邀请码', icon: 'none' });
    return;
  }
  
  try {
    await fetchApplyInvite(inputInviteCode.value);
    uni.showToast({ title: '兑换成功', icon: 'success' });
    inputInviteCode.value = '';
    loadData(); // Reload data to show updated balance
  } catch (error) {
    uni.showToast({ title: '兑换失败', icon: 'none' });
    console.error(error);
  }
};

const copyInviteCode = () => {
  if (inviteCode.value) {
    uni.setClipboardData({
      data: inviteCode.value,
      success: () => uni.showToast({ title: '已复制', icon: 'none' })
    });
  }
};

onShow(() => {
  loadData();
});

const goToOrder = () => {
  uni.navigateTo({
    url: '/pages/order-detail/index',
  });
};

const goToFeedback = () => {
  uni.navigateTo({
    url: '/pages/feedback/index',
  });
};

const goToUpgrade = () => {
  uni.navigateTo({
    url: '/pages/upgrade/index',
  });
};
</script>

<style lang="scss">
.my-page {
  height: 100vh;
  background: #fbfbff;
  // background:
  //   radial-gradient(at 0% 0%, rgba(212, 226, 255, 0.5) 0, transparent 50%),
  //   radial-gradient(at 100% 0%, rgba(255, 226, 241, 0.5) 0, transparent 50%),
  //   radial-gradient(at 100% 100%, rgba(226, 255, 241, 0.5) 0, transparent 50%),
  //   radial-gradient(at 0% 100%, rgba(241, 226, 255, 0.5) 0, transparent 50%);
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 组合式类名：glass，用于通用磨砂卡片 */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.page-container {
    padding: 24px;
    flex: 1;
    height: 100%;
    overflow-y: auto;
  }

  .page-header {
    margin-bottom: 40rpx;
  }

  .header-title {
    font-size: 48rpx;
    font-weight: 900;
    color: #1f2937;
    display: block;
  }

  .vip-section {
    background: linear-gradient(to right, #1f2937, #111827);
    border-radius: 64rpx;
    padding: 48rpx;
    margin-bottom: 50rpx;
    position: relative;
    overflow: hidden;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 200rpx;
  }

  .vip-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
  }

  .vip-status {
    font-size: 28rpx;
    opacity: 0.6;
    display: block;
    margin-bottom: 10rpx;
  }

  .vip-level {
    font-size: 40rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 40rpx;
  }

  .upgrade-btn {
    background: #6366f1;
    color: white;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 30rpx;
    padding: 20rpx 32rpx;
    border: none;
    width: auto;
  }

  .vip-icon {
    font-size: 84rpx;
    opacity: 0.2;
    position: absolute;
    right: -20rpx;
    bottom: -20rpx;
  }

  .pro-vip-section {
    background: linear-gradient(135deg, #e0e7ff 0%, #f3f4ff 100%);
    border-radius: 56rpx;
    margin-bottom: 50rpx;
    padding: 48rpx;
    position: relative;
    overflow: hidden;
    border: 1rpx solid rgba(99, 102, 241, 0.2);
    position: relative;
  }

  .pro-badge-wrapper {
    position: absolute;
    top: 0;
    right: 0;
  }

  .pro-badge {
    background: rgba(79, 70, 229, 0.05);
    color: #4f46e5;
    font-size: 22rpx;
    font-weight: 900;
    padding: 20rpx 32rpx;
    border-bottom-left-radius: 56rpx;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    border-left: 1rpx solid rgba(224, 231, 255, 0.2);
    border-bottom: 1rpx solid rgba(224, 231, 255, 0.2);
  }

  .blur-circle {
    position: absolute;
    top: -32rpx;
    right: -32rpx;
    width: 128rpx;
    height: 128rpx;
    background: #c7d2fe;
    opacity: 0.2;
    border-radius: 50%;
    filter: blur(64rpx);
  }

  .relative-z-index {
    position: relative;
    z-index: 10;
  }

  .pro-header {
    display: flex;
    align-items: center;
    gap: 32rpx;
    margin-bottom: 48rpx;
  }

  .check-icon-wrapper {
    width: 96rpx;
    height: 96rpx;
    border-radius: 32rpx;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1rpx solid #e0e7ff;
    box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
  }

  .check-icon {
    width: 48rpx;
    height: 48rpx;
    color: #6366f1;
    font-size: 52rpx;
  }

  .pro-text-wrapper {
    flex: 1;
  }

  .pro-title {
    font-size: 40rpx;
    font-weight: 900;
    color: #1e293b;
    display: block;
    line-height: 1.2;
  }

  .pro-validity {
    font-size: 24rpx;
    color: #94a3b8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-top: 16rpx;
  }

  .pro-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20rpx);
    border-radius: 32rpx;
    padding: 32rpx;
    border: 1rpx solid rgba(238, 242, 255, 0.2);
  }

  .feature-item {
    text-align: center;
  }

  .feature-item-divider {
    border-left: 1rpx solid rgba(238, 242, 255, 0.2);
    border-right: 1rpx solid rgba(238, 242, 255, 0.2);
  }

  .feature-title {
    font-size: 26rpx;
    font-weight: 900;
    color: #1e293b;
    display: block;
  }

  .feature-desc {
    font-size: 20rpx;
    color: #94a3b8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-top: 4rpx;
  }

  .other-options {
    margin-top: 20rpx;
  }

  .option-item {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(14px);
    border: 1rpx solid rgba(255, 255, 255, 0.8);
    border-radius: 40rpx;
    padding: 32rpx;
    margin-bottom: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .option-text {
    font-size: 28rpx;
    color: #475569;
    font-weight: 700;
  }

  .option-arrow {
    color: #d1d5db;
    font-size: 36rpx;
  }

  .invite-section {
    border-radius: 40rpx;
    padding: 32rpx;
    margin-bottom: 32rpx;
  }
  
  .section-header {
    margin-bottom: 24rpx;
  }
  
  .section-title {
    font-size: 32rpx;
    font-weight: 900;
    color: #1e293b;
  }
  
  .invite-content {
    margin-bottom: 32rpx;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .label {
    font-size: 28rpx;
    color: #64748b;
  }
  
  .value {
    font-size: 28rpx;
    color: #1e293b;
    font-weight: 700;
  }
  
  .value-box {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .highlight {
    color: #4f46e5;
    font-size: 32rpx;
  }
  
  .copy-hint {
    font-size: 20rpx;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
  
  .input-section {
    display: flex;
    gap: 16rpx;
  }
  
  .invite-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.8);
    height: 80rpx;
    border-radius: 24rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    border: 1rpx solid rgba(226, 232, 240, 0.8);
  }
  
  .redeem-btn {
    width: 160rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #4f46e5;
    color: white;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 24rpx;
    margin: 0;
  }
</style>
