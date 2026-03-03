<template>
  <view class="page-container mesh-bg">
    <!-- <view class="content-wrapper"> -->
      <!-- Header -->
      <view class="header">
        <!-- Left: Close Button -->
        <view class="header-left">
          <view class="btn-circle" @click="handleClose">
            <text class="icon-close">×</text>
          </view>
        </view>

        <!-- Center: Progress Dots -->
        <view class="progress-dots">
          <view 
            v-for="i in 5" 
            :key="i" 
            class="dot"
            :class="{ 'active': formStep === i }"
          ></view>
        </view>

        <!-- Right: Placeholder (Empty to avoid capsule collision) -->
        <view class="header-right"></view>
      </view>

      <view class="step-content">
        <transition name="step-fade" mode="out-in">
          <!-- Step 1: Name -->
          <view v-if="formStep === 1" class="step-inner" key="1">
            <text class="title">你好，{{ '\n' }}该如何称呼你？</text>
            <text class="subtitle">姓名仅用于区分档案，不影响趋势分析</text>
            
            <view class="form-section">
              <view class="input-group">
                <text class="input-label">你的名字</text>
                <input 
                  type="text" 
                  v-model="form.name" 
                  placeholder="请输入你的姓名或常用称呼" 
                  class="clean-input" 
                  placeholder-style="color: #94a3b8; font-size: 14px" 
                />
              </view>
            </view>
          </view>

          <!-- Step 2: Gender -->
          <view v-else-if="formStep === 2" class="step-inner" key="2">
            <text class="title">选择性别</text>
            <text class="subtitle">用于分析模型的基础参数</text>
            
            <view class="gender-grid">
              <view 
                class="gender-card" 
                :class="{ 'active': form.gender === '男' }" 
                @click="form.gender = '男'"
              >
                <text class="gender-big-text">男</text>
                <text class="gender-label">乾造</text>
              </view>
              <view 
                class="gender-card" 
                :class="{ 'active': form.gender === '女' }" 
                @click="form.gender = '女'"
              >
                <text class="gender-big-text">女</text>
                <text class="gender-label">坤造</text>
              </view>
            </view>
          </view>

          <!-- Step 3: Birthday -->
          <view v-else-if="formStep === 3" class="step-inner" key="3">
            <text class="title">输入出生时间</text>
            <text class="subtitle">用于分析模型的基础参数</text>
            
            <view class="form-section">
              <view class="input-group">
                <text class="input-label">出生时间</text>
                <DateTimePicker
                  v-model:date="form.birthday"
                  v-model:time="form.birthtime"
                  v-model:mode="form.mode"
                  @lunar-date="form.lunarBirthday = $event"
                >
                  <view class="clean-input picker-display">
                    {{ (form.mode === 'lunar' && form.lunarBirthday) ? (form.lunarBirthday + ' ' + (form.birthtime || '00:00')) : (form.birthday ? form.birthday + ' ' + (form.birthtime || '00:00') : '选择日期时间') }}
                  </view>
                </DateTimePicker>
              </view>
              <view class="privacy-tip">
                <view class="privacy-icon-circle">
                   <image :src="SafeSvg" class="icon-lock" mode="aspectFit" />
                </view>
                <text class="privacy-text">你的出生时间仅用于分析模型的基础参数，将加密存储。</text>
              </view>
            </view>
          </view>

          <!-- Step 4: Birth Address -->
          <view v-else-if="formStep === 4" class="step-inner" key="4">
            <text class="title">最后一步{{ '\n' }}完善你的趋势背景</text>
            <text class="subtitle">出生地点用于校准分析模型，提升结果参考价值</text>
            
            <view class="form-section">
              <view class="input-group">
                <text class="input-label">出生地点</text>
                <RegionPicker v-model="form.birthAddress" class="picker-full">
                  <view class="clean-input picker-display">
                    {{ form.birthAddress || '选择省市区' }}
                  </view>
                </RegionPicker>
              </view>
            </view>
          </view>

          <!-- Step 5: Confirmation -->
          <view v-else-if="formStep === 5" class="step-inner" key="5">
            <text class="title">确认信息</text>
            <!-- <text class="subtitle">请仔细核对以下信息，确保为您生成专属的深度解读</text> -->
            
            <view class="form-section">
              <view class="info-card">
                <view class="info-row" @click="formStep = 1">
                  <text class="info-label">姓名</text>
                  <view class="info-value-group">
                    <text class="info-value">{{ form.name }}</text>
                  </view>
                </view>
                <view class="info-row" @click="formStep = 2">
                  <text class="info-label">性别</text>
                  <view class="info-value-group">
                    <text class="info-value">{{ form.gender }}</text>
                  </view>
                </view>
                <view class="info-row" @click="formStep = 3">
                  <text class="info-label">出生日期</text>
                  <view class="info-value-group">
                    <text class="info-value">{{ formattedBirthday }}</text>
                  </view>
                </view>
                <view class="info-row" @click="formStep = 4">
                  <text class="info-label">出生地点</text>
                  <view class="info-value-group">
                    <text class="info-value">{{ form.birthAddress }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </transition>
      </view>

      <!-- Footer -->
      <view class="footer">
        <view 
          v-if="formStep > 1" 
          class="btn-back"
          @click="formStep--"
        >
          <text class="icon-back">←</text>
        </view>
        <button 
          class="btn-primary" 
          :disabled="!isValid || isLoading" 
          :class="{ 'disabled': !isValid || isLoading }"
          :loading="isLoading"
          @click="handleNext"
        >
          {{ isLoading ? '生成中...' : (formStep < 5 ? '继续' : '开启趋势分析') }}
        </button>
      </view>
    <!-- </view> -->
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import RegionPicker from '@/components/RegionPicker.vue';
import { fetchCreateProfile, fetchCreateSession } from '@/api/services';
import { userStore } from '@/store/user';
import SafeSvg from '@/static/icon/safe.svg?url'

onMounted(() => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.reLaunch({
      url: '/pages/login/index'
    });
  }
});

const formStep = ref(1);
const isLoading = ref(false);
const form = reactive({
  name: '',
  gender: '', 
  birthday: '2000-01-01',
  lunarBirthday: '',
  birthtime: '12:00',
  birthAddress: '',
  mode: 'gregorian'
});

const isValid = computed(() => {
  if (formStep.value === 1) return form.name.trim().length > 0;
  if (formStep.value === 2) return form.gender !== '';
  if (formStep.value === 3) return !!form.birthday && !!form.birthtime;
  if (formStep.value === 4) return form.birthAddress !== '';
  if (formStep.value === 5) return true;
  return false;
});

const formattedBirthday = computed(() => {
  const dateStr = (form.mode === 'lunar' && form.lunarBirthday) 
    ? form.lunarBirthday 
    : form.birthday;
  const timeStr = form.birthtime || '00:00';
  const typeStr = form.mode === 'lunar' ? ' (阴历)' : ' (阳历)';
  return `${dateStr} ${timeStr}${typeStr}`;
});

const handleClose = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({
      url: '/pages/home/index'
    });
  }
};

const handleLeftClick = () => {
  if (formStep.value > 1) {
    formStep.value--;
  } else {
    handleClose();
  }
};

const handleNext = () => {
  if (!isValid.value || isLoading.value) return;
  
  if (formStep.value < 5) {
    formStep.value++;
  } else {
    startAnalysis();
  }
};

const startAnalysis = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  
  console.log('Submitting form:', JSON.parse(JSON.stringify(form)));

  try {
    const res: any = await fetchCreateProfile({
      name: form.name,
      gender: form.gender,
      birth_date: form.mode === 'lunar' ? form.lunarBirthday : form.birthday,
      birth_time: form.birthtime,
      birth_location: form.birthAddress,
      mode: form.mode
    });

    if (res.code !== 200) {
      throw new Error(res.msg || '创建用户失败')
    }
    
    // uni.hideLoading(); // Using button loading instead
    
    // Construct userInfo object to pass to home page
    const userInfo = {
      ...(res.data || {}),
      name: form.name,
      gender: form.gender,
      birth_date: form.birthday,
      birth_time: form.birthtime,
      birth_location: form.birthAddress,
      mode: form.mode
    };

    // Create session
    const sessionRes: any = await fetchCreateSession({
      profile_id: userInfo.id
    });


    uni.reLaunch({
      url: `/pages/home/index?userInfo=${encodeURIComponent(JSON.stringify(userInfo))}&sessionId=${sessionRes.data.session_id}&isNewProfile=true`
    });
    
  } catch (error) {
    // uni.hideLoading();
    console.error('Create profile error:', error);
    uni.showToast({ title: '创建失败，请重试', icon: 'none' });
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500)
  }
};
</script>

<style lang="scss" scoped>
/* Global Layout & Background */
.page-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fbfcff;
  overflow: hidden;
}

// .mesh-bg {
//   background-image: 
//     radial-gradient(at 0% 0%, rgba(224, 231, 255, 0.4) 0, transparent 40%),
//     radial-gradient(at 100% 100%, rgba(245, 232, 255, 0.4) 0, transparent 40%);
// }

.content-wrapper {
  flex: 1;
  height: 100%;
  width: 100%;
  padding: 32px 40px; /* px-10 pt-8 in HTML but footer needs padding too */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 48px; /* pt-12 */
  padding-bottom: 24px; /* pb-6 */
  padding-left: 16px; /* HTML had px-8 but wrapper has padding */
  padding-right: 16px;
}

.header-left, .header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-circle {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8; /* text-slate-400 */
}

.icon-back, .icon-close {
  font-size: 22px;
  line-height: 1;
}

.icon-close {
  font-size: 28px; /* Slightly larger for X */
  margin-top: -2px; /* Visual adjustment */
}

.header-placeholder {
  width: 40px;
  height: 40px;
}

.progress-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot {
  height: 6px;
  border-radius: 9999px;
  transition: all 0.5s;
  background-color: #e2e8f0; /* bg-slate-200 */
  width: 6px;

  &.active {
    width: 24px;
    background-color: #6366f1; /* bg-indigo-500 */
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
  }
}

.menu-circle {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-dot {
  width: 6px;
  height: 6px;
  background-color: #94a3b8; /* bg-slate-300 */
  border-radius: 9999px;
}

/* Step Content */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32px;
  box-sizing: border-box;
}

.step-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.step-fade-enter-active {
  animation: stepFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes stepFadeIn {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.title {
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  color: #1e293b; /* text-slate-800 */
  letter-spacing: -0.025em;
  display: block;
}

.subtitle {
  color: #94a3b8; /* text-slate-400 */
  margin-top: 16px; /* mt-4 */
  font-size: 16px; /* text-base */
  font-weight: 500;
  display: block;
}

.form-section {
  margin-top: 64px; /* mt-16 */
  display: flex;
  flex-direction: column;
  gap: 32px; /* space-y-8 */
}

/* Input Styles */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* mt-2 implied */
}

.input-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8; /* text-slate-300 */
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-left: 16px; /* ml-4 */
}

.clean-input {
  width: 100%;
  height: 64px; /* h-16 */
  padding: 0 24px; /* px-6 */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(99, 102, 241, 0.2);
  border-radius: 24px;
  font-size: 18px; /* text-lg */
  font-weight: 600; /* font-semibold */
  color: #334155; /* text-slate-700 */
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;

  &:focus {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
  }
}

.picker-full {
  width: 100%;
}

.picker-display {
  display: flex;
  align-items: center;
}

/* Privacy Tip */
.privacy-tip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.privacy-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background-color: #6366f1; /* bg-indigo-500 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-lock {
  height: 14px;
  width: 14px;
  color: #ffffff;
}

.privacy-text {
  font-size: 24rpx;
  line-height: 1.6;
  color: #94a3b8; /* text-slate-400 */
  font-weight: 500;
  flex: 1;
}

/* Gender Grid */
.gender-grid {
  margin-top: 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.gender-card {
  height: 176px; /* h-44 */
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transition: all 0.5s;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #ffffff;
  color: #94a3b8; /* text-slate-400 */

  &.active {
    background-color: #4f46e5; /* bg-indigo-600 */
    color: #ffffff;
    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.03); /* soft-shadow */
    transform: scale(1.05);
    border-color: transparent;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.gender-big-text {
  font-size: 36px; /* text-4xl */
  font-weight: 400;
}

.gender-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Footer */
.footer {
  padding: 32px 32px 64px 32px;
  box-sizing: border-box;
  position: fixed;
  bottom: 0;
  z-index: 1;
  width: 100%;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  width: 72px;
  height: 72px;
  border-radius: 26px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.95);
    background-color: #f8fafc;
  }
}

.icon-back {
  font-size: 24px;
  color: #1e293b;
}

.btn-primary {
  flex: 1;
  width: auto;
  height: 72px; /* h-18 */
  background-color: #4f46e5; /* bg-indigo-600 */
  color: #ffffff;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 10px 15px -3px rgba(199, 210, 254, 0.5); */
  transition: all 0.3s;
  border: none;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.97);
  }

  &.disabled {
    opacity: 0.5;
    background-color: #e0e7ff; /* lighter indigo */
    color: #a5b4fc;
  }
}

/* Info Card & Warning */
.info-card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 8px 24px;
  border: 1px solid #ffffff;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 16px;
  color: #64748b; /* text-slate-500 */
}

.info-value-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b; /* text-slate-800 */
}

.warning-box {
  background: rgba(254, 242, 242, 0.6); /* bg-red-50/60 */
  border: 1px solid rgba(254, 202, 202, 0.5); /* border-red-200 */
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ef4444; /* bg-red-500 */
  color: white;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text {
  font-size: 14px;
  color: #b91c1c; /* text-red-700 */
  line-height: 1.5;
  flex: 1;
}
</style>
