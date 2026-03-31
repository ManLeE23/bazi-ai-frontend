<template>
  <view class="report-page">
    <view class="bg-fixed">
      <view class="bg-circle bg-left"></view>
      <view class="bg-circle bg-right"></view>
    </view>

    <HeaderBar
      title="人格类型报告"
      :fixed="true"
      :placeholder="true"
      background-color="transparent"
    >
    </HeaderBar>

    <view class="main-wrap">
      <!-- 第1屏：核心人格与 IP -->
      <view class="section" id="s1">
        <view class="long-text-card s1-card">
          <view class="s1-header">
            <view class="s1-ip-wrap" v-if="archetypeImage">
              <image :src="archetypeImage" mode="aspectFit" class="s1-ip-img"></image>
            </view>
            <view class="s1-info">
              <view class="s1-badge">{{ archetypeTitle }}</view>
              <text class="s1-code">{{ typeCode }}</text>
              <text class="s1-subinfo">清晰度：{{ clarityOverall || '—' }} | 稀有度：{{ rarityPopulation || '—' }}</text>
            </view>
          </view>

          <view class="s1-divider"></view>

          <!-- 核心维度得分 -->
          <view class="s1-dim-section">
            <view class="s1-dim-title">
              <view class="s1-dim-mark"></view>
              <text>核心维度得分</text>
            </view>
            
            <view class="dim-wrap">
              <view v-for="(d, i) in dimensionsList" :key="i" class="dim-block">
                <view class="dim-head">
                  <text class="dim-label">
                    <view
                      class="dim-dot"
                      :style="{ backgroundColor: getDimensionColor(d.dimension) }"
                    ></view>
                    {{ dimLabelFromCode(d.dimension) }}
                  </text>
                  <view class="dim-codes">
                    <text
                      class="dim-code"
                      :class="isLeftDominant(d) ? 'code-active' : 'code-muted'"
                      >{{ leftCode(d) }}</text
                    >
                    <text
                      class="dim-code"
                      :class="!isLeftDominant(d) ? 'code-active' : 'code-muted'"
                      >{{ rightCode(d) }}</text
                    >
                  </view>
                </view>
                <view class="dim-bar">
                  <view class="dim-fill" :style="barStyle(d)"></view>
                  <view class="dim-text-row">
                    <text
                      class="dim-side"
                      :class="isLeftDominant(d) ? 'side-white' : 'side-muted'"
                      >{{ leftName(d) }} {{ leftPercent(d) }}%</text
                    >
                    <text
                      class="dim-side"
                      :class="!isLeftDominant(d) ? 'side-white' : 'side-muted'"
                      >{{ rightPercent(d) }}% {{ rightName(d) }}</text
                    >
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 关键词与代表人物 (保留原来的设计，如果在 v2 中没有特别强调，可以放在维度下面或折叠) -->
      <view class="examples-grid" v-if="archetypeExamples.length >= 4">
        <view class="example-item" v-for="(ex, i) in archetypeExamples" :key="i">
          <image :src="ex.image" mode="aspectFill" class="example-img"></image>
          <text class="example-name">{{ ex.name }}</text>
        </view>
      </view>

      <view class="section">
        <view class="watermark-title-container">
          <text class="watermark-text">CONTEXT MAP</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>情境图谱</text>
          </view>
        </view>
        <view class="long-text-card">
          <template v-for="(sec, idx) in getModuleSections('context_map')" :key="sec.id || idx">
            <view class="sub-section-container">
              <text class="sub-section-title">{{ sec.title }}</text>
              <text class="prose-text">{{ sec.body }}</text>
            </view>
            <view v-if="idx < getModuleSections('context_map').length - 1" class="s1-divider sub-section-divider"></view>
          </template>
        </view>
      </view>

      <view class="section">
        <view class="watermark-title-container">
          <text class="watermark-text">DEEP INSIGHT</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>人格深度解读</text>
          </view>
        </view>
        <view class="long-text-card">
          <template v-for="(sec, idx) in getModuleSections('core_overview')" :key="sec.id || idx">
            <view class="sub-section-container">
              <!-- <text class="sub-section-title">{{ sec.title }}</text> -->
              <text class="prose-text">{{ sec.body }}</text>
            </view>
            <view v-if="idx < getModuleSections('core_overview').length - 1" class="s1-divider sub-section-divider"></view>
          </template>
        </view>
      </view>

      <view class="section">
        <view class="watermark-title-container">
          <text class="watermark-text">SELF AWARENESS</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>自我认知</text>
          </view>
        </view>
        <template v-for="(sec, i) in selfInsightSections" :key="i">
          <view class="long-text-card" :style="{ 
            marginBottom: i < selfInsightSections.length - 1 ? '32rpx' : '0',
            backgroundColor: i % 4 === 0 ? 'rgba(238, 242, 255, 0.5)' : 
                             i % 4 === 1 ? 'rgba(255, 241, 242, 0.5)' :
                             i % 4 === 2 ? 'rgba(236, 253, 245, 0.5)' :
                             'rgba(255, 251, 235, 0.5)'
          }">
            <text class="sub-section-title" :style="{ 
              color: i % 4 === 0 ? '#312e81' : 
                     i % 4 === 1 ? '#881337' : 
                     i % 4 === 2 ? '#064e3b' : 
                     '#78350f' 
            }">{{ i + 1 }}. {{ sec.title }}</text>
            <text class="prose-text" style="margin-top: 12rpx;">{{ sec.body }}</text>
          </view>
        </template>
      </view>

      <view class="section">
        <view class="watermark-title-container">
          <text class="watermark-text">STRENGTHS</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>优势与成长</text>
          </view>
        </view>
        <view class="advantage-card">
          <view class="floating-badge">{{ typeCode }} 深度解析</view>
          <view class="flex items-center gap-2 mb-6">
            <text class="text-xl font-black" style="color: #ffffff;">核心优势</text>
          </view>
          <view class="space-y-4">
            <view v-for="(t, i) in strengthsStatic" :key="i" class="flex items-start gap-3">
              <view class="w-1_5 h-1_5 bg-white rounded-full mt-2 shrink-0"></view>
              <text class="text-sm font-medium leading-relaxed" style="color: #ffffff;">
                <text v-if="splitText(t)[0]" class="text-indigo-100 font-bold">{{ splitText(t)[0] }}</text>
                <text>{{ splitText(t)[1] }}</text>
              </text>
            </view>
          </view>
        </view>
        <view class="blindspot-card">
          <view class="flex items-center gap-2 mb-6">
            <text class="text-xl font-black text-rose-500">潜在盲点</text>
          </view>
          <view class="space-y-4">
            <view v-for="(t, i) in weaknessesStatic" :key="i" class="flex items-center gap-3">
              <view class="w-1_5 h-1_5 bg-rose-400 rounded-full mt-2 shrink-0"></view>
              <text class="text-sm font-medium text-gray-600 leading-relaxed">
                <text v-if="splitText(t)[0]" class="text-gray-800 font-bold">{{ splitText(t)[0] }}</text>
                <text>{{ splitText(t)[1] }}</text>
              </text>
            </view>
          </view>
        </view>

        <!-- AI 优势与成长建议 -->
        <view v-if="strengthsFocusAi.length > 0 || growthAi.length > 0" class="long-text-card ai-growth-card">
          <view v-if="strengthsFocusAi.length > 0" class="ai-growth-section" :class="{ 'has-border': growthAi.length > 0 }">
            <text class="ai-growth-title" style="color: #312e81;">发挥优势的建议</text>
            <view class="ai-growth-list">
              <view v-for="(t, i) in strengthsFocusAi" :key="'sf_'+i" class="ai-growth-item">
                <text class="ai-growth-dot" style="color: #818cf8;">◆</text>
                <text class="prose-text ai-growth-text">{{ t }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="growthAi.length > 0" class="ai-growth-section">
            <text class="ai-growth-title" style="color: #881337;">跨越盲点的成长指南</text>
            <view class="ai-growth-list">
              <view v-for="(t, i) in growthAi" :key="'g_'+i" class="ai-growth-item">
                <text class="ai-growth-dot" style="color: #fb7185;">◆</text>
                <text class="prose-text ai-growth-text">{{ t }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section" v-if="getModule('career')">
        <view class="watermark-title-container">
          <text class="watermark-text">CAREER PATH</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>职业探索与规划</text>
          </view>
        </view>
        <view class="long-text-card" style="position: relative;">
          <!-- 1. 工作中的你 -->
          <view class="mb-6">
            <text class="text-base font-black text-gray-800 mb-3 block">工作中的你</text>
            <text class="prose-text">{{ getModuleSectionBody('career', 'career_work_style') }}</text>
          </view>
          
          <view class="h-px bg-gray-100 w-full mb-6"></view>
          
          <!-- 2. 团队与领导 -->
          <view class="mb-6">
            <text class="text-base font-black text-gray-800 mb-4 block">团队角色与领导力</text>
            <view class="grid grid-cols-1 gap-4">
              <view>
                <view class="font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <text class="bg-gray-100 text-gray-600 px-2 py-0_5 rounded text-xs">协作</text>
                  <text>团队成员角色</text>
                </view>
                <text class="prose-text">{{ getModuleSectionBody('career', 'career_team_role') }}</text>
              </view>
              <view>
                <view class="font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <text class="bg-gray-100 text-gray-600 px-2 py-0_5 rounded text-xs">管理</text>
                  <text>领导风格</text>
                </view>
                <text class="prose-text">{{ getModuleSectionBody('career', 'career_leadership') }}</text>
              </view>
            </view>
          </view>
          
          <view class="h-px bg-gray-100 w-full mb-6"></view>
          
          <!-- 3. 环境匹配 -->
          <view class="mb-6">
            <text class="text-base font-black text-gray-800 mb-4 block">工作环境鉴别</text>
            <view class="grid grid-cols-1 gap-4">
              <view class="bg-emerald-50 rounded-2xl p-4">
                <text class="font-bold text-emerald-700 mb-2 block">✨ 适合的工作环境</text>
                <text class="text-sm text-emerald-800 leading-relaxed">{{ getModuleSectionBody('career', 'career_fit_env') }}</text>
              </view>
              <view class="bg-rose-50 rounded-2xl p-4">
                <text class="font-bold text-rose-700 mb-2 block">不适合的工作环境</text>
                <text class="text-sm text-rose-800 leading-relaxed">{{ getModuleSectionBody('career', 'career_unfit_env') }}</text>
              </view>
            </view>
          </view>
          
          <!-- 4. 职业建议 -->
          <view>
            <text class="text-base font-black text-gray-800 mb-4 block">职业建议</text>
            <view class="space-y-4 flex flex-col gap-4">
              <view class="p-4 border border-gray-100 rounded-xl" v-if="getModuleSectionBody('career', 'career_recommend_jobs')">
                <text class="text-sm font-bold text-indigo-600 mb-1 block">职业推荐 (Top 3)</text>
                <text class="text-sm text-gray-600 leading-relaxed">{{ getModuleSectionBody('career', 'career_recommend_jobs').replace(/<br>/g, '\n') }}</text>
              </view>
              <view class="p-4 border border-gray-100 rounded-xl" v-if="getModuleSectionBody('career', 'career_avoid_jobs')">
                <text class="text-sm font-bold text-rose-600 mb-1 block">职业避雷</text>
                <text class="text-sm text-gray-600 leading-relaxed">{{ getModuleSectionBody('career', 'career_avoid_jobs').replace(/<br>/g, '\n') }}</text>
              </view>
              <view class="p-4 border border-gray-100 rounded-xl" v-if="getModuleSectionBody('career', 'career_development_tips')">
                <text class="text-sm font-bold text-gray-800 mb-1 block">发展建议</text>
                <text class="text-sm text-gray-600 leading-relaxed">{{ getModuleSectionBody('career', 'career_development_tips') }}</text>
              </view>
            </view>
          </view>

          <view v-if="maskNeeded('career') && !getModule('career')?.unlocked" class="module-mask">
            <view class="unlock-icon module-unlock-icon">
              <u-icon name="lock-closed" color="#6366f1" size="28"></u-icon>
            </view>
            <text class="module-title">解锁职业探索与规划</text>
            <view class="unlock-btn module-unlock-btn" @click="handleModuleUnlock(getModule('career')!)" style="width: 200rpx; height: 80rpx; font-size: 28rpx;">
              <text class="unlock-btn-text">立即解锁</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section" v-if="getModule('love')">
        <view class="watermark-title-container">
          <text class="watermark-text">ROMANCE & LOVE</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>恋爱与亲密关系</text>
          </view>
        </view>
        <view class="long-text-card" style="position: relative; border-top: 8rpx solid #f472b6;">
          <template v-for="(sec, idx) in getModuleSections('love')" :key="sec.id || idx">
            <view class="sub-section-container">
              <text class="sub-section-title" style="color:#BE185D;">{{ sec.title }}</text>
              <text class="prose-text">{{ sec.body }}</text>
            </view>
            <view v-if="idx < getModuleSections('love').length - 1" class="s1-divider sub-section-divider" style="background-color: #fdf2f8;"></view>
          </template>

          <view v-if="maskNeeded('love') && !getModule('love')?.unlocked" class="module-mask">
            <view class="unlock-icon module-unlock-icon">
              <u-icon name="lock-closed" color="#6366f1" size="28"></u-icon>
            </view>
            <text class="module-title">解锁恋爱与亲密关系</text>
            <view class="unlock-btn module-unlock-btn" @click="handleModuleUnlock(getModule('love')!)" style="width: 200rpx; height: 80rpx; font-size: 28rpx;">
              <text class="unlock-btn-text">立即解锁</text>
            </view>
          </view>
        </view>
      </view>

      
      <!-- 进阶指南 -->
      <view class="section" v-if="getModule('advanced_guide')">
        <view class="watermark-title-container">
          <text class="watermark-text">ADVANCED</text>
          <view class="main-title">
            <view class="title-tag-icon"></view>
            <text>人生进阶指南</text>
          </view>
        </view>
        <view class="long-text-card" style="position: relative; border-top: 8rpx solid #10b981;">
          <template v-for="(sec, idx) in getModuleSections('advanced_guide')" :key="sec.id || idx">
            <view class="sub-section-container">
              <text class="sub-section-title" style="color:#047857;">{{ sec.title }}</text>
              <text class="prose-text">{{ sec.body }}</text>
            </view>
            <view v-if="idx < getModuleSections('advanced_guide').length - 1" class="s1-divider sub-section-divider" style="background-color: #ecfdf5;"></view>
          </template>

          <view v-if="maskNeeded('advanced_guide') && !getModule('advanced_guide')?.unlocked" class="module-mask">
            <view class="unlock-icon module-unlock-icon">
              <u-icon name="lock-closed" color="#10b981" size="28"></u-icon>
            </view>
            <text class="module-title">解锁进阶指南</text>
            <view class="unlock-btn module-unlock-btn" @click="handleModuleUnlock(getModule('advanced_guide')!)" style="width: 200rpx; height: 80rpx; font-size: 28rpx; background: linear-gradient(135deg, #34d399, #10b981);">
              <text class="unlock-btn-text">立即解锁</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="unlockCta" class="unlock-section">
        <view class="unlock-inner">
          <view class="unlock-icon">
            <u-icon name="checkmark" color="#A5B4FC" size="28"></u-icon>
          </view>
          <text class="unlock-title">解锁完整深度报告</text>
          <text class="unlock-sub">包含 8 维功能倾向 & 潜在压力预警</text>
          <view class="unlock-btn" @click="handleUnlock">
            <text class="unlock-btn-text">{{
              unlockCta?.cta || '立即开启'
            }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
  <!-- <view class="fixed-bottom">
    <view class="fixed-button active-scale-95">
      <u-icon name="lightning" color="#ffffff" size="22"></u-icon>
      <text class="fixed-button-text">生成定制化人格海报</text>
    </view>
  </view> -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';
import { useMBTIReport } from '@/hooks/useMBTIReport';
import type { MBTIModule } from '@/hooks/useMBTIReport';

const {
  isLoading,
  reportId,
  typeCode,
  archetypeTitle,
  archetypeImage,
  archetypeExamples,
  lettersList,
  dimensionsList,
  rarityRankLabel,
  rarityPopulation,
  rarityNoteText,
  clarityOverall,
  selfInsightSections,
  strengthsStatic,
  weaknessesStatic,
  strengthsFocusAi,
  growthAi,
  unlockCta,
  dimLabelFromCode,
  getDimensionColor,
  isLeftDominant,
  leftPercent,
  rightPercent,
  leftCode,
  rightCode,
  leftName,
  rightName,
  barStyle,
  splitText,
  getModule,
  getModuleSections,
  getModuleSectionBody,
  maskNeeded,
  loadReport
} = useMBTIReport();

const handleUnlock = () => {
  uni.showToast({ title: '即将解锁', icon: 'none' });
};

const handleModuleUnlock = (m: MBTIModule) => {
  const cta = m.unlock_action?.cta || '解锁查看';
  uni.showToast({ title: cta, icon: 'none' });
};

onLoad((options: any) => {
  if (options?.reportId) {
    loadReport(options.reportId).catch(() => {
      uni.showToast({ title: '报告加载失败', icon: 'none' });
    });
  } else {
    uni.showToast({ title: '缺少报告ID', icon: 'none' });
  }
});
</script>

<style lang="scss" scoped>
.report-page {
  background-color: #f8f9ff;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 96rpx;
  overflow-x: hidden;
}
.bg-fixed {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.4;
}
.bg-left {
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 40vh;
  background-color: rgba(238, 242, 255, 0.4);
}
.bg-right {
  bottom: 10%;
  right: -10%;
  width: 40vw;
  height: 40vh;
  background-color: rgba(233, 213, 255, 0.4);
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 24rpx;
  pointer-events: none;
}
.nav-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 24rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}
.nav-status {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 12rpx;
  pointer-events: auto;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}
.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 9999px;
  background-color: #22c55e;
}
.status-text {
  font-size: 30rpx;
  font-weight: 900;
  color: #475569;
  letter-spacing: 0.02em;
}

.main-wrap {
  margin: 0 auto;
  padding: 32rpx;
  position: relative;
  z-index: 10;
}
.header {
  text-align: center;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.code-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 192rpx;
  height: 192rpx;
  background-color: #0f172a;
  color: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 40rpx 60rpx -24rpx rgba(0, 0, 0, 0.35);
  margin-bottom: 24rpx;
}
.badge-glow {
  position: absolute;
  inset: 0;
  border-radius: 32rpx;
  background-color: #6366f1;
  filter: blur(40px);
  opacity: 0.2;
  transform: scale(1.4);
}
.code-text {
  font-size: 68rpx;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.header-title {
  font-size: 44rpx;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8rpx;
}
.header-subtitle {
  font-size: 36rpx;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.kw-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
  margin-top: 24rpx;
}
.kw-item {
  padding: 12rpx 24rpx;
  background-color: rgba(238, 242, 255, 0.5);
  border: 1rpx solid rgba(199, 210, 254, 0.5);
  border-radius: 20rpx;
  backdrop-filter: blur(4px);
}
.kw-text {
  font-size: 32rpx;
  font-weight: 900;
  color: rgba(99, 102, 241, 0.7);
}

.section {
  margin-bottom: 48rpx;
}
.section-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.section-mark {
  width: 12rpx;
  height: 40rpx;
  border-radius: 9999px;
  box-shadow: 0 12rpx 20rpx rgba(0, 0, 0, 0.08);
}
.section-mark.indigo {
  background-color: #6366f1;
  box-shadow: 0 12rpx 20rpx rgba(99, 102, 241, 0.25);
}
.section-mark.rose {
  background-color: #fb7185;
  box-shadow: 0 12rpx 20rpx rgba(251, 113, 133, 0.25);
}
.section-mark.orange {
  background-color: #fb923c;
  box-shadow: 0 12rpx 20rpx rgba(251, 146, 60, 0.25);
}
.section-title {
  font-size: 44rpx;
  font-weight: 900;
  color: #0f172a;
}

.dim-wrap {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.dim-block {
  margin-bottom: 12rpx;
}
.dim-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12rpx;
  padding: 0 4rpx;
}
.dim-label {
  font-size: 34rpx;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.dim-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 9999px;
}
.dim-codes {
  display: flex;
  gap: 24rpx;
}
.dim-code {
  font-size: 34rpx;
  font-weight: 900;
}
.code-active {
  color: #0f172a;
}
.code-muted {
  color: #cbd5e1;
}
.dim-bar {
  position: relative;
  height: 80rpx;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: inset 0 6rpx 10rpx rgba(0, 0, 0, 0.04);
}
.dim-fill {
  position: absolute;
  height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.dim-text-row {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24rpx;
  pointer-events: none;
}
.dim-side {
  font-size: 32rpx;
  font-weight: 900;
}
.side-white {
  color: #ffffff;
}
.side-muted {
  color: #9CA3AF;
}

.rarity-card {
  border-radius: 40rpx;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 6rpx 10rpx rgba(0, 0, 0, 0.04);
}
.rarity-rings {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ring-circle {
  position: relative;
  width: 128rpx;
  height: 128rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 9999px;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.06);
}
.ring-svg {
  width: 112rpx;
  height: 112rpx;
  transform: rotate(-90deg);
}
.ring-percent {
  position: absolute;
  font-size: 32rpx;
  font-weight: 900;
  color: #334155;
}
.ring-label {
  font-size: 32rpx;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 8rpx;
}
.rarity-note {
  padding: 20rpx;
  background-color: rgba(238, 242, 255, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
}
.note-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.note-head-text {
  font-size: 34rpx;
  font-weight: 900;
  color: #6366f1;
}
.note-text {
  font-size: 34rpx;
  color: #64748b;
  line-height: 1.6;
  font-style: italic;
}

.dynamic-sections {
  margin-top: 16rpx;
}
.module-section {
  margin-bottom: 40rpx;
  position: relative;
}
.module-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  position: relative;
}
.module-lock-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16rpx;
}
.lock-tip {
  font-size: 36rpx;
  font-weight: 900;
  color: #e2e8f0;
}
.unlock-inline-btn {
  padding: 20rpx 32rpx;
  background-color: #6366f1;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 24rpx rgba(99, 102, 241, 0.3);
}
.unlock-inline-text {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 900;
  letter-spacing: 0.12em;
}
.section-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.module-card {
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.module-card-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.module-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 9999px;
}
.module-dot.orange {
  background-color: #fb923c;
}
.module-subtitle {
  font-size: 36rpx;
  font-weight: 900;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.module-body {
  font-size: 36rpx;
  color: #64748b;
  line-height: 1.7;
  font-weight: 500;
}
.bullet-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-left: 4rpx;
}
.bullet-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}
.bullet-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 9999px;
  background-color: #fb923c;
  margin-top: 12rpx;
  flex: 0 0 12rpx;
}
.bullet-text {
  font-size: 36rpx;
  color: #64748b;
  line-height: 1.7;
  font-weight: 500;
}

/* AI Growth Styles */
.ai-growth-card {
  margin-top: 32rpx;
  position: relative;
}
.ai-growth-section {
  padding-bottom: 32rpx;
}
.ai-growth-section.has-border {
  border-bottom: 2rpx solid #f1f5f9;
  margin-bottom: 32rpx;
}
.ai-growth-title {
  font-size: 32rpx;
  font-weight: 900;
  margin-bottom: 24rpx;
  display: block;
}
.ai-growth-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.ai-growth-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}
.ai-growth-dot {
  font-size: 24rpx;
  margin-top: 8rpx;
}
.ai-growth-text {
  flex: 1;
}

.unlock-section {
  margin-top: 64rpx;
  background-color: #0f172a;
  border-radius: 44rpx;
  padding: 32rpx;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 40rpx 60rpx -24rpx rgba(0, 0, 0, 0.35);
}
.unlock-inner {
  position: relative;
  z-index: 10;
  text-align: center;
}
.unlock-icon {
  width: 112rpx;
  height: 112rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.unlock-title {
  font-size: 44rpx;
  font-weight: 900;
  margin-bottom: 12rpx;
  letter-spacing: -0.02em;
}
.unlock-sub {
  font-size: 32rpx;
  color: #94a3b8;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 24rpx;
}
.unlock-btn {
  width: 100%;
  height: 112rpx;
  background-color: #ffffff;
  color: #0f172a;
  border-radius: 24rpx;
  font-weight: 900;
  font-size: 36rpx;
  letter-spacing: 0.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 40rpx 50rpx -24rpx rgba(0, 0, 0, 0.25);
}

.fixed-bottom {
  position: fixed;
  bottom: 32rpx;
  left: 0;
  width: 100%;
  padding: 0 24rpx;
  z-index: 100;
  pointer-events: none;
}
.fixed-button {
  width: 100%;
  height: 128rpx;
  background-color: #6366f1;
  color: #ffffff;
  border-radius: 28rpx;
  font-weight: 900;
  font-size: 40rpx;
  letter-spacing: 0.2em;
  box-shadow: 0 40rpx 60rpx -24rpx rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  pointer-events: auto;
}
.active-scale-95:active {
  transform: scale(0.95);
}
/* Archetype Examples Grid */
.examples-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 32rpx;
}
.example-item {
  width: calc(50% - 16rpx);
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.example-img {
  width: 100%;
  height: 200rpx;
}
.example-name {
  font-size: 32rpx;
  font-weight: 900;
  color: #1f2937;
  padding: 12rpx 0 16rpx;
}

/* Light Mask for Career/Love modules */
.module-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 48rpx;
}
.module-unlock-icon {
  margin-bottom: 16rpx;
}
.module-unlock-btn {
  margin-top: 16rpx;
}
.module-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #1f2937;
}

/* V2 Design Helpers */
.watermark-title-container {
  position: relative;
  margin-bottom: 20rpx;
  padding-top: 10rpx;
}
.watermark-text {
  position: absolute;
  top: -5rpx;
  left: 0;
  font-size: 24rpx;
  font-weight: 900;
  color: rgba(241, 245, 249, 0.8);
  text-transform: uppercase;
  letter-spacing: 1rpx;
  z-index: 0;
}
.main-title {
  position: relative;
  z-index: 1;
  font-size: 40rpx;
  font-weight: 900;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.title-tag-icon {
  width: 24rpx;
  height: 24rpx;
  background-color: #FF8A65;
  border-radius: 6rpx 0 6rpx 0;
  transform: rotate(-15deg);
}
.long-text-card {
  background: #ffffff;
  border-radius: 48rpx;
  padding: 48rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.02);
  border: 2rpx solid rgba(241, 245, 249, 1);
}

.s1-card {
  padding-top: 64rpx;
  padding-bottom: 80rpx;
}
.s1-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 64rpx;
}
.s1-ip-wrap {
  width: 224rpx;
  height: 224rpx;
  position: relative;
  margin-top: -32rpx;
}
.s1-ip-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20rpx 26rpx rgba(0,0,0,0.1));
}
.s1-info {
  flex: 1;
}
.s1-badge {
  display: inline-block;
  padding: 8rpx 24rpx;
  background-color: #eef2ff;
  color: #4f46e5;
  font-size: 24rpx;
  font-weight: 900;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}
.s1-code {
  font-size: 104rpx;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16rpx;
  letter-spacing: -0.05em;
  display: block;
}
.s1-subinfo {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 500;
  display: block;
}
.s1-divider {
  height: 2rpx;
  width: 100%;
  background-color: #f3f4f6;
  margin-bottom: 48rpx;
}
.s1-dim-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1f2937;
  margin-bottom: 48rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.s1-dim-mark {
  width: 12rpx;
  height: 32rpx;
  background-color: #6366f1;
  border-radius: 9999rpx;
}
.advantage-card {
  background: #6366F1;
  border-radius: 32rpx;
  padding: 40rpx 24rpx 24rpx;
  position: relative;
  color: #ffffff;
  margin-top: 30rpx;
}
.blindspot-card {
  background: #FFFFFF;
  border: 2rpx solid #FFF1F2;
  border-radius: 32rpx;
  padding: 40rpx 24rpx 24rpx;
  position: relative;
  margin-top: 30rpx;
}
.floating-badge {
  position: absolute;
  top: -15rpx;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to right, #E0E7FF, #C7D2FE);
  color: #4338CA;
  font-weight: 900;
  font-size: 28rpx;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(99, 102, 241, 0.2);
  white-space: nowrap;
}
.prose-text {
  font-size: 32rpx;
  line-height: 1.8;
  color: #475569;
  text-align: justify;
}
.sub-section-container {
  margin-bottom: 24rpx;
}
.sub-section-divider {
  margin-top: 48rpx;
  margin-bottom: 48rpx;
}
.sub-section-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #1E293B;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-4 { gap: 32rpx; }
.h-px { height: 2rpx; }
.w-full { width: 100%; }
.mb-6 { margin-bottom: 48rpx; }
.mb-4 { margin-bottom: 32rpx; }
.mb-3 { margin-bottom: 24rpx; }
.mb-2 { margin-bottom: 16rpx; }
.mb-1 { margin-bottom: 8rpx; }
.block { display: block; }
.text-base { font-size: 32rpx; }
.font-black { font-weight: 900; }
.font-bold { font-weight: bold; }
.text-gray-800 { color: #1F2937; }
.text-gray-700 { color: #374151; }
.text-gray-600 { color: #4B5563; }
.bg-gray-100 { background-color: #F3F4F6; }
.px-2 { padding-left: 16rpx; padding-right: 16rpx; }
.py-0_5 { padding-top: 4rpx; padding-bottom: 4rpx; }
.rounded { border-radius: 8rpx; }
.text-xs { font-size: 24rpx; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 16rpx; }
.bg-emerald-50 { background-color: #ECFDF5; }
.rounded-2xl { border-radius: 32rpx; }
.p-4 { padding: 32rpx; }
.text-emerald-700 { color: #047857; }
.text-emerald-800 { color: #065F46; }
.bg-rose-50 { background-color: #FFF1F2; }
.text-rose-700 { color: #BE123C; }
.text-rose-800 { color: #9F1239; }
.leading-relaxed { line-height: 1.625; }
.space-y-4 > view + view { margin-top: 32rpx; }
.border { border-width: 2rpx; border-style: solid; }
.border-gray-100 { border-color: #F3F4F6; }
.rounded-xl { border-radius: 24rpx; }
.text-sm { font-size: 28rpx; }
.text-indigo-600 { color: #4F46E5; }
.flex-col { flex-direction: column; }

.text-xl { font-size: 40rpx; }
.w-1_5 { width: 12rpx; }
.h-1_5 { height: 12rpx; }
.shrink-0 { flex-shrink: 0; }
.text-indigo-100 { color: #e0e7ff; }
.text-rose-500 { color: #f43f5e; }
.bg-rose-400 { background-color: #fb7185; }
.gap-3 { gap: 24rpx; }
</style>
