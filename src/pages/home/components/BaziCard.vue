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
        查看详细排盘
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
interface UserInfo {
  name: string;
  gender: string;
  birth_date: string;
  chinese_birth_date?: string;
  birth_time: string;
  birth_location: string;
}
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
  const { name, birth_date, birth_location, birth_time, gender } = props.userInfo;
  uni.navigateTo({
      url: `/pages/bazi/detail?name=${name}&gender=${gender}&birth_date=${birth_date}&birth_location=${birth_location}&birth_time=${birth_time}`
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
  /* max-w-[280px] w-full glass-card p-5 rounded-[28px] rounded-tl-none shadow-sm border-white/80 */
  width: 560rpx; /* 280px * 2 */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 56rpx; /* 28px * 2 */
  border-top-left-radius: 0;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
  padding: 40rpx; /* p-5 = 1.25rem = 20px = 40rpx */
  box-sizing: border-box;
}

.bazi-grid {
  /* grid grid-cols-4 gap-4 */
  display: flex;
  justify-content: space-between;
  gap: 32rpx; /* gap-4 = 1rem = 16px = 32rpx */
}

.pillar-col {
  /* flex flex-col items-center */
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  
  .label {
    /* text-[9px] font-bold text-slate-300 mb-0.5 */
    font-size: 24rpx; /* ~10px slightly readable than 9px */
    font-weight: 700;
    color: #cbd5e1; /* slate-300 */
    margin-bottom: 4rpx;
  }

  .ss {
    /* text-[9px] font-bold text-slate-400 mb-2 */
    font-size: 24rpx;
    font-weight: 700;
    color: #94a3b8; /* slate-400 */
    margin-bottom: 16rpx; /* mb-2 = 0.5rem = 8px = 16rpx */
    
    &.highlight {
        /* Not in original design explicitly but useful? Original says '日主' is just ss. */
        /* Keeping it simple as per design */
    }
  }

  .char-stack {
    /* flex flex-col items-center leading-tight mb-2 */
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.25;
    margin-bottom: 16rpx;

    .char {
      /* text-xl font-black */
      font-size: 40rpx; /* xl = 1.25rem = 20px = 40rpx */
      font-weight: 900;
    }
  }
}

.detail-btn {
  /* w-full mt-6 py-2.5 bg-slate-900 text-white rounded-full text-[11px] font-black tracking-widest active:scale-95 transition-all */
  width: 100%;
  margin-top: 48rpx; /* mt-6 = 1.5rem = 24px = 48rpx */
  padding: 20rpx 0; /* py-2.5 = 0.625rem = 10px = 20rpx */
  background-color: #0f172a; /* slate-900 */
  color: white;
  border-radius: 999rpx;
  font-size: 28rpx; /* text-[11px] ~ 24rpx -> 24rpx for readability */
  font-weight: 900;
  letter-spacing: 0.1em; /* tracking-widest */
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
.mu { color: #10B981; }
.huo { color: #EF4444; }
.tu { color: #B45309; }
.jin { color: #D99014; }
.shui { color: #3B82F6; }

</style>
