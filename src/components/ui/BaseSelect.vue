<script setup>
defineProps({ modelValue: [String, Number], label: String, error: String, options: { type: Array, default: () => [] }, placeholder: String, disabled: Boolean })
defineEmits(['update:modelValue'])
</script>
<template>
  <label class="flex flex-col gap-1">
    <span v-if="label" class="text-sm font-semibold text-[#1C1108]">{{ label }}</span>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)" :disabled="disabled" class="w-full h-11 rounded-xl border px-4 bg-white text-[#1C1108] outline-none" :class="error ? 'border-[#C23B22]' : 'border-[#D8CFC4] focus:border-[#2A6049]'">
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <span v-if="error" class="text-xs text-[#C23B22]">⚠ {{ error }}</span>
  </label>
</template>
