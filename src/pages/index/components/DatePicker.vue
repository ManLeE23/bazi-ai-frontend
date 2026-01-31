<template>
  <div class="date-picker">
    <picker mode="date" :value="modelValue" start="1900-01-01" end="2100-12-31" @change="handleConfirm">
      <FormInput 
        :value="modelValue" 
        placeholder="请选择出生日期" 
        disabled
      >
      </FormInput>
    </picker>
  </div>
</template>

<script setup>
import FormInput from './FormInput.vue';
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const handleConfirm = (event) => {
  const selectedDate = event.detail.value;
  emit('update:modelValue', selectedDate);
};
</script>

<style lang="scss" scoped>
.date-picker {
  width: 100%;
}

.picker-input {
  height: 48px;
  padding: 12px 16px;
  border: 1.5px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background-color: #fff;
  font-size: 14px;
  color: #1f2937;
}

.input-text {
  font-size: 14px;
  color: #1f2937;
}

.placeholder-text {
  font-size: 14px;
  color: #90a1b9;
}

.picker-input:active {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
</style>