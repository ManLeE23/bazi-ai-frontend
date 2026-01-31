<template>
  <div class="report-page">
    <!-- Header -->
    <div class="report-header">
      <div class="circle-bg"></div>
      <div class="bottom-circle"></div>
      <u-navbar
        :is-back="true"
        :is-fixed="true"
        background="transparent"
        back-icon-color="#fff"
        :border-bottom="false"
      />
      <div class="header-content">
        <div v-if="data && data.user_info" class="user-info">
          <image
            src="@/static/icon/default-calendar.svg"
            alt="calendar"
            style="width: 16px; height: 16px"
            class="info-icon"
          />
          <span>{{ data.user_info.birth_date }} / {{ data.user_info.chinese_birth_date }}</span>
          <image
            src="@/static/icon/default-clock.svg"
            alt="clock"
            style="width: 16px; height: 16px"
            class="info-icon"
          />
          <span>{{ data.user_info.birth_hour }}</span>
        </div>
        <!-- <h1 class="report-title">你的命盘诊断</h1> -->
        <p class="report-subtitle">
          {{ data.user_info.gender }} · 已为你解读
          {{ data.focus_dimensions.length }} 个维度
        </p>
      </div>
    </div>

    <div class="report-content">
      <!-- Bazi Card -->
      <div class="bazi-card">
        <div class="card-header">
          <image src="@/static/logo.svg" alt="bazi" class="card-icon" />
          <h3>八字排盘</h3>
        </div>
        <div class="bazi-grid">
          <BaziPillar
            v-for="(value, key) in data.bazi_pillars"
            :key="`${value}${key}`"
            :label="key"
            :value="value"
          />
        </div>
      </div>

      <!-- Summary Card -->
      <div class="summary-card">
        <h3 class="summary-title">整体格局</h3>
        <div class="highlight-box">
          <p class="highlight-text">{{ data.agent_c_report.overall }}</p>
        </div>
      </div>

      <div class="focus-card">
        <h3 class="title">维度分析</h3>
        <div v-for="(value, key) in data.agent_c_report.focus" class="content">
          <div class="label">{{ key }}</div>
          <div class="desc">{{ value }}</div>
        </div>
      </div>

      <!-- Global Advice -->
      <div class="global-advice-card">
        <div class="global-header">
          <div class="global-icon">
            <image
              src="@/static/default-logo.svg"
              alt="advice"
              class="icon-text"
            />
          </div>
          <h3>综合建议</h3>
        </div>
        <p class="global-content">{{ data.agent_c_report.suggestion }}</p>
      </div>

      <!-- Share Button -->
      <button open-type="share" class="share-button">分享我的诊断报告</button>

      <!-- Chat Button -->
      <div @click="jumpToChat" class="chat-button">
        <image src="@/static/icon/chat.svg" alt="chat" class="chat-icon" />
        <span>还有疑问？点我继续问 AI 命师</span>
      </div>

      <!-- Disclaimer -->
      <p class="disclaimer">*本报告仅供参考，具体决策请结合实际情况理性判断</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import BaziPillar from './components/BaziPillar.vue';
import { fetchReportById } from '@/api/services';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';

const reportId = ref(null);
const data = ref(null);

onLoad((params) => {
  if (params.id) {
    reportId.value = params.id;
    getReportDetail();
  }
});
const filterBaziPillars = (data) => {
  // 定义需要保留的字段
  const targetFields = ["年柱", "月柱", "日柱", "时柱"];
  // 遍历字段，提取对应值
  const result = {};
  targetFields.forEach(field => {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  });
  return result;
}

const getReportDetail = async () => {
  const res = await fetchReportById(reportId.value);
  data.value = res.data;
  const baziPillars = filterBaziPillars(data.value.bazi_pillars);
  console.log(baziPillars);
  data.value.bazi_pillars = baziPillars;
};

const jumpToChat = () => {
  uni.navigateTo({
    url: `/pages/new-chat/index?reportId=${reportId.value}`,
  });
}

onShareAppMessage(() => {
  return {
    title: '你的命盘诊断',
    path: `/pages/report/index?id=${reportId.value}`,
  };
});

</script>

<style lang="scss" scoped>
.report-page {
  min-height: 100vh;
  background: #f6f8fb;
}

.report-header {
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  position: relative;
  overflow: hidden;
  padding: 48px 24px 96px 24px;
  box-sizing: border-box;
  .circle-bg {
    position: absolute;
    top: 0;
    right: 0;
    /* 尺寸：w-64/h-64 转换 */
    width: 256px;
    height: 256px;
    /* 背景色：白色 10% 透明度 */
    background-color: rgba(255, 255, 255, 0.1);
    /* 圆形 */
    border-radius: 50%;
    /* 负外边距：-mr-32/-mt-32 转换 */
    margin-right: -128px;
    margin-top: -128px;
  }
  .bottom-circle {
    /* 定位：绝对定位，左下角 */
    position: absolute;
    bottom: 0;
    left: 0;

    /* 尺寸：w-48/h-48 转换（Tailwind 1单位=0.25rem，48×0.25rem=12rem=192px；用rpx适配多端：192px=384rpx） */
    width: 384rpx;
    height: 384rpx;

    /* 背景色：白色10%透明度 */
    background-color: rgba(255, 255, 255, 0.1);

    /* 圆形 */
    border-radius: 50%;

    /* 负外边距：-ml-24/-mb-24 转换（24×0.25rem=6rem=96px；rpx适配：96px=192rpx） */
    margin-left: -192rpx;
    margin-bottom: -192rpx;
  }
}

.header-bg-1 {
  position: absolute;
  top: 0;
  right: 0;
  width: 256px;
  height: 256px;
  background-color: rgba($color-white, 0.1);
  border-radius: 50%;
  margin-right: -128px;
  margin-top: -128px;
}

.header-bg-2 {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 192px;
  height: 192px;
  background-color: rgba($color-white, 0.1);
  border-radius: 50%;
  margin-left: -96px;
  margin-bottom: -96px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: rgba($color-white, 0.9);
  margin-bottom: $spacing-lg;
  position: relative;
  z-index: 10;

  &:hover {
    color: $color-white;
  }
}

.back-icon {
  font-size: 20px;
}

.header-content {
  position: relative;
  z-index: 10;
  margin-top: -24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: rgba($color-white, 0.9);
  margin-bottom: $spacing-sm;
  font-size: 14px;
}

.info-icon {
  width: 16px;
  height: 16px;
}

.report-title {
  color: rgba($color-white, 0.9);
  font-size: 14px;
  margin-bottom: $spacing-sm;
}

.report-subtitle {
  color: rgba($color-white, 0.9);
  font-size: 14px;
}

.report-content {
  width: 100%;
  margin: 0 auto;
  padding: 0 $spacing-md 34px $spacing-md;
  margin-top: -64px;
  position: relative;
  z-index: 10;
}

.bazi-card {
  background-color: $color-white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: $spacing-md;
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: 12px;
  font-size: 16px;
  color: $color-slate-900;
}

.card-icon {
  width: 20px;
  height: 20px;
}

.bazi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-sm;
}

.focus-card {
  background: linear-gradient(135deg, $color-slate-50, $color-slate-100);
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  border: 1px solid $color-slate-200;
  margin-bottom: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .title {
    color: $color-slate-900;
    font-size: 16px;
    font-weight: 500;
  }
  .content {
    font-size: 14px;
    background-color: $color-white;
    border-radius: $border-radius-base;
    padding: $spacing-md;
    .label {
      color: $color-orange-400;
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
}

.summary-card {
  background: linear-gradient(135deg, $color-slate-50, $color-slate-100);
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  border: 1px solid $color-slate-200;
  margin-bottom: $spacing-md;
}

.summary-title {
  margin-bottom: 12px;
  color: $color-slate-900;
  font-size: 16px;
  font-weight: 500;
}

.summary-text {
  font-size: 14px;
  color: $color-slate-700;
  margin-bottom: $spacing-md;
}

.highlight-box {
  background-color: $color-white;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  border-left: 4px solid $color-amber-500;
}

.highlight-text {
  color: $color-slate-700;
  font-size: 14px;
}

.dimension-card {
  background-color: $color-white;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: $spacing-md;
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.dimension-icon {
  width: 48px;
  height: 48px;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.blue-icon {
  background: linear-gradient(135deg, $color-blue-400, $color-blue-600);
}

.pink-icon {
  background: linear-gradient(135deg, $color-pink-400, $color-rose-600);
}

.green-icon {
  background: linear-gradient(135deg, $color-green-400, $color-green-600);
}

.purple-icon {
  background: linear-gradient(135deg, $color-purple-400, $color-purple-600);
}

.orange-icon {
  background: linear-gradient(135deg, $color-orange-400, $color-amber-600);
}

.icon-text {
  font-size: 24px;
  color: $color-white;
}

.analysis-section {
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $color-slate-100;
}

.section-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.section-dot {
  width: 6px;
  height: 6px;
  background-color: $color-slate-400;
  border-radius: 50%;
}

.amber-dot {
  background-color: $color-amber-500;
}

.section-title {
  color: $color-slate-500;
  font-size: $text-sm;
  font-weight: 600;
}

.section-content {
  color: $color-slate-600;
  padding-left: 20px;
}

.advice-box {
  border-radius: $border-radius-base;
  padding: $spacing-md;
}

.blue-bg {
  background: linear-gradient(
    135deg,
    rgba($color-blue-400, 0.05),
    rgba($color-blue-600, 0.05)
  );
}

.pink-bg {
  background: linear-gradient(
    135deg,
    rgba($color-pink-400, 0.05),
    rgba($color-rose-600, 0.05)
  );
}

.green-bg {
  background: linear-gradient(
    135deg,
    rgba($color-green-400, 0.05),
    rgba($color-green-600, 0.05)
  );
}

.purple-bg {
  background: linear-gradient(
    135deg,
    rgba($color-purple-400, 0.05),
    rgba($color-purple-600, 0.05)
  );
}

.orange-bg {
  background: linear-gradient(
    135deg,
    rgba($color-orange-400, 0.05),
    rgba($color-amber-600, 0.05)
  );
}

.advice-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.advice-icon {
  font-size: 14px;
}

.advice-title {
  color: $color-slate-700;
  font-size: $text-sm;
  font-weight: 600;
}

.advice-content {
  color: $color-slate-700;
}

.global-advice-card {
  background: linear-gradient(135deg, $color-amber-50, $color-orange-50);
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 2px solid $color-amber-200;
  margin-bottom: $spacing-md;
  font-size: 14px;
}

.global-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.global-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  image {
    width: 20px;
    height: 20px;
  }
}

.global-content {
  color: $color-slate-700;
  line-height: 1.6;
}

.share-button {
  width: 100%;
  padding: $spacing-md 0;
  box-sizing: border-box;
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  color: $color-white;
  border-radius: $border-radius-base;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 12px;
  transition: all 0.2s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
}

.chat-button {
  width: 100%;
  padding: $spacing-md 0;
  background-color: $color-white;
  border: 2px solid $color-amber-400;
  color: $color-amber-600;
  border-radius: $border-radius-base;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
  .chat-icon {
    width: 20px;
    height: 20px;
  }
}

.disclaimer {
  text-align: center;
  color: $color-slate-400;
  margin-top: $spacing-lg;
  font-size: $text-xs;
  margin-bottom: 60px;
}
</style>
