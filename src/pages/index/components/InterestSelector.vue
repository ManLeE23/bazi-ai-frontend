<template>
  <div class="interest-selector">
    <div class="options-grid">
      <CheckTag
        v-for="option in options"
        :key="option"
        :selected="modelValue === option"
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
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['change'])

const handleSelect = (option) => {
  // 如果当前选中项已经是该选项，则取消选择，否则选择该项
  const newValue = props.modelValue === option ? '' : option;
  emit('change', newValue)
}
</script>

<style lang="scss" scoped>
.options-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-top: 8px;
}
</style>
