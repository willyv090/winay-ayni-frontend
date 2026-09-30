<script setup>
defineProps({ message: String, type: { type: String, default: 'success' } })
</script>
<template>
  <div v-if="message" class="absolute z-[80] left-4 right-4 top-16 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg" :class="type==='error' ? 'bg-[#FDE8E3] text-[#A52D18]' : 'bg-[#E6F5EF] text-[#1E6B47]'">{{ message }}</div>
</template>
