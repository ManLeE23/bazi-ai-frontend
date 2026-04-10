<template>
  <view class="bazi-card-container">
    <view class="glass-card">
      <view class="bazi-grid">
        <!-- Loop over pillars manually to control order/labels -->
        
        <!-- Year Pillar -->
        <view class="pillar-col">
           <text class="label">年柱</text>
           <text class="ss">{{ data.pillars?.year?.ten_god || '-' }}</text>
           <view class="char-stack">
              <text class="char" :class="getWuXingClass(data.pillars?.year?.gan)">{{ data.pillars?.year?.gan || '-' }}</text>
              <text class="char" :class="getWuXingClass(data.pillars?.year?.zhi)">{{ data.pillars?.year?.zhi || '-' }}</text>
           </view>
        </view>

        <!-- Month Pillar -->
        <view class="pillar-col">
           <text class="label">月柱</text>
           <text class="ss">{{ data.pillars?.month?.ten_god || '-' }}</text>
           <view class="char-stack">
              <text class="char" :class="getWuXingClass(data.pillars?.month?.gan)">{{ data.pillars?.month?.gan || '-' }}</text>
              <text class="char" :class="getWuXingClass(data.pillars?.month?.zhi)">{{ data.pillars?.month?.zhi || '-' }}</text>
           </view>
        </view>

        <!-- Day Pillar -->
        <view class="pillar-col">
           <text class="label">日柱</text>
           <text class="ss highlight">日主</text>
           <view class="char-stack">
              <text class="char" :class="getWuXingClass(data.pillars?.day?.gan)">{{ data.pillars?.day?.gan || '-' }}</text>
              <text class="char" :class="getWuXingClass(data.pillars?.day?.zhi)">{{ data.pillars?.day?.zhi || '-' }}</text>
           </view>
        </view>

        <!-- Hour Pillar -->
        <view class="pillar-col">
           <text class="label">时柱</text>
           <text class="ss">{{ data.pillars?.hour?.ten_god || '-' }}</text>
           <view class="char-stack">
              <text class="char" :class="getWuXingClass(data.pillars?.hour?.gan)">{{ data.pillars?.hour?.gan || '-' }}</text>
              <text class="char" :class="getWuXingClass(data.pillars?.hour?.zhi)">{{ data.pillars?.hour?.zhi || '-' }}</text>
           </view>
        </view>

      </view>

      <button class="detail-btn" hover-class="btn-hover" @click="viewDetail">
        查看详情
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { UserInfo } from '@/store/user';
// --- Types ---
interface HiddenStem {
  gan: string;
  ten_god: string;
  full_ten_god: string;
}

interface Pillar {
  gan: string;
  zhi: string;
  ten_god: string;
  hidden_stems: HiddenStem[];
}

interface BaziData {
  base_info: {
    name: string;
    gender: string;
    birth_date: string;
    chinese_birth_date: string;
  };
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
}

const props = defineProps<{
  data: BaziData;
  userInfo: UserInfo;
}>();

const viewDetail = () => {
  const { id } = props.userInfo;
  uni.navigateTo({
      url: `/pages/qushi/detail?id=${id}`
  });
};

// --- Helpers ---
const getWuXingClass = (char: string | undefined) => {
    if (!char) return '';
    const map: Record<string, string> = {
        '甲': 'mu', '乙': 'mu', '寅': 'mu', '卯': 'mu',
        '丙': 'huo', '丁': 'huo', '巳': 'huo', '午': 'huo',
        '戊': 'tu', '己': 'tu', '辰': 'tu', '戌': 'tu', '丑': 'tu', '未': 'tu',
        '庚': 'jin', '辛': 'jin', '申': 'jin', '酉': 'jin',
        '壬': 'shui', '癸': 'shui', '亥': 'shui', '子': 'shui'
    };
    return map[char] || '';
};

</script>

<style lang="scss" scoped>
.bazi-card-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24rpx;
  animation: springUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2) both;
  animation-delay: 0.1s;
}

@keyframes springUp {
  0% {
    opacity: 0;
    transform: translateY(30rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-card {
  width: 560rpx;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 48rpx;
  border-top-left-radius: 0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 0.5px solid rgba(202, 195, 216, 0.2);
  padding: 40rpx;
  box-sizing: border-box;
}

.bazi-grid {
  display: flex;
  justify-content: space-between;
  gap: 32rpx;
}

.pillar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  
  .label {
    font-size: 24rpx;
    font-weight: 700;
    color: #94a3b8; /* slate-400 */
    margin-bottom: 4rpx;
  }

  .ss {
    font-size: 24rpx;
    font-weight: 700;
    color: #94a3b8; /* slate-400 */
    margin-bottom: 16rpx;
    
    &.highlight {
        color: #632ce5; /* primary */
    }
  }

  .char-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.25;
    margin-bottom: 16rpx;

    .char {
      font-size: 40rpx;
      font-weight: 900;
    }
  }
}

.detail-btn {
  width: 100%;
  margin-top: 24rpx;
  padding: 20rpx 0;
  background-color: #7c4dff; /* primary_container */
  color: white;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 900;
  letter-spacing: 0.1em;
  border: none;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-hover {
  transform: scale(0.95);
  opacity: 0.9;
}

/* Colors */
.mu { color: #059669; }
.huo { color: #dc2626; }
.tu { color: #d97706; }
.jin { color: #b45309; }
.shui { color: #2563eb; }

</style>
