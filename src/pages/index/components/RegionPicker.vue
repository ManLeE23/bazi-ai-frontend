<template>
  <picker mode="region" @change="onCityChange">
    <FormInput
      :value="selectedName"
      placeholder="选择出生地"
      disabled
    />
  </picker>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FormInput from '@/pages/index/components/FormInput.vue'

const selectedName = ref('')

const emit = defineEmits(['update:birthPlace'])

const onCityChange = (e) => {
  console.log('e', e);
  const value = e.detail.value;
  selectedName.value = value.join('');
  emit('update:birthPlace', selectedName.value);
}
</script>