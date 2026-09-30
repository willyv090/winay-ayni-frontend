<script setup>
defineProps({ modelValue: [String, Number], label: String, error: String, hint: String, type: { type: String, default: 'text' }, placeholder: String, min: [String, Number], max: [String, Number], step: [String, Number], disabled: Boolean })
defineEmits(['update:modelValue'])
</script>
<template>
  <label class="flex flex-col gap-1">
    <span v-if="label" class="text-sm font-semibold text-[#1C1108]">{{ label }}</span>
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :type="type" :placeholder="placeholder" :min="min" :max="max" :step="step" :disabled="disabled" class="w-full h-11 rounded-xl border px-4 text-[#1C1108] bg-white outline-none transition" :class="error ? 'border-[#C23B22] bg-[#FFF5F3]' : 'border-[#D8CFC4] focus:border-[#2A6049] focus:ring-2 focus:ring-[#2A6049]/20'" />
    <span v-if="error" class="text-xs text-[#C23B22]">⚠ {{ error }}</span>
    <span v-else-if="hint" class="text-xs text-[#7A6558]">{{ hint }}</span>
  </label>
</template>
