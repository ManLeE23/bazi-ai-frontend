<template>
  <div class="mbti-page">
    <!-- Ambient Background Blobs -->
    <div class="bg-blob bg-blob-primary"></div>
    <div class="bg-blob bg-blob-secondary"></div>
    <div class="bg-blob bg-blob-container"></div>
    
    <HeaderBar title="" :fixed="true" :placeholder="true" background-color="transparent" @clickLeft="handleBackToHome" />
    
    <div class="content-wrap">
      <!-- Hero Section -->
      <section class="hero-section">
        <h1 class="hero-title">探索人格光谱</h1>
        <p class="hero-subtitle">深入探索人格原型的复杂织锦。这十六条独特的人类认知与行为路径的数字化呈现。</p>
        
        <button class="ethereal-btn hero-action-btn" @click="startTest">
          <text class="btn-text">立即开启测试</text>
        </button>
      </section>

      <!-- Custom Segmented Control (Capsule Tabs) -->
      <view class="segmented-control-wrapper">
        <view class="segmented-control">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            class="segment-item" 
            :class="{ 'segment-active': activeTab === index }"
            @click="activeTab = index"
          >
            <text class="segment-text">{{ tab }}</text>
          </view>
        </view>
      </view>

      <!-- Tab Content -->
      <div class="tab-content">
        <transition name="fade" mode="out-in">
          
          <!-- 16 Personalities Section -->
          <section v-if="activeTab === 0" class="personalities-section-full">
            <div class="personalities-gradient-bg">
              <div class="personality-group" v-for="(group, gIndex) in personalityGroups" :key="gIndex">
                
                <div class="group-grid">
                  <div class="character-card" v-for="item in group.items" :key="item.id">
                    <div class="character-img-wrapper">
                      <image class="character-img-animate" :src="`/static/mbti/${item.id}.svg`" mode="aspectFit"></image>
                    </div>
                    <div class="character-info">
                      <div class="character-header">
                        <div class="character-tag">{{ item.id.toUpperCase() }}</div>
                        <div class="character-name">{{ item.name.split('-')[1] }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Theory Section -->
          <section v-else-if="activeTab === 1" class="theory-section">
            <div class="modern-card">
              <h3 class="card-title">四大核心维度</h3>
              <div class="card-body">
                <div class="dimensions-grid">
                  <div class="dim-card">
                    <div class="dim-icon-wrap"><text class="dim-en">E / I</text></div>
                    <text class="dim-label">能量来源</text>
                    <text class="dim-desc">外向 / 内向</text>
                  </div>
                  <div class="dim-card">
                    <div class="dim-icon-wrap"><text class="dim-en">S / N</text></div>
                    <text class="dim-label">认知方式</text>
                    <text class="dim-desc">感觉 / 直觉</text>
                  </div>
                  <div class="dim-card">
                    <div class="dim-icon-wrap"><text class="dim-en">T / F</text></div>
                    <text class="dim-label">判断方式</text>
                    <text class="dim-desc">思考 / 情感</text>
                  </div>
                  <div class="dim-card">
                    <div class="dim-icon-wrap"><text class="dim-en">J / P</text></div>
                    <text class="dim-label">生活态度</text>
                    <text class="dim-desc">判断 / 知觉</text>
                  </div>
                </div>
              </div>
            </div>

            <div class="modern-card">
              <h3 class="card-title">理论源头</h3>
              <div class="card-body">
                <p class="card-text">
                  MBTI 的理论源头是瑞士心理学家 <text class="text-highlight">卡尔·荣格（Carl Jung）</text> 的心理类型理论。他认为人的行为差异来自天生的心理偏好，在注意力方向、信息收集、决策方式上存在稳定差异。
                </p>
                <p class="card-text mt-16">
                  后来，美国的 <text class="text-highlight">凯瑟琳·布里格斯</text> 与女儿 <text class="text-highlight">伊莎贝尔·迈尔斯</text> 在此基础上，研发出可实际测量的问卷工具，即 MBTI。
                </p>
              </div>
            </div>
          </section>

          <!-- History Section -->
          <section v-else-if="activeTab === 2" class="history-section">
            <div class="timeline-container">
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">1920s</h4>
                    <p class="timeline-event">卡尔·荣格提出心理类型理论，为MBTI奠定理论基石。</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">1940s</h4>
                    <p class="timeline-event">迈尔斯母女开始设计第一版 MBTI 题目并进行初步测试。</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">1962年</h4>
                    <p class="timeline-event">MBTI 正式出版，开始进入教育与职场应用领域。</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">至今</h4>
                    <p class="timeline-event">全球每年数百万人使用，广泛用于自我认知、职业规划与团队沟通。</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Rules Section -->
          <section v-else-if="activeTab === 3" class="rules-section">
            <div class="rule-list">
              <div class="rule-item">
                <div class="rule-num">01</div>
                <div class="rule-content">
                  <h4 class="rule-title">没有对错与优劣</h4>
                  <p class="rule-desc">测试只反映你的自然偏好与倾向，并不是能力测试，所有性格都有其独特优势。</p>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-num">02</div>
                <div class="rule-content">
                  <h4 class="rule-title">凭第一直觉选择</h4>
                  <p class="rule-desc">不要过度思考或代入特定场景，MBTI 测的是你最放松状态下的本能偏好。</p>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-num">03</div>
                <div class="rule-content">
                  <h4 class="rule-title">人是场景化动物</h4>
                  <p class="rule-desc">你在独处、工作、压力下的表现可能不同，大多数人也处于中间倾向，这都是正常现象。</p>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-num">04</div>
                <div class="rule-content">
                  <h4 class="rule-title">仅供自我探索</h4>
                  <p class="rule-desc">测试结果仅供个人成长与参考，不用于专业心理诊断或人才选拔。</p>
                </div>
              </div>
            </div>
          </section>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';
import { useShare } from '@/hooks/useShare';
import { safeNavigateBack } from '@/utils/navigate';

const { shareConfig, loadShareConfig } = useShare({
  title: 'MBTI® 官方性格测试',
  path: '/pages/mbti/index',
});
loadShareConfig();

const startTest = () => {
  uni.navigateTo({
    url: '/pages/mbti/question'
  });
};

onShareAppMessage(() => {
  return {
    title: shareConfig.value.title,
    path: shareConfig.value.path,
    imageUrl: shareConfig.value.imageUrl,
  };
});

onShareTimeline(() => {
  const query = shareConfig.value.path.split('?')[1] || '';
  return {
    title: shareConfig.value.title,
    query: query,
    imageUrl: shareConfig.value.imageUrl,
  };
});

const handleBackToHome = () => {
  safeNavigateBack();
};

const activeTab = ref(0);
const tabs = ['16型人格', '理论背景', '发展历程', '测试须知'];

const personalityGroups = [
  {
    title: '理性主义',
    enTitle: 'Analysts',
    items: [
      { id: 'intj', name: 'INTJ-建筑师', desc: '军师气质' },
      { id: 'intp', name: 'INTP-逻辑学家', desc: '具有创造力' },
      { id: 'entj', name: 'ENTJ-指挥官', desc: '大胆, 富有想象' },
      { id: 'entp', name: 'ENTP-辩论家', desc: '聪明好奇的思想' }
    ]
  },
  {
    title: '理想主义',
    enTitle: 'Diplomats',
    items: [
      { id: 'infj', name: 'INFJ-提倡者', desc: '精神导师气质' },
      { id: 'infp', name: 'INFP-调停者', desc: '幻想家气质' },
      { id: 'enfj', name: 'ENFJ-主人公', desc: '万人迷气质' },
      { id: 'enfp', name: 'ENFP-竞选者', desc: '精灵气质' }
    ]
  },
  {
    title: '传统主义',
    enTitle: 'Sentinels',
    items: [
      { id: 'istj', name: 'ISTJ-物流师', desc: '精算师气质' },
      { id: 'isfj', name: 'ISFJ-守卫者', desc: '守卫者气质' },
      { id: 'estj', name: 'ESTJ-总经理', desc: '总经理气质' },
      { id: 'esfj', name: 'ESFJ-执政者', desc: '人间烟火气' }
    ]
  },
  {
    title: '实用主义',
    enTitle: 'Explorers',
    items: [
      { id: 'istp', name: 'ISTP-鉴赏家', desc: '专家气质' },
      { id: 'isfp', name: 'ISFP-探险家', desc: '浪漫气质' },
      { id: 'estp', name: 'ESTP-企业家', desc: '绅士气质' },
      { id: 'esfp', name: 'ESFP-表演者', desc: '乐天派气质' }
    ]
  }
];
</script>

<style scoped>
/* Typography & Core Variables */
.mbti-page {
  --primary: #632ce5;
  --primary-container: #7c4dff;
  --secondary-container: #6df5e1;
  --surface: #f8f9ff;
  --surface-container-low: rgba(255, 255, 255, 0.4);
  --surface-container: rgba(255, 255, 255, 0.6);
  --surface-container-lowest: #ffffff;
  --on-surface: #191c20;
  --outline-variant: #cac3d8;
  --ghost-border: rgba(202, 195, 216, 0.2);
  --ambient-shadow: 0 40rpx 80rpx rgba(124, 77, 255, 0.06);
  
  min-height: 100vh;
  background-color: var(--surface);
  position: relative;
  overflow: hidden;
  padding-bottom: 120rpx;
  font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--on-surface);
  box-sizing: border-box;
}

/* Headings Font Override */
.hero-title, .group-title, .card-title, .rule-num, .dim-en, .timeline-year {
  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  letter-spacing: -0.02em;
}

/* Ambient Background Blobs (Mobile Optimized) */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  z-index: 0;
  pointer-events: none;
}
.bg-blob-primary {
  top: -5%; left: -30%; width: 150vw; height: 150vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.15) 0%, rgba(124, 77, 255, 0) 60%);
}
.bg-blob-secondary {
  top: 30%; right: -40%; width: 130vw; height: 130vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.12) 0%, rgba(124, 77, 255, 0) 60%);
}
.bg-blob-container {
  bottom: -5%; left: -30%; width: 140vw; height: 140vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.1) 0%, rgba(124, 77, 255, 0) 60%);
}

.content-wrap {
  position: relative;
  z-index: 1;
  padding: 0 40rpx;
}

/* Hero Section */
.hero-section {
  padding: 60rpx 0 80rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Asymmetrical layout - left aligned */
  text-align: left;
}

/* Abstract MBTI Icon (Ethereal Palette) */
.mbti-abstract-icon {
  width: 100rpx;
  height: 100rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 48rpx;
  transform: rotate(15deg); /* Slight intentional asymmetry */
}
.grid-block {
  border-radius: 24rpx;
  box-shadow: var(--ambient-shadow);
}
.block-1 { background: linear-gradient(135deg, var(--primary), var(--primary-container)); border-radius: 32rpx 16rpx 16rpx 16rpx; }
.block-2 { background: var(--secondary-container); }
.block-3 { background: var(--surface-container); }
.block-4 { background: var(--surface-container-lowest); border: 1px solid var(--ghost-border); }

.hero-title {
  font-size: 80rpx;
  font-weight: 800;
  color: var(--on-surface);
  margin: 0 0 24rpx;
  line-height: 1.25;
  letter-spacing: -0.02em;
}
.hero-subtitle {
  font-size: 32rpx;
  font-weight: 500;
  color: #494455;
  margin: 0 0 16rpx;
  line-height: 1.625;
}

/* Segmented Control */
.segmented-control-wrapper {
  margin-bottom: 64rpx;
}
.segmented-control {
  display: flex;
  background: rgba(124, 77, 255, 0.05);
  box-shadow: inset 0px 0px 20rpx 1px rgba(124, 77, 255, 0.05);
  border: 1px solid rgba(124, 77, 255, 0.1);
  border-radius: 100rpx;
  padding: 8rpx;
}
.segment-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 100rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.segment-active {
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
}
.segment-text {
  font-size: 28rpx;
  color: #494455;
  transition: color 0.4s;
}
.segment-active .segment-text {
  color: #191C20;
  font-weight: 700;
}

/* 16 Personalities Section - No borders, just tonal shifts */
.personalities-section-full {
  display: flex;
  flex-direction: column;
  padding-bottom: 60rpx;
}

.personalities-gradient-bg {
  background: transparent;
}

.personality-group {
  margin-bottom: 120rpx;
}
.personality-group:last-child {
  margin-bottom: 0;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 32px;
  padding: 40rpx 20rpx;
  border: 1px solid rgba(202, 195, 216, 0.4);
}

.character-img-wrapper {
  position: relative;
  width: 200rpx;
  height: 240rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.character-img-animate {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-items: center;
}

.character-tag {
  color: var(--primary-container);
  font-weight: 700;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 36rpx;
  font-size: 12px;
}

.character-name {
  font-size: 32rpx;
  color: #191c20;
  line-height: 1.2;
}

.character-desc {
  font-size: 26rpx;
  color: #494455;
  line-height: 1.5;
}

.character-action-row {
  margin-top: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
}

.action-text-inline {
  font-size: 28rpx;
  font-weight: 800;
  color: #7C4DFF;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.character-card:hover .action-icon,
.character-card:active .action-icon {
  transform: translateX(8rpx);
}

/* Modern Card (Editorial Style) */
.modern-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border-radius: 40px;
  padding: 56rpx 48rpx;
  margin-bottom: 40rpx;
  border: 1px solid rgba(202, 195, 216, 0.2);
  box-sizing: border-box;
}
.card-title {
  font-size: 44rpx;
  font-weight: 800;
  color: var(--on-surface);
  margin: 0;
}
.card-body {
  margin-top: 64rpx; /* 2rem spacing-8 per rule */
}
.card-text {
  font-size: 30rpx;
  color: #494455;
  line-height: 1.8;
  margin: 0;
}
.mt-16 { margin-top: 32rpx; }
.text-highlight { font-weight: 800; color: var(--primary); }

/* Dimensions Grid */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}
.dim-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border-radius: 40px;
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s;
  box-sizing: border-box;
  border: 1px solid rgba(202, 195, 216, 0.2);
}
.dim-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(202, 195, 216, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  color: var(--primary);
}
.dim-en { font-size: 36rpx; font-weight: 800; }
.dim-label { font-size: 28rpx; font-weight: 800; color: var(--on-surface); margin-bottom: 8rpx; }
.dim-desc { font-size: 24rpx; color: #494455; }

/* Timeline */
.timeline-container {
  padding: 40rpx 20rpx;
}
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 56rpx;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 14rpx;
  top: 16rpx;
  bottom: 0;
  width: 4rpx;
  background: rgba(124, 77, 255, 0.2); /* Make line visible on light bg */
}
.timeline-item {
  position: relative;
  padding-left: 64rpx;
}
.timeline-dot {
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #ffffff; /* solid white inner */
  border: 8rpx solid #7c4dff;
  box-sizing: border-box;
  box-shadow: 0 4rpx 8rpx rgba(124, 77, 255, 0.2); /* Add shadow for depth */
}
.timeline-year { font-size: 36rpx; font-weight: 800; color: #632ce5; margin: 0 0 12rpx; } /* Slightly smaller and deeper purple */
.timeline-event { font-size: 28rpx; color: #494455; line-height: 1.6; margin: 0; }

/* Rules */
.rule-list { display: flex; flex-direction: column; gap: 40rpx; }
.rule-item {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border-radius: 40px;
  padding: 48rpx;
  display: flex;
  align-items: flex-start;
  gap: 40rpx;
  border: 1px solid rgba(202, 195, 216, 0.2);
  box-sizing: border-box;
}
.rule-num {
  font-size: 56rpx;
  font-weight: 900;
  color: var(--primary-container);
  line-height: 1;
}
.rule-content { flex: 1; }
.rule-title { font-size: 32rpx; font-weight: 800; color: var(--on-surface); margin: 0 0 16rpx; }
.rule-desc { font-size: 28rpx; color: #494455; line-height: 1.6; margin: 0; }

.hero-action-btn {
  margin-top: 48rpx;
  width: 100%;
}

/* Ethereal Button */
.ethereal-btn {
  height: 112rpx;
  background: #7C4DFF;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 40rpx 0px rgba(124, 77, 255, 0.1), 0px 0px 20rpx 0px rgba(124, 77, 255, 0.3);
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}
.ethereal-btn:active {
  transform: scale(0.98);
}
.btn-text {
  font-size: 32rpx;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 2rpx;
}

/* Header Overrides */
:deep(.uni-navbar__header) {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(24px) !important;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05) !important;
}

:deep(.uni-navbar__header-container-inner) {
  color: #191c20 !important;
}

:deep(.uni-icons.uniui-back) {
  display: none !important;
}

:deep(.uni-navbar__header-btns-left) {
  position: relative;
}

:deep(.uni-navbar__header-btns-left)::before {
  content: '';
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 64rpx;
  height: 64rpx;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(124, 77, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.uni-navbar__header-btns-left)::after {
  content: '';
  position: absolute;
  left: 36rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 24rpx;
  background-image: linear-gradient(to bottom, #191c20 20%, transparent 20%, transparent 40%, #191c20 40%, #191c20 60%, transparent 60%, transparent 80%, #191c20 80%, #191c20 100%);
  z-index: 1;
  pointer-events: none;
}
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20rpx);
}
</style>
