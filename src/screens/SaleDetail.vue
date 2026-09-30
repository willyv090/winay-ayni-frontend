<script setup>
import { computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { money, formatDate } from '../utils/helpers.js'
const props=defineProps({store:Object,currentUser:Object,saleId:String})
const emit=defineEmits(['navigate'])
const sale=computed(()=>props.store.sales.find(s=>s.id===props.saleId))
const session=computed(()=>props.store.sessions.find(s=>s.id===sale.value?.sessionId))
const cashier=computed(()=>props.store.users.find(u=>u.id===sale.value?.cashierId))
function product(id){return props.store.products.find(p=>p.id===id)}
function business(productId){const p=product(productId);return props.store.businesses.find(b=>b.id===p?.businessId)?.name||'—'}
</script>
<template>
<div class="h-full flex flex-col">
  <AppHeader :title="sale?`Venta #${sale.id.slice(-6)}`:'Detalle de venta'" show-back @back="emit('navigate','sales-list')" />
  <div v-if="!sale" class="p-4 text-sm text-[#C23B22]">Venta no encontrada.</div>
  <div v-else class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
    <div v-if="session?.status==='closed'" class="bg-[#F5F0E8] border border-[#D8CFC4] rounded-xl p-3 text-xs text-[#7A6558]">Esta venta pertenece a una jornada cerrada y ya no puede modificarse.</div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="text-xs text-[#7A6558]">Fecha y hora</p><p class="text-sm font-semibold">{{formatDate(sale.date)}}</p><p class="text-xs text-[#7A6558] mt-2">Jornada</p><p class="text-sm">{{session?.name}}</p><p class="text-xs text-[#7A6558] mt-2">Cajero</p><p class="text-sm">{{cashier?.name}} {{cashier?.lastName}}</p><p class="text-xs text-[#7A6558] mt-2">Método</p><p class="text-sm capitalize">{{sale.paymentMethod==='billetera'?'Billetera móvil':sale.paymentMethod}}</p></div>
    <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-2">Productos</p><div v-for="i in sale.items" :key="i.productId" class="py-3 border-b border-[#EEE] last:border-0"><div class="flex justify-between"><div><p class="text-sm font-medium">{{product(i.productId)?.name}}</p><p class="text-xs text-[#7A6558]">{{business(i.productId)}} · {{product(i.productId)?.code}}</p></div><strong class="text-sm">{{money(i.subtotal)}}</strong></div><p class="text-xs text-[#7A6558] mt-1">{{i.quantity}} × {{money(i.unitPrice)}} <span v-if="i.discount">· rebaja {{money(i.discount)}}</span></p></div></div>
    <div class="bg-[#2A6049] text-white rounded-2xl p-4 flex justify-between items-center"><span>Total</span><strong class="text-2xl">{{money(sale.total)}}</strong></div>
  </div>
</div>
</template>
