<script setup>
defineProps({ modelValue: String, label: String, error: String, placeholder: String, rows: { type: Number, default: 3 } })
defineEmits(['update:modelValue'])
</script>
<template>
  <label class="flex flex-col gap-1">
    <span v-if="label" class="text-sm font-semibold text-[#1C1108]">{{ label }}</span>
    <textarea :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :rows="rows" :placeholder="placeholder" class="w-full rounded-xl border px-4 py-3 bg-white outline-none resize-none" :class="error ? 'border-[#C23B22]' : 'border-[#D8CFC4] focus:border-[#2A6049]'" />
    <span v-if="error" class="text-xs text-[#C23B22]">⚠ {{ error }}</span>
  </label>
</template>
