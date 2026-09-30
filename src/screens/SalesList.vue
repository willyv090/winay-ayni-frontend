<script setup>
import { computed, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import { money, formatDate } from '../utils/helpers.js'
const props=defineProps({store:Object,currentUser:Object})
const emit=defineEmits(['navigate'])
const sessionId=ref(''), method=ref('')
const isAdmin=computed(()=>props.currentUser.roles.includes('admin'))
const isCashier=computed(()=>props.currentUser.roles.includes('cashier'))
const visible=computed(()=>props.store.sales.filter(s=>{
  if(isCashier.value && s.cashierId!==props.currentUser.id)return false
  if(!isAdmin.value&&!isCashier.value){const own=s.items.some(i=>{const p=props.store.products.find(x=>x.id===i.productId);return p&&props.currentUser.businessIds.includes(p.businessId)});if(!own)return false}
  if(sessionId.value&&s.sessionId!==sessionId.value)return false
  if(method.value&&s.paymentMethod!==method.value)return false
  return true
}).sort((a,b)=>new Date(b.date)-new Date(a.date)))
const back=computed(()=>isAdmin.value?'admin-home':isCashier.value?'cashier-home':'entrepreneur-home')
</script>
<template>
<div class="h-full flex flex-col">
  <AppHeader title="Ventas registradas" show-back @back="emit('navigate',back)" />
  <div class="flex-1 overflow-y-auto p-4">
    <div class="grid grid-cols-2 gap-2 mb-4"><BaseSelect v-model="sessionId" label="Jornada" :options="store.sessions.map(s=>({value:s.id,label:s.name}))" placeholder="Todas"/><BaseSelect v-model="method" label="Método" :options="[{value:'efectivo',label:'Efectivo'},{value:'qr',label:'QR'},{value:'billetera',label:'Billetera móvil'}]" placeholder="Todos"/></div>
    <div v-if="visible.length===0" class="text-center text-sm text-[#7A6558] py-12">No existen ventas para los filtros seleccionados.</div>
    <button v-for="s in visible" :key="s.id" @click="emit('navigate','sale-detail',{saleId:s.id})" class="w-full text-left bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3">
      <div class="flex justify-between"><div><p class="font-semibold">Venta #{{s.id.slice(-6)}}</p><p class="text-xs text-[#7A6558]">{{formatDate(s.date)}}</p></div><strong class="text-[#2A6049]">{{money(s.total)}}</strong></div><p class="text-xs text-[#7A6558] mt-2">{{s.items.length}} producto(s) · {{s.paymentMethod==='billetera'?'Billetera móvil':s.paymentMethod.toUpperCase()}}</p>
    </button>
  </div>
</div>
</template>
