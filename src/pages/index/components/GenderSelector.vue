<template>
  <div class="gender-selector">
    <CheckTag
      v-for="option in options"
      :key="option"
      :selected="modelValue === option"
      @update:selected="handleSelect(option)"
    >
      {{ option }}
    </CheckTag>
  </div>
</template>

<script setup>
import CheckTag from '@/components/CheckTag.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => ['男', '女']
  }
})

const emit = defineEmits(['update:modelValue'])

const handleSelect = (option) => {
  emit('update:modelValue', option === props.modelValue ? '' : option)
}
</script>

<style lang="scss" scoped>
.gender-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
</style>
