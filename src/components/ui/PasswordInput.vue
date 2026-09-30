<script setup>
import { ref } from 'vue'
const props = defineProps({ modelValue: String, label: String, error: String, placeholder: String })
const emit = defineEmits(['update:modelValue'])
const show = ref(false)
</script>
<template>
  <label class="flex flex-col gap-1">
    <span class="text-sm font-semibold text-[#1C1108]">{{ label }}</span>
    <div class="relative">
      <input :value="modelValue" @input="emit('update:modelValue', $event.target.value)" :type="show ? 'text' : 'password'" :placeholder="placeholder" class="w-full h-11 rounded-xl border px-4 pr-12 bg-white outline-none" :class="error ? 'border-[#C23B22]' : 'border-[#D8CFC4] focus:border-[#2A6049]'" />
      <button type="button" @click="show=!show" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6558]">{{ show ? '🙈' : '👁' }}</button>
    </div>
    <span v-if="error" class="text-xs text-[#C23B22]">⚠ {{ error }}</span>
  </label>
</template>
