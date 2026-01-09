<template>
  <div class="time-select">
    <FormInput
      :value="displayValue"
      placeholder="请选择出生时辰"
      disabled
      @click="showPicker"
    />
    <u-picker
      mode="selector"
      :range="timeOptions"
      range-key="label"
      v-model="show"
      confirm-color="#f59e0b"
      :mask-close-able="false"
      @confirm="handleConfirm"
    >
    </u-picker>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FormInput from './FormInput.vue';

const timeOptions = [
  { label: '子时 (23:00-00:59)', value: '子时' },
  { label: '丑时 (01:00-02:59)', value: '丑时' },
  { label: '寅时 (03:00-04:59)', value: '寅时' },
  { label: '卯时 (05:00-06:59)', value: '卯时' },
  { label: '辰时 (07:00-08:59)', value: '辰时' },
  { label: '巳时 (09:00-10:59)', value: '巳时' },
  { label: '午时 (11:00-12:59)', value: '午时' },
  { label: '未时 (13:00-14:59)', value: '未时' },
  { label: '申时 (15:00-16:59)', value: '申时' },
  { label: '酉时 (17:00-18:59)', value: '酉时' },
  { label: '戌时 (19:00-20:59)', value: '戌时' },
  { label: '亥时 (21:00-22:59)', value: '亥时' },
];

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const show = ref(false);

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const selectedOption = timeOptions.find(option => option.value === props.modelValue);
  return selectedOption ? selectedOption.label : props.modelValue;
});

const showPicker = () => {
  show.value = true;
};

const handleConfirm = (event) => {
  const selectedIndex = event;
  const selectedTime = timeOptions[selectedIndex].value;
  emit('update:modelValue', selectedTime);
  show.value = false;
};
</script>

<style scoped>
.time-select {
  position: relative;
}

.select-field {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: #fff;
}
</style>
