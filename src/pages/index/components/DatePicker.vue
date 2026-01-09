<template>
  <div class="date-picker">
    
    <picker mode="date" :end="currentDate" @change="handleConfirm">
      <FormInput 
        :value="displayValue" 
        placeholder="请选择出生日期" 
        disabled
      >
      </FormInput>
    </picker>
    <!-- <u-picker 
      v-model="show" 
      mode="time"
      :default-value="defaultValue"
      :end-year="currentYear"
      confirm-color="#f59e0b"
      @confirm="handleConfirm"
    ></u-picker> -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FormInput from './FormInput.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const currentDate = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  return props.modelValue;
});

const handleConfirm = (event) => {
  const selectedDate = event.detail.value;
  emit('update:modelValue', selectedDate);
};
</script>

<style lang="scss" scoped>
.date-picker {
  width: 100%;
}
</style>
