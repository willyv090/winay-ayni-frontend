<script setup>
defineProps({ open: Boolean, title: String, message: String, confirmLabel: { type: String, default: 'Confirmar' }, danger: Boolean })
defineEmits(['confirm','cancel'])
</script>
<template>
  <div v-if="open" class="absolute inset-0 z-[90] bg-black/40 flex items-end p-4" @click.self="$emit('cancel')">
    <div class="bg-white rounded-2xl p-5 w-full shadow-xl">
      <h3 class="font-display font-bold text-lg text-[#1C1108]">{{ title }}</h3>
      <p class="text-sm text-[#7A6558] mt-2 whitespace-pre-line">{{ message }}</p>
      <div class="flex gap-3 mt-5">
        <button @click="$emit('cancel')" class="flex-1 h-11 rounded-xl bg-[#E8DDD0] text-[#4A3728] font-semibold">Cancelar</button>
        <button @click="$emit('confirm')" class="flex-1 h-11 rounded-xl text-white font-semibold" :class="danger ? 'bg-[#C23B22]' : 'bg-[#2A6049]'">{{ confirmLabel }}</button>
      </div>
    </div>
  </div>
</template>
