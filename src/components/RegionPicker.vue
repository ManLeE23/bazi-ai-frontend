<template>
  <view class="region-picker">
    <view @click="openPicker">
      <slot></slot>
    </view>
    
    <u-popup v-model="show" mode="center" border-radius="32" :mask-close-able="false" :z-index="10090" width="650">
      <view class="popup-container">
        <view class="popup-header">
          <text class="btn-cancel" @click="show = false">取消</text>
          <!-- <text class="popup-title">选择出生地点</text> -->
          <text class="btn-confirm" @click="confirmPicker">确认</text>
        </view>
        
        <!-- Quick Input -->
        <view class="quick-input-box">
          <input 
            class="quick-input"
            v-model="quickInput"
            placeholder="输入省市区(如广东省广州市荔湾区)"
            placeholder-style="color: #9ca3af; font-size: 26rpx;"
            confirm-type="search"
            @confirm="handleQuickInput"
          />
          <view class="quick-btn" @click="handleQuickInput">查询</view>
        </view>

        <picker-view 
          :value="currentIndices" 
          @change="onPickerChange" 
          class="picker-view" 
          indicator-style="height: 56px;"
        >
          <!-- Province Column -->
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in provinces" :key="index">{{item.label}}</view>
          </picker-view-column>
          
          <!-- City Column -->
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in currentCities" :key="index">{{item.label}}</view>
          </picker-view-column>
          
          <!-- Area Column -->
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in currentAreas" :key="index">{{item.label}}</view>
          </picker-view-column>
        </picker-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import provincesData from 'vk-uview-ui/libs/address/provinces.json';
import citysData from 'vk-uview-ui/libs/address/citys.json';
import areasData from 'vk-uview-ui/libs/address/areas.json';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const show = ref(false);
const currentIndices = ref([0, 0, 0]);
const quickInput = ref('');

// Data transformation
// The JSON files have {code, name} structure.
// We map them to standard objects for easier usage if needed, but using them directly is fine.

const provinces = provincesData.map(p => ({ label: p.name, value: p.code }));

const currentCities = computed(() => {
  const pIndex = currentIndices.value[0];
  const cities = citysData[pIndex] || [];
  return cities.map(c => ({ label: c.name, value: c.code }));
});

const currentAreas = computed(() => {
  const pIndex = currentIndices.value[0];
  const cIndex = currentIndices.value[1];
  // areasData is [provinceIndex][cityIndex] -> Array of areas
  const provinceAreas = areasData[pIndex] || [];
  const areas = provinceAreas[cIndex] || [];
  return areas.map(a => ({ label: a.name, value: a.code }));
});

const getShortName = (name: string) => {
  return name.replace(/(省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区|地区|自治州|盟|区|县|自治县|自治旗|林区|特区)$/g, '');
};

const handleQuickInput = () => {
  if (!quickInput.value.trim()) {
    uni.showToast({ title: '请输入出生地点', icon: 'none' });
  };
  
  const input = quickInput.value.trim().replace(/\s+/g, '');
  let remaining = input;
  let pIdx = -1;
  let cIdx = -1;
  let aIdx = -1;

  // 1. Find Province
  for (let i = 0; i < provincesData.length; i++) {
    const pName = provincesData[i].name;
    const pShort = getShortName(pName);
    
    if (remaining.startsWith(pName)) {
      pIdx = i;
      remaining = remaining.slice(pName.length);
      break;
    } else if (remaining.startsWith(pShort)) {
      pIdx = i;
      remaining = remaining.slice(pShort.length);
      break;
    }
  }

  if (pIdx === -1) {
    uni.showToast({ title: '未找到匹配省份', icon: 'none' });
    return;
  }

  // 2. Find City
  const cities = citysData[pIdx] || [];
  let foundCity = false;

  // 如果剩余字符串为空，提示输入城市
  if (!remaining) {
    uni.showToast({ title: '请输入城市', icon: 'none' });
    return;
  }

  for (let i = 0; i < cities.length; i++) {
    const cName = cities[i].name;
    const cShort = getShortName(cName);
    
    // Check for direct match
    if (remaining.startsWith(cName)) {
      cIdx = i;
      remaining = remaining.slice(cName.length);
      foundCity = true;
      break;
    } else if (remaining.startsWith(cShort)) {
      cIdx = i;
      remaining = remaining.slice(cShort.length);
      foundCity = true;
      break;
    }
  }

  // If no direct city match, check for "skipped" city (like 市辖区)
  if (!foundCity) {
    for (let i = 0; i < cities.length; i++) {
      const cName = cities[i].name;
      // Common skipped cities
      if (cName === '市辖区' || cName === '县' || cName === '省直辖县级行政单位') {
         // Try to find Area in this city
         const areas = (areasData[pIdx] || [])[i] || [];
         for (let j = 0; j < areas.length; j++) {
           const aName = areas[j].name;
           const aShort = getShortName(aName);
           
           if (remaining.startsWith(aName) || remaining.startsWith(aShort)) {
             cIdx = i;
             aIdx = j;
             foundCity = true; // Implicitly found city via area
             remaining = remaining.startsWith(aName) ? remaining.slice(aName.length) : remaining.slice(aShort.length);
             break;
           }
         }
      }
      if (foundCity) break;
    }
  }

  if (cIdx === -1) {
    uni.showToast({ title: '未找到匹配城市', icon: 'none' });
    return;
  }

  // 3. Find Area (if not already found via skip)
  if (aIdx === -1) {
     const areas = (areasData[pIdx] || [])[cIdx] || [];
     
     // 如果已经匹配了城市，但剩余字符串为空，提示输入区县
     if (!remaining) {
        uni.showToast({ title: '请输入区县', icon: 'none' });
        return;
     }

     for (let i = 0; i < areas.length; i++) {
       const aName = areas[i].name;
       const aShort = getShortName(aName);
       
       if (remaining.startsWith(aName)) {
         aIdx = i;
         break;
       } else if (remaining.startsWith(aShort)) {
         aIdx = i;
         break;
       }
     }
  }

  if (aIdx === -1) {
    uni.showToast({ title: '未找到匹配区县', icon: 'none' });
    return;
  }

  // Update indices
  currentIndices.value = [pIdx, cIdx, aIdx];
  
  uni.showToast({ title: '已定位', icon: 'none' });
};

const openPicker = () => {
  // If we want to restore previous selection based on modelValue, we'd need to parse the string
  // For now, we just open it. If modelValue is empty, it starts at 0,0,0.
  // Implementing reverse mapping from "Province City Area" string to indices is complex without codes.
  // We'll skip that for now unless necessary.
  show.value = true;
};

const onPickerChange = (e: any) => {
  const newIndices = e.detail.value;
  const [pIndex, cIndex, aIndex] = newIndices;
  const [oldP, oldC, oldA] = currentIndices.value;
  
  // Create a copy to modify
  let nextIndices = [...newIndices];

  if (pIndex !== oldP) {
    // Province changed, reset city and area
    nextIndices[1] = 0;
    nextIndices[2] = 0;
  } else if (cIndex !== oldC) {
    // City changed, reset area
    nextIndices[2] = 0;
  }
  
  // Bounds check (just in case)
  // Note: computed properties update reactively, but picker-view might need a tick or explicit index update
  // to prevent out-of-bounds if the new column is shorter.
  // However, UniApp picker-view usually handles this by clamping or we need to ensure indices are valid.
  
  // Check bounds for City
  const cities = citysData[nextIndices[0]] || [];
  if (nextIndices[1] >= cities.length) nextIndices[1] = Math.max(0, cities.length - 1);
  
  // Check bounds for Area
  const provinceAreas = areasData[nextIndices[0]] || [];
  const areas = provinceAreas[nextIndices[1]] || [];
  if (nextIndices[2] >= areas.length) nextIndices[2] = Math.max(0, areas.length - 1);

  currentIndices.value = nextIndices;
};

const confirmPicker = () => {
  const [pIdx, cIdx, aIdx] = currentIndices.value;
  
  const p = provinces[pIdx];
  const c = currentCities.value[cIdx];
  const a = currentAreas.value[aIdx];
  
  if (p && c && a) {
    const result = `${p.label}${c.label}${a.label}`; // No spaces to match native picker mode=region
    emit('update:modelValue', result);
    emit('change', { value: [p.label, c.label, a.label], code: [p.value, c.value, a.value] });
  }
  
  show.value = false;
};
</script>

<style lang="scss" scoped>
.region-picker {
  width: 100%;
}

.popup-container {
  background-color: #fff;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.btn-cancel, .btn-confirm {
  font-size: 16px;
  padding: 8px;
}

.btn-cancel {
  color: #94a3b8;
}

.btn-confirm {
  color: #4f46e5;
  font-weight: 600;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.picker-view {
  width: 100%;
  height: 250px;
}

.picker-item {
  line-height: 56px;
  text-align: center;
  font-size: 16px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

/* Quick Input */
.quick-input-box {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx 0;
  gap: 16rpx;
}

.quick-input {
  flex: 1;
  height: 72rpx;
  background-color: #f3f4f6;
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
</style>