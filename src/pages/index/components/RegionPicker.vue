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
import { ref, onMounted, watch } from 'vue'
import FormInput from '@/pages/index/components/FormInput.vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const selectedName = ref('')

watch(() => props.value, (newVal) => {
  selectedName.value = newVal || ''
}, { immediate: true })

const emit = defineEmits(['update:birthLocation'])

const onCityChange = (e) => {
  console.log('e', e);
  const value = e.detail.value;
  selectedName.value = value.join('');
  emit('update:birthLocation', selectedName.value);
}
</script>