<template>
  <div class="date-time-picker">
    <FormInput
      :value="displayValue"
      placeholder="请选择出生日期和时间"
      disabled
      @click="openPicker"
    />
    <u-popup v-model="show" mode="center" border-radius="32" :mask-close-able="false" :z-index="10090" width="650">
      <view class="popup-container">
        <view class="popup-header">
          <text class="btn-cancel" @click="show = false">取消</text>
          <text class="popup-title">选择出生日期与时间</text>
          <text class="btn-confirm" @click="confirmPicker">确认</text>
        </view>
        <picker-view 
          :value="currentIndices" 
          @change="onPickerChange" 
          class="picker-view" 
          indicator-style="height: 56px;"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in years" :key="index">{{item}}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in months" :key="index">{{item}}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in days" :key="index">{{item}}</view>
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

const props = defineProps({
  date: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:date', 'update:time']);

const show = ref(false);

// Generate ranges
const startYear = 1900;
const endYear = 2100;
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => `${startYear + i}年`);
const months = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
const hours = [...Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}时`), '未知'];
const minutes = [...Array.from({ length: 60 }, (_, i) => `${String(i).padStart(2, '0')}分`), '未知'];

const days = ref<string[]>([]);

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const updateDays = (yearStr: string, monthStr: string) => {
  const y = parseInt(yearStr);
  const m = parseInt(monthStr);
  const daysCount = getDaysInMonth(y, m);
  days.value = Array.from({ length: daysCount }, (_, i) => `${String(i + 1).padStart(2, '0')}日`);
};

// Initial days (default)
updateDays('1990年', '01月');

const currentIndices = ref([0, 0, 0, 0, 0]);

const displayValue = computed(() => {
  if (!props.date) return '';
  const t = props.time || '未知';
  return `${props.date} ${t}`;
});

const openPicker = () => {
  let yIndex = 0, mIndex = 0, dIndex = 0, hIndex = 0, minIndex = 0;
  
  const now = new Date();
  // Default to 1990-01-01 12:00 if no value
  let targetDate = props.date ? new Date(props.date) : new Date(1990, 0, 1);
  
  if (props.date) {
    const [y, m, d] = props.date.split('-');
    yIndex = years.indexOf(`${y}年`);
    mIndex = months.indexOf(`${m}月`);
    
    // Update days for the selected year/month
    if (yIndex !== -1 && mIndex !== -1) {
       updateDays(`${y}年`, `${m}月`);
       dIndex = days.value.indexOf(`${d}日`);
    }
  } else {
    // Default 1990
    yIndex = years.indexOf('1990年');
    mIndex = 0;
    updateDays('1990年', '01月');
    dIndex = 0;
  }
  
  if (props.time && props.time !== '未知') {
    const [h, min] = props.time.split(':');
    hIndex = hours.indexOf(`${h}时`);
    minIndex = minutes.indexOf(`${min}分`);
  } else {
    hIndex = hours.indexOf('12时');
    minIndex = minutes.indexOf('00分');
  }

  // Safe check indices
  yIndex = Math.max(0, yIndex);
  mIndex = Math.max(0, mIndex);
  dIndex = Math.max(0, dIndex);
  hIndex = Math.max(0, hIndex);
  minIndex = Math.max(0, minIndex);

  currentIndices.value = [yIndex, mIndex, dIndex, hIndex, minIndex];
  show.value = true;
};

const onPickerChange = (e: any) => {
  const newIndices = e.detail.value;
  
  // Check if year or month changed to update days
  if (newIndices[0] !== currentIndices.value[0] || newIndices[1] !== currentIndices.value[1]) {
    const year = years[newIndices[0]];
    const month = months[newIndices[1]];
    updateDays(year, month);
    
    // If previous day index is out of bounds for new month, adjust it
    if (newIndices[2] >= days.value.length) {
      newIndices[2] = days.value.length - 1;
    }
  }
  
  currentIndices.value = newIndices;
};

const confirmPicker = () => {
  const [yIdx, mIdx, dIdx, hIdx, minIdx] = currentIndices.value;
  
  const yStr = years[yIdx].replace('年', '');
  const mStr = months[mIdx].replace('月', '');
  const dStr = days.value[dIdx].replace('日', '');
  
  const hVal = hours[hIdx];
  const minVal = minutes[minIdx];
  
  const dateStr = `${yStr}-${mStr}-${dStr}`;
  let timeStr = '';
  
  if (hVal === '未知' || minVal === '未知') {
    timeStr = '未知';
  } else {
    const hStr = hVal.replace('时', '');
    const minStr = minVal.replace('分', '');
    timeStr = `${hStr}:${minStr}`;
  }
  
  emit('update:date', dateStr);
  emit('update:time', timeStr);
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