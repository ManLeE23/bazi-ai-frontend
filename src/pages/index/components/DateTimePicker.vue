<template>
  <div class="date-time-picker">
    <FormInput
      :value="displayValue"
      placeholder="请选择出生日期和时间"
      disabled
      @click="showPicker"
    />
    <u-picker
      mode="multiSelector"
      :range="pickerRange"
      v-model="show"
      confirm-color="#4f46e5"
      :default-selector="defaultSelector"
      :mask-close-able="false"
      :key="pickerKey"
      @columnchange="onColumnChange"
      @confirm="onConfirm"
    ></u-picker>
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
const pickerKey = ref(0);

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

const initialNow = new Date();
const initialYearStr = `${initialNow.getFullYear()}年`;
const initialMonthStr = `${String(initialNow.getMonth() + 1).padStart(2, '0')}月`;
const initialDayStr = `${String(initialNow.getDate()).padStart(2, '0')}日`;
const initialHourStr = `${String(initialNow.getHours()).padStart(2, '0')}时`;
const initialMinuteStr = `${String(initialNow.getMinutes()).padStart(2, '0')}分`;
updateDays(initialYearStr, initialMonthStr);

const pickerRange = computed(() => {
  return [years, months, days.value, hours, minutes];
});

const initialIndices = [
  Math.max(0, years.indexOf(initialYearStr)),
  Math.max(0, months.indexOf(initialMonthStr)),
  Math.max(0, days.value.indexOf(initialDayStr)),
  Math.max(0, hours.indexOf(initialHourStr)),
  Math.max(0, minutes.indexOf(initialMinuteStr)),
];
const defaultSelector = ref([...initialIndices]);
const currentIndices = ref([...initialIndices]);

const displayValue = computed(() => {
  if (!props.date) return '';
  if (!props.time || props.time === '未知') return props.date;
  return `${props.date} ${props.time}`;
});

const showPicker = () => {
  let yIndex = 0, mIndex = 0, dIndex = 0, hIndex = 0, minIndex = 0;
  
  const now = new Date();
  const currentYearStr = `${now.getFullYear()}年`;
  const currentMonthStr = `${String(now.getMonth() + 1).padStart(2, '0')}月`;
  const currentDayStr = `${String(now.getDate()).padStart(2, '0')}日`;

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
    // Default to Current Date
    yIndex = years.indexOf(currentYearStr);
    mIndex = months.indexOf(currentMonthStr);
    updateDays(currentYearStr, currentMonthStr);
    dIndex = days.value.indexOf(currentDayStr);
  }
  
  if (props.time) {
    if (props.time === '未知') {
      hIndex = hours.indexOf('未知');
      minIndex = minutes.indexOf('未知');
    } else {
      const parts = props.time.split(':');
      if (parts.length === 2) {
          const [h, min] = parts;
          hIndex = hours.indexOf(`${h}时`);
          minIndex = minutes.indexOf(`${min}分`);
      }
    }
  } else {
    const currentHourStr = `${String(now.getHours()).padStart(2, '0')}时`;
    const currentMinuteStr = `${String(now.getMinutes()).padStart(2, '0')}分`;
    hIndex = hours.indexOf(currentHourStr);
    minIndex = minutes.indexOf(currentMinuteStr);
  }
  
  // Safety checks
  yIndex = Math.max(0, yIndex);
  mIndex = Math.max(0, mIndex);
  dIndex = Math.max(0, dIndex);
  hIndex = Math.max(0, hIndex);
  minIndex = Math.max(0, minIndex);
  
  const indices = [yIndex, mIndex, dIndex, hIndex, minIndex];
  
  // Update current indices first
  currentIndices.value = [...indices];
  
  // Set default indices for u-picker
  defaultSelector.value = [...indices]; // Create new array to trigger reactivity
  
  console.log('Open Picker with indices:', indices);
  console.log('Date:', currentYearStr, currentMonthStr, currentDayStr);
  console.log('Time Index:', hIndex, minIndex);

  pickerKey.value += 1;
  show.value = true;
};

const onColumnChange = (e: any) => {
  const { column, index } = e;
  currentIndices.value[column] = index;
  
  // If year (0) or month (1) changes, update days (2)
  if (column === 0 || column === 1) {
    const year = years[currentIndices.value[0]];
    const month = months[currentIndices.value[1]];
    updateDays(year, month);
    
    // Check if current day index is out of bounds
    if (currentIndices.value[2] >= days.value.length) {
      currentIndices.value[2] = days.value.length - 1;
    }
  }
};

const onConfirm = (e: any) => {
  // u-picker with multiSelector returns an array of indices in e
  // Verify if e is array
  let indices = e;
  if (!Array.isArray(e)) {
    // Fallback if event structure is different (some versions return object)
    // But default uview behavior for multiSelector is array of indices
    // If it returns object with value/index, we handle it
    if (e && e.index) indices = e.index;
    else indices = currentIndices.value; // Fallback to tracked indices
  }

  const yStr = years[indices[0]].replace('年', '');
  const mStr = months[indices[1]].replace('月', '');
  // Ensure days array is correct for selection
  updateDays(`${yStr}年`, `${mStr}月`);
  // Re-clamp day index just in case
  const dIndex = Math.min(indices[2], days.value.length - 1);
  const dStr = days.value[dIndex].replace('日', '');
  
  const hStr = hours[indices[3]].replace('时', '');
  const minStr = minutes[indices[4]].replace('分', '');
  
  const dateStr = `${yStr}-${mStr}-${dStr}`;
  let timeStr = '';
  
  if (hStr === '未知' || minStr === '未知') {
    timeStr = '未知';
  } else {
    timeStr = `${hStr}:${minStr}`;
  }
  
  emit('update:date', dateStr);
  emit('update:time', timeStr);
};
</script>

<style lang="scss" scoped>
.date-time-picker {
  width: 100%;
}
</style>
