<script setup>
import { computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { money, sessionSummary } from '../utils/helpers.js'
const props=defineProps({store:Object,currentUser:Object,sessionId:String})
const emit=defineEmits(['navigate'])
const session=computed(()=>props.store.sessions.find(s=>s.id===props.sessionId))
const summary=computed(()=>session.value?sessionSummary(props.store,session.value.id):null)
function bizName(id){return props.store.businesses.find(b=>b.id===id)?.name||'—'}
const productTotals=computed(()=>{const t={};summary.value?.sales.forEach(s=>s.items.forEach(i=>{if(!t[i.productId])t[i.productId]={qty:0,total:0};t[i.productId].qty+=i.quantity;t[i.productId].total+=i.subtotal}));return t})
</script>
<template>
<div class="h-full flex flex-col">
  <AppHeader title="Resultados de jornada" show-back @back="emit('navigate',currentUser.roles.includes('admin')?'sessions-list':'entrepreneur-home')" />
  <div v-if="!session||!summary" class="p-4 text-sm text-[#C23B22]">Jornada no encontrada.</div>
  <div v-else class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
    <div><p class="font-display font-bold text-lg">{{session.name}}</p><p class="text-xs text-[#7A6558]">{{session.startDate}} · {{session.address}}</p></div>
    <div class="grid grid-cols-3 gap-2"><div class="bg-white border border-[#D8CFC4] rounded-xl p-3 text-center"><p class="font-bold text-[#2A6049]">{{money(summary.total)}}</p><p class="text-[10px] text-[#7A6558]">Total</p></div><div class="bg-white border border-[#D8CFC4] rounded-xl p-3 text-center"><p class="font-bold">{{summary.sales.length}}</p><p class="text-[10px] text-[#7A6558]">Ventas</p></div><div class="bg-white border border-[#D8CFC4] rounded-xl p-3 text-center"><p class="font-bold">{{summary.units}}</p><p class="text-[10px] text-[#7A6558]">Unidades</p></div></div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-2">Por emprendimiento</p><div v-for="(v,id) in summary.byBusiness" :key="id" class="flex justify-between py-2 border-b border-[#EEE]"><span class="text-sm">{{bizName(id)}}</span><strong class="text-sm">{{money(v)}}</strong></div></div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-2">Por método de pago</p><div v-for="(v,k) in summary.byPayment" :key="k" class="flex justify-between py-2"><span class="text-sm capitalize">{{k==='billetera'?'Billetera móvil':k}}</span><strong class="text-sm">{{money(v)}}</strong></div></div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-2">Productos vendidos</p><div v-for="(v,id) in productTotals" :key="id" class="flex justify-between py-2 border-b border-[#EEE]"><div><p class="text-sm">{{store.products.find(p=>p.id===id)?.name}}</p><p class="text-xs text-[#7A6558]">{{v.qty}} unidades</p></div><strong class="text-sm">{{money(v.total)}}</strong></div></div>
    <div :class="summary.balanced?'bg-[#E6F5EF] text-[#1E6B47]':'bg-[#FDE8E3] text-[#A52D18]'" class="rounded-xl p-3 text-sm">{{summary.balanced?'✓ Totales cuadrados correctamente.':'⚠ Los totales no coinciden.'}}</div>
  </div>
</div>
</template>
