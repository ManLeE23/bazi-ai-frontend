<template>
  <view class="login-container">
    <!-- Ambient Background Elements -->
    <view class="aura-blob aura-blob-top"></view>
    <view class="aura-blob aura-blob-bottom"></view>

    <HeaderBar
      :showBack="true"
      :fixed="true"
      :placeholder="true"
      backgroundColor="transparent"
    />

    <view class="content-wrapper">
      <!-- Logo Box -->
      <view class="logo-box">
        <view class="css-logo">
          <view class="shape-1"></view>
          <view class="shape-2"></view>
          <view class="core"></view>
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
          :open-type="hasAgreed ? 'getPhoneNumber' : ''"
          @getphonenumber="handleGetPhoneNumber"
          @click="handleLoginClick"
          :disabled="isLoading"
        >
          <text class="btn-text">手机号快捷登录</text>
        </button>

        <view class="agreement-text">
          <view class="agree-row">
            <view
              class="agree-checkbox"
              :class="{ 'agree-checkbox--checked': hasAgreed }"
              @click="toggleAgree"
            ></view>
            <text class="agreement-label">我已阅读并同意</text>
            <view class="links-row">
              <text class="link" @click.stop="handleOpenLegal('user_agreement')"
                >用户协议</text
              >
              <text class="agreement-label"> 与 </text>
              <text class="link" @click.stop="handleOpenLegal('privacy_policy')"
                >隐私政策</text
              >
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Legal Popup -->
    <u-popup
      v-model="showLegalPopup"
      mode="bottom"
      border-radius="24"
      :closeable="true"
    >
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
import { onLoad } from '@dcloudio/uni-app';
import { fetchPhoneLogin, fetchLegalDocs } from '@/api/services';
import { userStore } from '@/store/user';
import HeaderBar from '@/components/HeaderBar.vue';

const isLoading = ref(false);
const inviteCode = ref('');
const redirect = ref('');
const agentType = ref('');
const showLegalPopup = ref(false);
const legalTitle = ref('');
const legalContent = ref('');
const hasAgreed = ref(false);

onLoad((options: any) => {
  if (options.inviteCode) {
    inviteCode.value = options.inviteCode;
  }
  if (options.redirect) {
    redirect.value = options.redirect;
  }
  if (options.agentType) {
    agentType.value = options.agentType;
  }
});

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

const toggleAgree = () => {
  hasAgreed.value = !hasAgreed.value;
};

const handleLoginClick = () => {
  if (!hasAgreed.value) {
    uni.showToast({ title: '请先勾选并同意协议', icon: 'none' });
  }
};

const handleGetPhoneNumber = async (e: any) => {
  if (!hasAgreed.value) {
    uni.showToast({ title: '请先勾选并同意协议', icon: 'none' });
    return;
  }

  console.log('getPhoneNumber result:', e);

  if (e.detail.errMsg === 'getPhoneNumber:ok' && e.detail.code) {
    isLoading.value = true;
    try {
      // Get login code to bind openid
      const loginRes = await uni.login({ provider: 'weixin' });
      const loginCode = loginRes.code;

      const res: any = await fetchPhoneLogin({
        code: e.detail.code,
        login_code: loginCode,
        invite_code: inviteCode.value || undefined,
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

        setTimeout(() => {
          if (redirect.value === 'step') {
            let url = '/pages/step/index';
            if (agentType.value) {
              url += `?agentType=${agentType.value}`;
            }
            uni.reLaunch({ url });
          } else if (redirect.value) {
            const decodedUrl = decodeURIComponent(redirect.value);
            if (decodedUrl.startsWith('/')) {
              uni.redirectTo({ url: decodedUrl });
            } else {
              uni.reLaunch({ url: '/pages/index/index' });
            }
          } else {
            uni.reLaunch({ url: '/pages/index/index' });
          }
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
    if (e.detail.errMsg !== 'getPhoneNumber:fail user deny') {
      uni.showToast({ title: '授权失败，请重试', icon: 'none' });
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #F8F9FF;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
}

.aura-blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(124, 77, 255, 0.12) 0%, rgba(124, 77, 255, 0) 70%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

.aura-blob-top {
  top: -100px;
  right: -100px;
}

.aura-blob-bottom {
  bottom: -200px;
  left: -200px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
  position: relative;
  z-index: 10;
  padding: 0 32px;
  flex: 1;
}

.logo-box {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 32px;
  box-shadow: 0 16px 32px rgba(124, 77, 255, 0.08), inset 0 0 20px rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .css-logo {
    width: 64px;
    height: 64px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: float-pulse 6s ease-in-out infinite;

    .shape-1 {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #7c4dff 0%, #ec4899 100%);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      animation: morph 8s ease-in-out infinite;
      opacity: 0.8;
    }

    .shape-2 {
      position: absolute;
      width: 90%;
      height: 90%;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      animation: morph 8s ease-in-out infinite reverse;
      opacity: 0.8;
    }
    
    .core {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 16px rgba(255, 255, 255, 1);
      z-index: 2;
    }
  }
}

@keyframes float-pulse {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.05); }
}

@keyframes morph {
  0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
  67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
  100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
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
    padding: 28px 0;
    height: auto;
    line-height: 1.5;
    border-radius: 999px;
    background: linear-gradient(135deg, #7c4dff 0%, #632ce5 100%);
    color: #ffffff;
    box-shadow: 0 16px 32px rgba(124, 77, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;

    &::after {
      border: none;
    }

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

    .agreement-label {
      color: #cbd5e1;
    }

    .link {
      color: #94a3b8; // slate-400
      text-decoration: underline;
      text-decoration-color: #d8b4fe; // decoration-purple-200
      margin: 0 4px;
    }

    .agree-row {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 8px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .agree-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid #cbd5e1;
      margin-right: 4px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
    }

    .agree-checkbox.agree-checkbox--checked {
      background-color: #7c4dff;
      border-color: #7c4dff;
    }

    .agree-checkbox.agree-checkbox--checked::after {
      content: '';
      width: 8px;
      height: 12px;
      border-right: 2px solid #ffffff;
      border-bottom: 2px solid #ffffff;
      transform: translateY(-1px) rotate(45deg);
      box-sizing: border-box;
    }

    .links-row {
      display: flex;
      justify-content: center;
      align-items: center;
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
