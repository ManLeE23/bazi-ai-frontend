<template>
  <view class="region-picker">
    <view @click="openPicker">
      <slot></slot>
    </view>
    
    <u-popup v-model="show" mode="center" border-radius="32" :mask-close-able="false" :z-index="10090" width="650">
      <view class="popup-container">
        <view class="popup-header">
          <text class="btn-cancel" @click="show = false">取消</text>
          <text class="popup-title">选择出生地点</text>
          <text class="btn-confirm" @click="confirmPicker">确认</text>
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
</style>