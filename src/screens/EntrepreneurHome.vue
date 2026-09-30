<script setup>
import { computed } from 'vue'
const props = defineProps({ user: Object, store: Object })
const emit = defineEmits(['navigate','logout'])
const businesses = computed(()=>props.store.businesses.filter(b=>props.user.businessIds.includes(b.id)))
const products = computed(()=>props.store.products.filter(p=>props.user.businessIds.includes(p.businessId)))
</script>
<template>
  <div class="h-full overflow-y-auto p-4">
    <div class="flex justify-between items-start mb-5"><div><p class="text-xs text-[#7A6558]">Usuario / Emprendedor</p><h1 class="font-display font-bold text-xl">{{ user.name }} {{ user.lastName }}</h1></div><button @click="emit('logout')" class="text-xs font-semibold text-[#C23B22]">Salir</button></div>
    <div class="bg-[#2A6049] rounded-2xl p-4 text-white mb-4"><p class="text-xs text-white/70">Mi información</p><p class="font-bold mt-1">{{ businesses[0]?.name || 'Sin emprendimiento asociado' }}</p><p class="text-xs text-white/70 mt-2">{{ products.filter(p=>p.active).length }} productos activos</p></div>
    <div class="grid grid-cols-2 gap-3">
      <button @click="emit('navigate','businesses-list')" class="bg-white rounded-2xl border border-[#D8CFC4] p-4 text-left"><span class="text-2xl">🏪</span><p class="font-semibold text-sm mt-2">Mi emprendimiento</p></button>
      <button @click="emit('navigate','products-list')" class="bg-white rounded-2xl border border-[#D8CFC4] p-4 text-left"><span class="text-2xl">📦</span><p class="font-semibold text-sm mt-2">Inventario</p></button>
      <button @click="emit('navigate','sales-list')" class="bg-white rounded-2xl border border-[#D8CFC4] p-4 text-left"><span class="text-2xl">📋</span><p class="font-semibold text-sm mt-2">Ventas</p></button>
      <button @click="emit('navigate','ai-query')" class="bg-white rounded-2xl border border-[#D8CFC4] p-4 text-left"><span class="text-2xl">🤖</span><p class="font-semibold text-sm mt-2">Consulta IA</p></button>
    </div>
  </div>
</template>
