<script setup>
import { computed } from 'vue'
const props = defineProps({ variant: { type: String, default: 'primary' }, loading: Boolean, full: Boolean, disabled: Boolean, size: { type: String, default: 'md' } })
const classes = computed(() => {
  const variants = {
    primary: 'bg-[#2A6049] text-white', secondary: 'bg-[#E8DDD0] text-[#4A3728]', outline: 'border-2 border-[#2A6049] text-[#2A6049] bg-transparent', danger: 'bg-[#C23B22] text-white', ghost: 'bg-transparent text-[#2A6049]'
  }
  const sizes = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-12 px-6 text-base' }
  return `${variants[props.variant] || variants.primary} ${sizes[props.size]} ${props.full ? 'w-full' : ''}`
})
</script>
<template>
  <button :disabled="disabled || loading" class="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition active:scale-95 disabled:opacity-50" :class="classes">
    <span v-if="loading" class="spinner"></span><slot />
  </button>
</template>
