<script setup>
import { computed } from 'vue'
const props = defineProps({ user: Object, store: Object })
const emit = defineEmits(['navigate','logout'])
const activeSession = computed(() => props.store.sessions.find(s => s.status==='open' && s.cashierId===props.user.id))
const sales = computed(() => activeSession.value ? props.store.sales.filter(s=>s.sessionId===activeSession.value.id && s.cashierId===props.user.id) : [])
const total = computed(() => sales.value.reduce((a,b)=>a+b.total,0))
</script>
<template>
  <div class="h-full overflow-y-auto p-4">
    <div class="flex justify-between items-start mb-5"><div><p class="text-xs text-[#7A6558]">Cajero rotativo</p><h1 class="font-display font-bold text-xl">{{ user.name }} {{ user.lastName }}</h1></div><button @click="emit('logout')" class="text-xs font-semibold text-[#C23B22]">Salir</button></div>
    <div v-if="activeSession" class="bg-[#2A6049] rounded-2xl p-4 text-white mb-4">
      <p class="text-xs text-white/70">Jornada actual</p><p class="font-bold">{{ activeSession.name }}</p><p class="text-xs text-white/70 mt-1">📍 {{ activeSession.address }}</p>
      <div class="grid grid-cols-2 gap-3 mt-4"><div class="bg-white/10 rounded-xl p-3"><p class="text-lg font-bold">{{ sales.length }}</p><p class="text-[10px] text-white/70">Ventas</p></div><div class="bg-white/10 rounded-xl p-3"><p class="text-lg font-bold">Bs {{ total.toFixed(2) }}</p><p class="text-[10px] text-white/70">Total</p></div></div>
    </div>
    <div v-else class="bg-[#FDE8E3] text-[#A52D18] rounded-2xl p-4 mb-4 text-sm">No existe una jornada activa asignada a este cajero.</div>
    <div class="grid gap-3">
      <button @click="emit('navigate','register-sale')" :disabled="!activeSession" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 text-left disabled:opacity-40"><span class="text-2xl">🛒</span><p class="font-semibold mt-1">Registrar venta</p><p class="text-xs text-[#7A6558]">Agregar uno o varios productos</p></button>
      <button @click="emit('navigate','sales-list')" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 text-left"><span class="text-2xl">📋</span><p class="font-semibold mt-1">Ventas registradas</p></button>
      <button @click="emit('navigate','ai-query')" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 text-left"><span class="text-2xl">🤖</span><p class="font-semibold mt-1">Consulta informativa</p></button>
    </div>
  </div>
</template>
