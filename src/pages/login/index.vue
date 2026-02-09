<template>
  <view class="login-container">
    <!-- Header Visual -->
    <view class="header-visual">
      <view class="header-bg-text">TRENDLIFY</view>
    </view>

    <view class="content-wrapper">
      <!-- Logo Box -->
      <view class="logo-box">
        <view class="logo-inner">
          <text class="logo-text">趋</text>
        </view>
      </view>
      
      <!-- Text Content -->
      <view class="text-center">
        <text class="app-title">人生趋势</text>
        <text class="app-subtitle">看清趋势，走对下一步</text>
      </view>

      <!-- Action Section -->
      <view class="action-section">
        <button 
          class="login-btn" 
          open-type="getPhoneNumber"
          @getphonenumber="handleGetPhoneNumber"
          :disabled="isLoading"
        >
          <text class="btn-text">手机号快捷登录</text>
        </button>
        
        <view class="agreement-text">
          <text class="agreement-label">登录即代表您已阅读并同意</text>
          <view class="links-row">
            <text class="link" @click="handleOpenLegal('user_agreement')">用户协议</text>
            <text class="agreement-label"> 与 </text>
            <text class="link" @click="handleOpenLegal('privacy_policy')">隐私政策</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Legal Popup -->
    <u-popup v-model="showLegalPopup" mode="bottom" border-radius="24" :closeable="true">
      <view class="legal-popup-content">
        <view class="legal-title">{{ legalTitle }}</view>
        <scroll-view scroll-y class="legal-scroll">
          <text class="legal-text">{{ legalContent }}</text>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchPhoneLogin, fetchLegalDocs } from '@/api/services';
import { userStore } from '@/store/user';

const isLoading = ref(false);
const showLegalPopup = ref(false);
const legalTitle = ref('');
const legalContent = ref('');

const handleOpenLegal = async (type: 'user_agreement' | 'privacy_policy') => {
  uni.showLoading({ title: '加载中...' });
  try {
    legalTitle.value = type === 'user_agreement' ? '用户协议' : '隐私政策';
    const res: any = await fetchLegalDocs(type);
    if (res.code === 200 && res.data) {
      legalContent.value = res.data.content || '暂无内容';
      showLegalPopup.value = true;
    } else {
      uni.showToast({ title: '获取内容失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Fetch legal doc error:', error);
    uni.showToast({ title: '获取内容失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const handleGetPhoneNumber = async (e: any) => {
  console.log('getPhoneNumber result:', e);
  
  if (e.detail.errMsg === "getPhoneNumber:ok" && e.detail.code) {
    isLoading.value = true;
    try {
      // Get login code to bind openid
      const loginRes = await uni.login({ provider: 'weixin' });
      const loginCode = loginRes.code;

      const res: any = await fetchPhoneLogin({ 
        code: e.detail.code,
        login_code: loginCode
      });
      console.log('Phone login response:', res);
      
      const data = res.data;
      if (data && data.token) {
        // Save token
        uni.setStorageSync('token', data.token);
        
        // Save user info if available
        if (data.user) {
           userStore.setSystemUser(data.user);
        }

        uni.showToast({ title: '登录成功', icon: 'none' });
        
        // Navigate to home
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/home/index' });
        }, 500);
      } else {
        uni.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    } catch (error) {
      console.error('Phone login API error:', error);
      uni.showToast({ title: '登录出错，请重试', icon: 'none' });
    } finally {
      isLoading.value = false;
    }
  } else {
    // User denied or error
    if (e.detail.errMsg !== "getPhoneNumber:fail user deny") {
       uni.showToast({ title: '授权失败，请重试', icon: 'none' });
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.header-visual {
    position: relative;
    height: 40vh;
    background: radial-gradient(circle at 50% 40%, #818cf8 0%, #6366f1 100%);
    // Using border-radius to approximate the clip-path ellipse(120% 100% at 50% 0%)
    // A large bottom radius creates a convex curve downwards
    border-bottom-left-radius: 40% 20%;
    border-bottom-right-radius: 40% 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    .header-bg-text {
      font-size: 60px;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.2);
      letter-spacing: -2px;
      opacity: 0.4;
      pointer-events: none;
      user-select: none;
    }
  }

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -64px; // -mt-16
  position: relative;
  z-index: 10;
  padding: 0 32px;
}

.logo-box {
    width: 112px; // w-28
    height: 112px; // h-28
    background: #ffffff;
    border-radius: 32px;
    padding: 4px;
    box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.2);
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  
  .logo-inner {
    width: 100%;
    height: 100%;
    border-radius: 28px;
    background-color: #eef2ff; // indigo-50
    border: 2px solid rgba(224, 231, 255, 0.5); // indigo-100/50
    display: flex;
    align-items: center;
    justify-content: center;
    
    .logo-text {
      font-size: 36px; // text-4xl
      font-weight: 900;
      color: #1e293b; // slate-800
      font-style: italic;
    }
  }
}

.text-center {
  text-align: center;
  margin-bottom: 48px;
  
  .app-title {
    display: block;
    font-size: 24px; // text-2xl
    font-weight: 900;
    color: #0f172a; // slate-900
    letter-spacing: -0.025em; // tracking-tight
    margin-bottom: 8px;
  }
  
  .app-subtitle {
    display: block;
    font-size: 12px; // text-xs
    color: #94a3b8; // slate-400
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
}

.action-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  .login-btn {
    width: 100%;
    padding: 24px 0; // py-4 equivalent (check uni-app button height quirks)
    height: auto;
    line-height: 1.5;
    border-radius: 16px; // rounded-2xl
    background-color: #1e293b; // btn-main color
    color: #ffffff;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); // shadow-xl
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    
    &::after { border: none; }
    
    &:active {
      transform: scale(0.96);
      opacity: 0.9;
    }
    
    .btn-text {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.1em; // tracking-widest
    }
  }
  
  .agreement-text {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #cbd5e1; // slate-300
    line-height: 2;
    
    .links-row {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .agreement-label {
       color: #cbd5e1;
    }
    
    .link {
      color: #94a3b8; // slate-400
      text-decoration: underline;
      text-decoration-color: #c7d2fe; // decoration-indigo-200
      margin: 0 4px;
    }
  }
}

.legal-popup-content {
  padding: 32px 24px;
  background-color: #ffffff;
  height: 60vh;
  display: flex;
  flex-direction: column;
  
  .legal-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    margin-bottom: 16px;
  }
  
  .legal-scroll {
    flex: 1;
    height: 0;
  }
  
  .legal-text {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
</style>
