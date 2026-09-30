<script setup>
import { computed, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import { money } from '../utils/helpers.js'
const props=defineProps({store:Object,currentUser:Object})
const emit=defineEmits(['navigate'])
const sessionId=ref(''), businessId=ref('')
const filteredSales=computed(()=>props.store.sales.filter(s=>{
  if(sessionId.value&&s.sessionId!==sessionId.value)return false
  if(businessId.value){return s.items.some(i=>props.store.products.find(p=>p.id===i.productId)?.businessId===businessId.value)}
  return true
}))
const total=computed(()=>filteredSales.value.reduce((a,b)=>a+b.total,0))
const businessTotals=computed(()=>{const t={};filteredSales.value.forEach(s=>s.items.forEach(i=>{const p=props.store.products.find(x=>x.id===i.productId);if(!p)return;if(businessId.value&&p.businessId!==businessId.value)return;t[p.businessId]=(t[p.businessId]||0)+i.subtotal}));return t})
const productTotals=computed(()=>{const t={};filteredSales.value.forEach(s=>s.items.forEach(i=>{const p=props.store.products.find(x=>x.id===i.productId);if(!p)return;if(businessId.value&&p.businessId!==businessId.value)return;t[i.productId]=(t[i.productId]||0)+i.quantity}));return t})
const topBusiness=computed(()=>Object.entries(businessTotals.value).sort((a,b)=>b[1]-a[1])[0])
const topProduct=computed(()=>Object.entries(productTotals.value).sort((a,b)=>b[1]-a[1])[0])
const maxBusiness=computed(()=>Math.max(1,...Object.values(businessTotals.value)))
const paymentTotals=computed(()=>{const t={efectivo:0,qr:0,billetera:0};filteredSales.value.forEach(s=>t[s.paymentMethod]+=s.total);return t})
</script>
<template>
<div class="h-full flex flex-col">
  <AppHeader title="Métricas" show-back @back="emit('navigate','admin-home')" />
  <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-2"><BaseSelect v-model="sessionId" label="Jornada" :options="store.sessions.map(s=>({value:s.id,label:s.name}))" placeholder="Todas"/><BaseSelect v-model="businessId" label="Emprendimiento" :options="store.businesses.map(b=>({value:b.id,label:b.name}))" placeholder="Todos"/></div>
    <div class="grid grid-cols-2 gap-3"><div class="bg-[#2A6049] text-white rounded-2xl p-4"><p class="text-[10px] text-white/70">Total vendido</p><p class="font-bold text-xl">{{money(total)}}</p></div><div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="text-[10px] text-[#7A6558]">Número de ventas</p><p class="font-bold text-xl">{{filteredSales.length}}</p></div><div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="text-[10px] text-[#7A6558]">Emprendimiento líder</p><p class="font-semibold text-sm">{{topBusiness?store.businesses.find(b=>b.id===topBusiness[0])?.name:'Sin datos'}}</p></div><div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="text-[10px] text-[#7A6558]">Producto más vendido</p><p class="font-semibold text-sm">{{topProduct?store.products.find(p=>p.id===topProduct[0])?.name:'Sin datos'}}</p></div></div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-3">Ventas por emprendimiento</p><div v-for="(v,id) in businessTotals" :key="id" class="mb-3"><div class="flex justify-between text-xs mb-1"><span>{{store.businesses.find(b=>b.id===id)?.name}}</span><strong>{{money(v)}}</strong></div><div class="h-3 bg-[#F0E9DF] rounded-full overflow-hidden"><div class="h-full bg-[#2A6049] rounded-full" :style="{width:`${(v/maxBusiness)*100}%`}"></div></div></div></div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-3">Ventas por método de pago</p><div class="grid grid-cols-3 gap-2"><div v-for="(v,k) in paymentTotals" :key="k" class="bg-[#F5F0E8] rounded-xl p-3 text-center"><p class="text-[10px] text-[#7A6558] capitalize">{{k==='billetera'?'Billetera':k}}</p><p class="font-bold text-sm">{{money(v)}}</p></div></div></div>
  </div>
</div>
</template>
