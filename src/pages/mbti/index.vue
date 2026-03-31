<template>
  <div class="mbti-page">
    <!-- Ambient Background Blobs -->
    <div class="bg-blob bg-blob-purple"></div>
    <div class="bg-blob bg-blob-green"></div>
    <div class="bg-blob bg-blob-blue"></div>
    
    <HeaderBar title="" :fixed="true" :placeholder="true" background-color="transparent" />
    
    <div class="content-wrap">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="mbti-abstract-icon">
          <div class="grid-block block-purple"></div>
          <div class="grid-block block-green"></div>
          <div class="grid-block block-yellow"></div>
          <div class="grid-block block-blue"></div>
        </div>
        
        <h1 class="hero-title">MBTI® 人格测试</h1>
        <p class="hero-subtitle">探索真实的自己，解锁内在潜能</p>
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
                <div class="group-header">
                  <h3 class="group-title" :class="`text-${group.color}`">{{ group.title }}</h3>
                  <div class="group-en-title" :class="`text-${group.color}`">{{ group.enTitle }}</div>
                </div>
                
                <div class="group-grid">
                  <div class="character-card" v-for="item in group.items" :key="item.id">
                    <div class="character-img-wrapper">
                      <!-- Use image for static SVG, but we add a hover effect to the wrapper -->
                      <image class="character-img-animate" :src="`/static/mbti/${item.id}.svg`" mode="aspectFit"></image>
                      <div class="character-shadow"></div>
                    </div>
                    <div class="character-info">
                      <div class="character-name" :class="`text-${group.color}`">{{ item.name }}</div>
                      <div class="character-desc">{{ item.desc }}</div>
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
              <div class="dimensions-grid">
                <div class="dim-card dim-purple">
                  <div class="dim-icon-wrap"><text class="dim-en">E / I</text></div>
                  <text class="dim-label">能量来源</text>
                  <text class="dim-desc">外向 / 内向</text>
                </div>
                <div class="dim-card dim-green">
                  <div class="dim-icon-wrap"><text class="dim-en">S / N</text></div>
                  <text class="dim-label">认知方式</text>
                  <text class="dim-desc">感觉 / 直觉</text>
                </div>
                <div class="dim-card dim-blue">
                  <div class="dim-icon-wrap"><text class="dim-en">T / F</text></div>
                  <text class="dim-label">判断方式</text>
                  <text class="dim-desc">思考 / 情感</text>
                </div>
                <div class="dim-card dim-yellow">
                  <div class="dim-icon-wrap"><text class="dim-en">J / P</text></div>
                  <text class="dim-label">生活态度</text>
                  <text class="dim-desc">判断 / 知觉</text>
                </div>
              </div>
            </div>

            <div class="modern-card">
              <h3 class="card-title">理论源头</h3>
              <p class="card-text">
                MBTI 的理论源头是瑞士心理学家 <text class="text-highlight">卡尔·荣格（Carl Jung）</text> 的心理类型理论。他认为人的行为差异来自天生的心理偏好，在注意力方向、信息收集、决策方式上存在稳定差异。
              </p>
              <p class="card-text mt-16">
                后来，美国的 <text class="text-highlight">凯瑟琳·布里格斯</text> 与女儿 <text class="text-highlight">伊莎贝尔·迈尔斯</text> 在此基础上，研发出可实际测量的问卷工具，即 MBTI。
              </p>
            </div>
          </section>

          <!-- History Section -->
          <section v-else-if="activeTab === 2" class="history-section">
            <div class="modern-card">
              <h3 class="card-title">发展历程</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-dot dot-purple"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">1920s</h4>
                    <p class="timeline-event">卡尔·荣格提出心理类型理论，为MBTI奠定理论基石。</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot dot-green"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">1940s</h4>
                    <p class="timeline-event">迈尔斯母女开始设计第一版 MBTI 题目并进行初步测试。</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot dot-blue"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-year">1962年</h4>
                    <p class="timeline-event">MBTI 正式出版，开始进入教育与职场应用领域。</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot dot-yellow"></div>
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
                <div class="rule-num text-purple">01</div>
                <div class="rule-content">
                  <h4 class="rule-title">没有对错与优劣</h4>
                  <p class="rule-desc">测试只反映你的自然偏好与倾向，并不是能力测试，所有性格都有其独特优势。</p>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-num text-green">02</div>
                <div class="rule-content">
                  <h4 class="rule-title">凭第一直觉选择</h4>
                  <p class="rule-desc">不要过度思考或代入特定场景，MBTI 测的是你最放松状态下的本能偏好。</p>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-num text-blue">03</div>
                <div class="rule-content">
                  <h4 class="rule-title">人是场景化动物</h4>
                  <p class="rule-desc">你在独处、工作、压力下的表现可能不同，大多数人也处于中间倾向，这都是正常现象。</p>
                </div>
              </div>
              <div class="rule-item">
                <div class="rule-num text-yellow">04</div>
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

    <!-- Sticky Bottom Bar -->
    <div class="bottom-action-bar">
      <BaziButton 
        type="secondary"
        @click="startTest"
      >
        立即开启测试
      </BaziButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';
import BaziButton from '@/components/BaziButton.vue';
import { useShare } from '@/hooks/useShare';

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

const activeTab = ref(0);
const tabs = ['16型人格', '理论背景', '发展历程', '测试须知'];

const personalityGroups = [
  {
    title: '理性主义',
    enTitle: 'Analysts',
    color: 'purple',
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
    color: 'green',
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
    color: 'blue',
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
    color: 'yellow',
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
.mbti-page {
  min-height: 100vh;
  background-color: #F8FAFC;
  position: relative;
  overflow: hidden;
  padding-bottom: 240rpx; /* Space for bottom bar */
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  box-sizing: border-box;
}

/* Ambient Background Blobs */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
}
.bg-blob-purple {
  top: -10%; left: -20%; width: 600rpx; height: 600rpx; background: #E9D5FF;
}
.bg-blob-green {
  top: 30%; right: -20%; width: 500rpx; height: 500rpx; background: #D1FAE5;
}
.bg-blob-blue {
  bottom: 10%; left: 10%; width: 550rpx; height: 550rpx; background: #DBEAFE;
}

.content-wrap {
  position: relative;
  z-index: 1;
  padding: 0 40rpx;
}

/* Hero Section */
.hero-section {
  padding: 40rpx 0 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Abstract MBTI Icon (Purple/Blue Theme) */
.mbti-abstract-icon {
  width: 120rpx;
  height: 120rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12rpx;
  margin-bottom: 48rpx;
  transform: rotate(45deg);
}
.grid-block {
  border-radius: 20rpx;
  box-shadow: inset 0 0 20rpx rgba(255, 255, 255, 0.4), 0 8rpx 16rpx rgba(0, 0, 0, 0.05);
}
.block-purple { background: linear-gradient(135deg, #C084FC, #9333EA); }
.block-green  { background: linear-gradient(135deg, #34D399, #059669); }
.block-yellow { background: linear-gradient(135deg, #FBBF24, #D97706); }
.block-blue   { background: linear-gradient(135deg, #60A5FA, #2563EB); }

.hero-title {
  font-size: 60rpx;
  font-weight: 900;
  color: #0F172A;
  margin: 0 0 16rpx;
  letter-spacing: -1rpx;
}
.hero-subtitle {
  font-size: 30rpx;
  font-weight: 600;
  color: #475569;
  margin: 0 0 16rpx;
}

/* Segmented Control */
.segmented-control-wrapper {
  margin-bottom: 40rpx;
}
.segmented-control {
  display: flex;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 100rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
}
.segment-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 100rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.segment-active {
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}
.segment-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #64748B;
  transition: color 0.3s;
}
.segment-active .segment-text {
  color: #0F172A;
  font-weight: 700;
}

/* 16 Personalities Section - Smooth Gradient Background */
.personalities-section-full {
  display: flex;
  flex-direction: column;
  margin: 0 -40rpx; /* Break out of content-wrap padding */
  position: relative;
  z-index: 2;
  padding-bottom: 60rpx;
}

.personalities-gradient-bg {
  /* Smooth transition between the 4 colors */
  background: linear-gradient(
    to bottom,
    #F3E8FF 0%,    /* Purple */
    #F3E8FF 15%,
    #D1FAE5 35%,   /* Green */
    #D1FAE5 45%,
    #DBEAFE 65%,   /* Blue */
    #DBEAFE 75%,
    #FEF3C7 95%,   /* Yellow */
    #FEF3C7 100%
  );
  padding: 60rpx 40rpx 100rpx;
  border-radius: 40rpx;
  margin: 0 20rpx; /* Slight inset for a rounded card look, or 0 for full width */
}

.personality-group {
  margin-bottom: 100rpx;
}
.personality-group:last-child {
  margin-bottom: 0;
}

.group-header {
  text-align: center;
  margin-bottom: 60rpx;
  position: relative;
}

.group-title {
  font-size: 48rpx;
  font-weight: 900;
  margin: 0 0 8rpx 0;
  letter-spacing: 4rpx;
}

.group-en-title {
  font-size: 28rpx;
  font-weight: 700;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 8rpx;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60rpx 20rpx;
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border-radius: 32rpx;
  padding: 32rpx 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.character-card:hover, .character-card:active {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-8rpx);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
}

.character-img-wrapper {
  position: relative;
  width: 180rpx;
  height: 220rpx;
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
  transform-origin: bottom center;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.character-shadow {
  position: absolute;
  bottom: -6rpx;
  width: 100rpx;
  height: 16rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  filter: blur(4rpx);
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Character Animation on Hover/Active */
.character-card:active .character-img-animate,
.character-card:hover .character-img-animate {
  /* Using a fun wobble animation to simulate character movement */
  animation: character-jump-wobble 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate;
  transform: translateY(-24rpx) scale(1.08);
}

.character-card:active .character-shadow,
.character-card:hover .character-shadow {
  transform: scale(0.5);
  opacity: 0.4;
}

@keyframes character-jump-wobble {
  0% { transform: translateY(-24rpx) scale(1.08) rotate(0deg); }
  33% { transform: translateY(-24rpx) scale(1.08) rotate(-4deg); }
  66% { transform: translateY(-24rpx) scale(1.08) rotate(4deg); }
  100% { transform: translateY(-24rpx) scale(1.08) rotate(0deg); }
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.character-name {
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.2;
}

.character-desc {
  font-size: 22rpx;
  color: #64748B;
  line-height: 1.4;
  padding: 0 16rpx;
}

/* Modern Card */
.modern-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 40rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}
.card-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 40rpx;
  display: flex;
  align-items: center;
}
.card-title::before {
  content: '';
  display: block;
  width: 8rpx;
  height: 32rpx;
  background: #0F172A;
  border-radius: 8rpx;
  margin-right: 16rpx;
}
.card-text {
  font-size: 30rpx;
  color: #475569;
  line-height: 1.7;
  margin: 0;
}
.mt-16 { margin-top: 32rpx; }
.text-highlight { font-weight: 700; color: #0F172A; }

/* Dimensions Grid */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}
.dim-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
  border: 2px solid transparent;
  transition: transform 0.2s;
  box-sizing: border-box;
}
.dim-card:active {
  transform: scale(0.96);
}
.dim-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}
.dim-en { font-size: 32rpx; font-weight: 900; }
.dim-label { font-size: 28rpx; font-weight: 700; color: #1E293B; margin-bottom: 8rpx; }
.dim-desc { font-size: 24rpx; color: #64748B; }

/* Shared Colors */
.text-purple { color: #A855F7; }
.text-green { color: #10B981; }
.text-blue { color: #3B82F6; }
.text-yellow { color: #D97706; }

.bg-purple { background: linear-gradient(to top, #A855F7, transparent); }
.bg-green { background: linear-gradient(to top, #10B981, transparent); }
.bg-blue { background: linear-gradient(to top, #3B82F6, transparent); }
.bg-yellow { background: linear-gradient(to top, #D97706, transparent); }

/* Dim Colors */
.dim-purple .dim-icon-wrap { background: rgba(168, 85, 247, 0.1); color: #A855F7; }
.dim-purple { border-color: rgba(168, 85, 247, 0.05); }
.dim-green .dim-icon-wrap { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.dim-green { border-color: rgba(16, 185, 129, 0.05); }
.dim-blue .dim-icon-wrap { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.dim-blue { border-color: rgba(59, 130, 246, 0.05); }
.dim-yellow .dim-icon-wrap { background: rgba(217, 119, 6, 0.1); color: #D97706; }
.dim-yellow { border-color: rgba(217, 119, 6, 0.05); }

/* Timeline */
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 12rpx;
  top: 16rpx;
  bottom: 0;
  width: 4rpx;
  background: rgba(15, 23, 42, 0.05);
}
.timeline-item {
  position: relative;
  padding-left: 48rpx;
}
.timeline-dot {
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  box-shadow: 0 0 0 2rpx rgba(0,0,0,0.05);
  box-sizing: border-box;
}
.dot-purple { background: #A855F7; }
.dot-green { background: #10B981; }
.dot-blue { background: #3B82F6; }
.dot-yellow { background: #D97706; }

.timeline-year { font-size: 32rpx; font-weight: 800; color: #0F172A; margin: 0 0 8rpx; }
.timeline-event { font-size: 28rpx; color: #475569; line-height: 1.6; margin: 0; }

/* Rules */
.rule-list { display: flex; flex-direction: column; gap: 32rpx; }
.rule-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 32rpx;
  padding: 40rpx;
  display: flex;
  align-items: flex-start;
  gap: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}
.rule-num {
  font-size: 48rpx;
  font-weight: 900;
  font-style: italic;
  opacity: 0.8;
  line-height: 1;
}
.rule-content { flex: 1; }
.rule-title { font-size: 32rpx; font-weight: 800; color: #0F172A; margin: 0 0 12rpx; }
.rule-desc { font-size: 28rpx; color: #64748B; line-height: 1.6; margin: 0; }

/* Bottom Action Bar */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx 40rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  background: rgba(248, 250, 252, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  z-index: 100;
}
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10rpx);
}
</style>
