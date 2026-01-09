<template>
  <div class="interest-selector">
    <div class="options-grid">
      <CheckTag
        v-for="option in options"
        :key="option"
        :selected="modelValue.includes(option)"
        @update:selected="handleSelect(option)"
      >
        {{ option }}
      </CheckTag>
    </div>
    <slot name="helper"></slot>
  </div>
</template>

<script setup>
import CheckTag from '@/components/CheckTag.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const handleSelect = (option) => {
  const newSelected = [...props.modelValue]
  if (newSelected.includes(option)) {
    const index = newSelected.indexOf(option)
    newSelected.splice(index, 1)
  } else {
    newSelected.push(option)
  }
  emit('update:modelValue', newSelected)
}
</script>

<style lang="scss" scoped>
.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 10px;
}
</style>
