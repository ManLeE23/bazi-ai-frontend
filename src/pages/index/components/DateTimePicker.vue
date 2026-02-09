<template>
  <div class="date-time-picker">
    <view v-if="$slots.default" @click="openPicker">
      <slot />
    </view>
    <FormInput
      v-else
      :value="displayValue"
      placeholder="请选择出生日期和时间"
      disabled
      @click="openPicker"
    />
    <u-popup v-model="show" mode="center" border-radius="32" :mask-close-able="false" :z-index="10090" width="650">
      <view class="popup-container">
        <view class="popup-header">
          <text class="btn-cancel" @click="closePicker">取消</text>
          <!-- <text class="popup-title">选择出生日期与时间</text> -->
          <view class="mode-tabs">
            <view 
              class="mode-tab" 
              :class="{ active: internalMode === 'gregorian' }"
              @click="switchMode('gregorian')"
            >
              公历
            </view>
            <view 
              class="mode-tab" 
              :class="{ active: internalMode === 'lunar' }"
              @click="switchMode('lunar')"
            >
              农历
            </view>
          </view>
          <text class="btn-confirm" @click="confirmPicker">确认</text>
        </view>

        <!-- Quick Input -->
        <view class="quick-input-box" v-if="internalMode === 'gregorian'">
          <input 
            class="quick-input"
            v-model="quickInput"
            placeholder="输入出生年月日时分(如199303270255)"
            placeholder-style="color: #9ca3af; font-size: 26rpx;"
            type="number"
            maxlength="12"
            @input="onQuickInput"
          />
          <view class="quick-btn" @click="parseQuickInput">查询</view>
        </view>

        <picker-view 
          :value="currentIndices" 
          @change="onPickerChange" 
          class="picker-view" 
          indicator-style="height: 56px;"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in yearList" :key="index">{{item.label}}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in monthList" :key="index">{{item.label}}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in dayList" :key="index">{{item.label}}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in hours" :key="index">{{item}}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in minutes" :key="index">{{item}}</view>
          </picker-view-column>
        </picker-view>
      </view>
    </u-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import FormInput from './FormInput.vue';
// @ts-ignore
import { Solar, Lunar, LunarUtil, LunarYear } from 'lunar-javascript';

const props = defineProps({
  date: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'gregorian'
  }
});

const emit = defineEmits(['update:date', 'update:time', 'update:mode', 'lunar-date']);

const show = ref(false);
const internalMode = ref('gregorian');
const quickInput = ref('');

// Constants
const startYear = 1900;
const endYear = 2100;
const hours = [...Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}时`), '未知'];
const minutes = [...Array.from({ length: 60 }, (_, i) => `${String(i).padStart(2, '0')}分`), '未知'];

// State
const currentIndices = ref([0, 0, 0, 0, 0]);
const yearList = ref<{label: string, value: number}[]>([]);
const monthList = ref<{label: string, value: number, isLeap: boolean, dayCount?: number}[]>([]);
const dayList = ref<{label: string, value: number}[]>([]);

// Data Generation Helpers
const generateYears = () => {
  const list = [];
  for (let i = startYear; i <= endYear; i++) {
    list.push({ label: `${i}年`, value: i });
  }
  yearList.value = list;
};

const generateMonths = (year: number) => {
  const list = [];
  if (internalMode.value === 'gregorian') {
    for (let i = 1; i <= 12; i++) {
      list.push({ label: `${String(i).padStart(2, '0')}月`, value: i, isLeap: false });
    }
  } else {
    // Lunar
    try {
      const lunarYear = LunarYear.fromYear(year);
      const months = lunarYear.getMonths().filter((m: any) => m.getYear() === year);
      
      for (const m of months) {
        const monthVal = Math.abs(m.getMonth());
        const isLeap = m.isLeap();
        // LunarUtil.MONTH array: ['', '正', '二', ...]
        const monthCn = LunarUtil.MONTH[monthVal];
        const label = isLeap ? `闰${monthCn}月` : `${monthCn}月`;
        
        list.push({ 
          label, 
          value: monthVal, 
          isLeap, 
          dayCount: m.getDayCount() 
        });
      }
    } catch (e) {
      console.error('Error generating lunar months:', e);
      // Fallback
      for (let i = 1; i <= 12; i++) {
         list.push({ label: `${i}月`, value: i, isLeap: false, dayCount: 30 });
      }
    }
  }
  monthList.value = list;
};

const generateDays = (year: number, month: number, isLeap: boolean) => {
  const list = [];
  let count = 0;
  
  if (internalMode.value === 'gregorian') {
    count = new Date(year, month, 0).getDate();
    for (let i = 1; i <= count; i++) {
      list.push({ label: `${String(i).padStart(2, '0')}日`, value: i });
    }
  } else {
    // Lunar
    const mObj = monthList.value.find(m => m.value === month && m.isLeap === isLeap);
    count = mObj && mObj.dayCount ? mObj.dayCount : 30; // fallback
    
    for (let i = 1; i <= count; i++) {
      // LunarUtil.DAY array: ['', '初一', '初二', ...]
      list.push({ label: LunarUtil.DAY[i], value: i });
    }
  }
  dayList.value = list;
};

// Initialization
generateYears();

const displayValue = computed(() => {
  if (!props.date) return '';
  const timeStr = props.time || '未知';
  const modeStr = props.mode === 'lunar' ? '农历' : '公历';
  
  // If Lunar, try to show Chinese date if possible, but keep it simple for now to avoid parsing errors
  // Ideally, if mode is Lunar, we should convert the YYYY-MM-DD back to Chinese text
  if (props.mode === 'lunar') {
      try {
          const [y, m, d] = props.date.split('-').map(Number);
          // Note: This naive display doesn't account for Leap months stored in YYYY-MM-DD
          // Ideally we store the display string separately or compute it more robustly.
          // For now, appending mode is sufficient.
          return `${props.date} ${timeStr} (${modeStr})`;
      } catch (e) {
          return `${props.date} ${timeStr} (${modeStr})`;
      }
  }
  
  return `${props.date} ${timeStr}`;
});

const closePicker = () => {
  show.value = false;
};

const updatePickerToDate = (y: number, m: number, d: number, isLeap: boolean = false, h: number = 12, min: number = 0) => {
    // Find Year Index
    let yIdx = yearList.value.findIndex(item => item.value === y);
    if (yIdx === -1) {
        // Default to 1990
        yIdx = yearList.value.findIndex(item => item.value === 1990);
    }
    
    // Regenerate Months for this year
    const targetYearVal = yearList.value[yIdx].value;
    generateMonths(targetYearVal);
    
    // Find Month Index
    let mIdx = -1;
    if (internalMode.value === 'gregorian') {
        mIdx = monthList.value.findIndex(item => item.value === m);
    } else {
        mIdx = monthList.value.findIndex(item => item.value === m && item.isLeap === isLeap);
        // Fallback if not found (e.g. leap not exist)
        if (mIdx === -1) mIdx = monthList.value.findIndex(item => item.value === m);
    }
    if (mIdx === -1) mIdx = 0;
    
    // Regenerate Days
    const targetMonthObj = monthList.value[mIdx];
    generateDays(targetYearVal, targetMonthObj.value, targetMonthObj.isLeap);
    
    // Find Day Index
    let dIdx = dayList.value.findIndex(item => item.value === d);
    if (dIdx === -1) dIdx = 0;
    
    // Time
    // Handle '未知' (unknown)
    let hIdx = h === -1 ? 24 : h; // -1 for unknown? Or just 24
    if (h >= 0 && h < 24) {
       hIdx = h;
    } else {
       hIdx = 24; // '未知' index
    }
    
    let minIdx = min === -1 ? 60 : min;
    if (min >= 0 && min < 60) {
        minIdx = min;
    } else {
        minIdx = 60; // '未知' index
    }
    
    currentIndices.value = [yIdx, mIdx, dIdx, hIdx, minIdx];
};

const switchMode = (newMode: string) => {
  if (internalMode.value === newMode) return;
  
  // Get current selected values
  const [yIdx, mIdx, dIdx, hIdx, minIdx] = currentIndices.value;
  const currentYear = yearList.value[yIdx].value;
  const currentMonthObj = monthList.value[mIdx];
  const currentDay = dayList.value[dIdx].value;
  
  // Preserve time
  const currentH = hIdx === 24 ? -1 : hIdx;
  const currentMin = minIdx === 60 ? -1 : minIdx;

  let targetYear = currentYear;
  let targetMonth = currentMonthObj.value;
  let targetDay = currentDay;
  let targetIsLeap = false;
  
  if (internalMode.value === 'gregorian' && newMode === 'lunar') {
    // Solar -> Lunar
    const solar = Solar.fromYmd(currentYear, currentMonthObj.value, currentDay);
    const lunar = solar.getLunar();
    targetYear = lunar.getYear();
    const rawMonth = lunar.getMonth();
    targetMonth = Math.abs(rawMonth);
    targetIsLeap = rawMonth < 0;
    targetDay = lunar.getDay();
    
  } else if (internalMode.value === 'lunar' && newMode === 'gregorian') {
    // Lunar -> Solar
    // Use targetIsLeap from current selection
    const isLeap = currentMonthObj.isLeap; 
    // Lunar.fromYmd(year, month, day) - if month is negative, it treats as leap
    const monthArg = isLeap ? -currentMonthObj.value : currentMonthObj.value;
    const lunar = Lunar.fromYmd(currentYear, monthArg, currentDay);
    const solar = lunar.getSolar();
    targetYear = solar.getYear();
    targetMonth = solar.getMonth();
    targetDay = solar.getDay();
    targetIsLeap = false;
  }
  
  internalMode.value = newMode;
  generateYears(); // Reset years
  updatePickerToDate(targetYear, targetMonth, targetDay, targetIsLeap, currentH, currentMin);
};

const onQuickInput = (e: any) => {
  // Just update value
};

const parseQuickInput = () => {
  const val = quickInput.value;
  if (!/^\d{12}$/.test(val)) {
    uni.showToast({ title: '格式错误，请输入12位数字', icon: 'none' });
    return;
  }
  const y = parseInt(val.substring(0, 4));
  const m = parseInt(val.substring(4, 6));
  const d = parseInt(val.substring(6, 8));
  const h = parseInt(val.substring(8, 10));
  const min = parseInt(val.substring(10, 12));
  
  if (m < 1 || m > 12 || d < 1 || d > 31 || h > 23 || min > 59) {
    uni.showToast({ title: '日期时间不合法', icon: 'none' });
    return;
  }
  
  internalMode.value = 'gregorian';
  updatePickerToDate(y, m, d, false, h, min);
  uni.showToast({ title: '已定位', icon: 'none' });
};

const updatePickerData = (yIdx: number, mIdx: number) => {
  const yearObj = yearList.value[yIdx];
  if (!yearObj) return mIdx;
  
  const year = yearObj.value;
  generateMonths(year);
  
  // Clamp mIdx
  let effectiveMIdx = mIdx;
  if (effectiveMIdx >= monthList.value.length) {
    effectiveMIdx = monthList.value.length - 1;
  }
  
  const monthObj = monthList.value[effectiveMIdx];
  generateDays(year, monthObj.value, monthObj.isLeap);
  
  return effectiveMIdx;
};

const onPickerChange = (e: any) => {
  const newIndices = e.detail.value;
  const [yIdx, mIdx] = newIndices;
  
  // Check if year/month changed
  if (yIdx !== currentIndices.value[0] || mIdx !== currentIndices.value[1]) {
    const effectiveMIdx = updatePickerData(yIdx, mIdx);
    
    // Update mIdx if it was clamped
    if (effectiveMIdx !== mIdx) {
      newIndices[1] = effectiveMIdx;
    }
    
    // Check day index bounds
    const dayCount = dayList.value.length;
    if (newIndices[2] >= dayCount) {
      newIndices[2] = dayCount - 1;
    }
  }
  
  currentIndices.value = newIndices;
};

const openPicker = () => {
  internalMode.value = props.mode || 'gregorian';
  show.value = true;
  
  // Initialize
  // If props.date is empty, default to 1990-01-01
  // If props.date is present, parse it.
  // If mode is Lunar, props.date is assumed to be Lunar Y-M-D (with potential ambiguity for leap).
  // But wait, if we only store "YYYY-MM-DD", we can't restore leap state perfectly.
  // Let's assume we pass non-leap by default if ambiguous.
  // Or: We should try to support reading `isLeap` from props if we added it.
  // But props definition is fixed string.
  // I'll parse Y-M-D.
  
  let y = 1990, m = 1, d = 1, h = 12, min = 0;
  
  if (props.date) {
    const parts = props.date.split('-').map(Number);
    if (parts.length === 3) {
      y = parts[0];
      m = parts[1];
      d = parts[2];
    }
  }
  
  if (props.time && props.time !== '未知') {
    const parts = props.time.split(':').map(Number);
    if (parts.length === 2) {
      h = parts[0];
      min = parts[1];
    }
  }
  
  // For Lunar, isLeap?
  // We don't have isLeap prop. So default false.
  updatePickerToDate(y, m, d, false, h, min);
};

const confirmPicker = () => {
  const [yIdx, mIdx, dIdx, hIdx, minIdx] = currentIndices.value;
  
  const yearObj = yearList.value[yIdx];
  const monthObj = monthList.value[mIdx];
  const dayObj = dayList.value[dIdx];
  
  const y = yearObj.value;
  const m = monthObj.value;
  const d = dayObj.value;
  
  // Format YYYY-MM-DD
  const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  
  let timeStr = '';
  if (hIdx === 24 || minIdx === 60) { // Unknown
      timeStr = '未知';
  } else {
      const hVal = hours[hIdx].replace('时', '');
      const minVal = minutes[minIdx].replace('分', '');
      timeStr = `${hVal}:${minVal}`;
  }
  
  // Emit
  emit('update:mode', internalMode.value);
  emit('update:date', dateStr);
  emit('update:time', timeStr);
  
  if (internalMode.value === 'lunar') {
    const lunarDateStr = `${yearObj.label}${monthObj.label}${dayObj.label}`;
    emit('lunar-date', lunarDateStr);
  }
  
  // If we wanted to support passing isLeap, we'd need another emit or encode it.
  // For now, simple YYYY-MM-DD.
  
  show.value = false;
};
</script>

<style lang="scss" scoped>
.date-time-picker {
  width: 100%;
}

.popup-container {
  width: 650rpx;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f3f4f6;
}

.btn-cancel {
  font-size: 32rpx;
  color: #9ca3af;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.btn-confirm {
  font-size: 32rpx;
  color: #5d5cde;
  font-weight: 600;
}

/* Mode Tabs - Capsule Style */
.mode-tabs {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 100rpx;
  padding: 6rpx;
  width: 240rpx; /* Fixed width for the switch */
}

.mode-tab {
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
  font-size: 26rpx;
  color: #64748b;
  border-radius: 100rpx;
  transition: all 0.3s ease;
  
  &.active {
    background-color: #ffffff;
    color: #000000;
    font-weight: 500;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
  }
}

/* Quick Input */
.quick-input-box {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx 0; /* Adjusted padding, removed background from container */
  gap: 16rpx;
  /* background-color: #f1f5f9; Removed container background */
  /* border-radius: 16rpx; Removed container radius */
}

.quick-input {
  flex: 1;
  height: 72rpx;
  background-color: #f3f4f6; /* Darker gray background for input */
  /* border: 1rpx solid #e2e8f0; Removed border for cleaner look */
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #334155;
}

.quick-btn {
  padding: 0 24rpx;
  height: 64rpx;
  line-height: 64rpx;
  background-color: #000000;
  color: #fff;
  font-size: 26rpx;
  border-radius: 12rpx;
  font-weight: 500;
  
  &:active {
    opacity: 0.8;
  }
}

.picker-view {
  width: 100%;
  height: 500rpx;
  background-color: #fff;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #374151;
}
</style>