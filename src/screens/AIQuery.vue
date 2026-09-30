<script setup>
import { computed, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
const props=defineProps({store:Object,currentUser:Object})
const emit=defineEmits(['navigate'])
const input=ref(''), loading=ref(false)
const messages=ref([{role:'assistant',text:'Hola. Puedo responder preguntas sobre productos, disponibilidad e inventario registrado en el sistema.'}])
const back=computed(()=>props.currentUser.roles.includes('admin')?'admin-home':props.currentUser.roles.includes('cashier')?'cashier-home':'entrepreneur-home')
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function answer(q){
  const n=normalize(q); const scope=['producto','productos','stock','inventario','disponible','disponibilidad','reposicion','reposición','unidades','emprendimiento','codigo','código']
  if(!scope.some(w=>n.includes(normalize(w))))return 'La consulta debe estar relacionada con productos, disponibilidad o inventario.'
  const p=props.store.products.find(p=>n.includes(normalize(p.code))||n.includes(normalize(p.name)))
  const b=props.store.businesses.find(b=>n.includes(normalize(b.name)))
  if(p){const biz=props.store.businesses.find(b=>b.id===p.businessId);if(n.includes('stock')||n.includes('unidad')||n.includes('dispon'))return `${p.name} (${p.code}) tiene ${p.stock} unidades disponibles. Pertenece a ${biz?.name}.`;return `${p.name} (${p.code}) pertenece a ${biz?.name}, tiene un precio de Bs ${p.price.toFixed(2)}, rebaja de Bs ${p.discount.toFixed(2)} y stock actual de ${p.stock} unidades.`}
  if(b){const list=props.store.products.filter(p=>p.businessId===b.id&&p.active);if(!list.length)return `No existen productos activos registrados para ${b.name}.`;return `${b.name} tiene ${list.length} producto(s) activo(s): ${list.map(p=>`${p.name} (${p.stock} u.)`).join(', ')}.`}
  if(n.includes('repos')){const low=props.store.products.filter(p=>p.active&&p.stock<=5);return low.length?`Productos que podrían requerir reposición: ${low.map(p=>`${p.name} (${p.stock} u.)`).join(', ')}.`:'No hay productos activos con stock bajo.'}
  if(n.includes('inventario')||n.includes('productos')){const active=props.store.products.filter(p=>p.active);return `Actualmente hay ${active.length} productos activos registrados y ${active.reduce((a,p)=>a+p.stock,0)} unidades disponibles en total.`}
  return 'No se encontró información suficiente para responder esa consulta. Intente mencionar el nombre o código de un producto.'
}
async function submit(){const q=input.value.trim();if(!q){messages.value.push({role:'assistant',text:'Ingrese una pregunta.'});return}messages.value.push({role:'user',text:q});input.value='';loading.value=true;await new Promise(r=>setTimeout(r,450));messages.value.push({role:'assistant',text:answer(q)});loading.value=false}
</script>
<template>
<div class="h-full flex flex-col">
  <AppHeader title="Consulta informativa" show-back @back="emit('navigate',back)" />
  <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
    <div class="bg-[#F5F0E8] border border-[#D8CFC4] rounded-xl p-3 text-xs text-[#7A6558]">El asistente solo consulta información. No crea, edita ni elimina registros.</div>
    <div v-for="(m,i) in messages" :key="i" class="max-w-[86%] rounded-2xl px-4 py-3 text-sm" :class="m.role==='user'?'bg-[#2A6049] text-white self-end':'bg-white border border-[#D8CFC4] self-start'">{{m.text}}</div>
    <div v-if="loading" class="bg-white border border-[#D8CFC4] rounded-2xl px-4 py-3 text-sm self-start">Consultando información…</div>
  </div>
  <div class="border-t border-[#D8CFC4] bg-white p-3"><textarea v-model="input" @keydown.enter.exact.prevent="submit" rows="2" placeholder="¿Cuántas unidades quedan del producto X?" class="w-full rounded-xl border border-[#D8CFC4] px-3 py-2 text-sm resize-none"></textarea><div class="flex justify-between items-center mt-2"><p class="text-[10px] text-[#7A6558]">Productos, disponibilidad e inventario</p><BaseButton size="sm" @click="submit">Consultar</BaseButton></div></div>
</div>
</template>
