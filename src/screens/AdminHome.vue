<script setup>
const props = defineProps({ user: Object, store: Object })
const emit = defineEmits(['navigate','logout'])
const cards = [
  ['users-list','👥','Usuarios','Registrar y administrar usuarios'],
  ['businesses-list','🏪','Emprendimientos','Gestionar emprendimientos'],
  ['products-list','📦','Productos e inventario','Productos, stock y movimientos'],
  ['sessions-list','📅','Jornadas','Crear jornadas y asignar cajero'],
  ['sales-list','🧾','Ventas','Consultar ventas registradas'],
  ['metrics','📊','Resultados y métricas','Totales, reportes y gráficos'],
  ['ai-query','🤖','Consulta informativa','Preguntas sobre productos e inventario']
]
</script>
<template>
  <div class="h-full overflow-y-auto p-4 screen-fade">
    <div class="flex items-center justify-between mb-5">
      <div><p class="text-xs text-[#7A6558]">Administrador</p><h1 class="font-display font-bold text-xl">Hola, {{ user.name }}</h1></div>
      <button @click="emit('logout')" class="text-xs font-semibold text-[#C23B22]">Salir</button>
    </div>
    <div class="bg-[#2A6049] rounded-2xl p-4 text-white mb-4">
      <p class="text-xs text-white/70">Resumen</p>
      <div class="grid grid-cols-3 gap-3 mt-2 text-center">
        <div><p class="font-bold text-lg">{{ store.businesses.filter(x=>x.active).length }}</p><p class="text-[10px] text-white/70">Emprend.</p></div>
        <div><p class="font-bold text-lg">{{ store.products.filter(x=>x.active).length }}</p><p class="text-[10px] text-white/70">Productos</p></div>
        <div><p class="font-bold text-lg">{{ store.sessions.filter(x=>x.status==='open').length }}</p><p class="text-[10px] text-white/70">Jornadas</p></div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 pb-4">
      <button v-for="c in cards" :key="c[0]" @click="emit('navigate',c[0])" class="bg-white rounded-2xl border border-[#D8CFC4] p-4 text-left active:scale-[.98]">
        <div class="text-2xl mb-2">{{ c[1] }}</div><p class="font-semibold text-sm">{{ c[2] }}</p><p class="text-[11px] text-[#7A6558] mt-1">{{ c[3] }}</p>
      </button>
    </div>
  </div>
</template>
