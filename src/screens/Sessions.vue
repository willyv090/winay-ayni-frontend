<script setup>
import { computed, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import AppModal from '../components/ui/AppModal.vue'
import ToastMessage from '../components/ui/ToastMessage.vue'
import { genId, money, sessionSummary } from '../utils/helpers.js'

const props=defineProps({store:Object,currentUser:Object})
const emit=defineEmits(['navigate'])
const view=ref('list'), selected=ref(null), filter=ref('todas'), dateFilter=ref(''), toast=ref(''), confirmChange=ref(false), confirmClose=ref(false)
const errors=reactive({}), cashierErrors=reactive({})
const form=reactive({name:'',address:'',startDate:'',endDate:'',cashierId:''})
const selectedProductIds=ref([]), productBusiness=ref('')
const cashierForm=reactive({newCashierId:'',reason:''})
const cashiers=computed(()=>props.store.users.filter(u=>u.active&&u.roles.includes('cashier')))
const filtered=computed(()=>props.store.sessions.filter(s=>{const state=filter.value==='todas'||(filter.value==='abiertas'?s.status==='open':s.status==='closed');const date=!dateFilter.value||s.startDate===dateFilter.value;return state&&date}))
function notify(m){toast.value=m;setTimeout(()=>toast.value='',1800)}
function clear(obj){Object.keys(obj).forEach(k=>delete obj[k])}
function openNew(){Object.assign(form,{name:'',address:'',startDate:'',endDate:'',cashierId:''});clear(errors);view.value='form'}
function validateSession(){clear(errors);if(!form.name.trim())errors.name='Este campo es obligatorio';if(!form.address.trim())errors.address='Este campo es obligatorio';if(!form.startDate)errors.startDate='Este campo es obligatorio';if(!form.endDate)errors.endDate='Este campo es obligatorio';else if(form.startDate&&form.endDate<form.startDate)errors.endDate='La fecha de finalización no puede ser anterior a la fecha de inicio';if(!form.cashierId)errors.cashierId='Seleccione un cajero responsable';const c=props.store.users.find(u=>u.id===form.cashierId);if(form.cashierId&&(!c||!c.active||!c.roles.includes('cashier')))errors.cashierId='El usuario seleccionado no se encuentra habilitado como cajero';return Object.keys(errors).length===0}
function saveSession(){if(!validateSession())return;props.store.sessions.push({id:genId('s'),name:form.name.trim(),address:form.address.trim(),startDate:form.startDate,endDate:form.endDate,cashierId:form.cashierId,previousCashierIds:[],productIds:[],status:'open'});notify('Jornada creada correctamente');view.value='list'}
function openDetail(s){selected.value=s;view.value='detail'}
function openProducts(){selectedProductIds.value=[...selected.value.productIds];productBusiness.value='';view.value='products'}
function saveProducts(){selected.value.productIds=[...new Set(selectedProductIds.value)];notify('Productos de la jornada actualizados correctamente');view.value='detail'}
function validateCashier(){clear(cashierErrors);if(selected.value.status==='closed')cashierErrors.general='No se puede modificar el cajero de una jornada cerrada';if(!cashierForm.newCashierId)cashierErrors.newCashierId='Seleccione un nuevo cajero';else if(cashierForm.newCashierId===selected.value.cashierId)cashierErrors.newCashierId='Seleccione un cajero diferente al actual';if(!cashierForm.reason.trim())cashierErrors.reason='Ingrese el motivo del cambio';return Object.keys(cashierErrors).length===0}
function requestCashierChange(){if(validateCashier())confirmChange.value=true}
function applyCashierChange(){const old=selected.value.cashierId;selected.value.previousCashierIds.push({cashierId:old,newCashierId:cashierForm.newCashierId,reason:cashierForm.reason.trim(),changedAt:new Date().toISOString()});selected.value.cashierId=cashierForm.newCashierId;confirmChange.value=false;notify('Cajero actualizado correctamente');view.value='detail'}
function openCashier(){Object.assign(cashierForm,{newCashierId:'',reason:''});clear(cashierErrors);view.value='cashier'}
const currentSummary=computed(()=>selected.value?sessionSummary(props.store,selected.value.id):null)
const closeIssues=computed(()=>{if(!selected.value)return[];const list=[];if(!selected.value.cashierId)list.push('La jornada no tiene cajero responsable.');if(selected.value.productIds.length===0)list.push('La jornada no tiene productos configurados.');if(!currentSummary.value?.balanced)list.push('Los totales por emprendimiento no coinciden con el total general.');return list})
function closeSession(){if(closeIssues.value.length)return;selected.value.status='closed';selected.value.closedAt=new Date().toISOString();confirmClose.value=false;notify('Jornada cerrada correctamente');emit('navigate','session-results',{sessionId:selected.value.id})}
function businessName(id){return props.store.businesses.find(b=>b.id===id)?.name||'—'}
function cashierName(id){const u=props.store.users.find(x=>x.id===id);return u?`${u.name} ${u.lastName}`:'—'}
const configuredProducts=computed(()=>selected.value?props.store.products.filter(p=>selected.value.productIds.includes(p.id)):[])
const availableProducts=computed(()=>props.store.products.filter(p=>(!productBusiness.value||p.businessId===productBusiness.value)&&p.active))
</script>
<template>
<div class="h-full flex flex-col relative">
  <ToastMessage :message="toast" />
  <AppModal :open="confirmChange" title="Confirmar cambio de cajero" :message="`El cajero responsable cambiará de ${cashierName(selected?.cashierId)} a ${cashierName(cashierForm.newCashierId)}.\nMotivo: ${cashierForm.reason}\n¿Desea continuar?`" confirm-label="Confirmar cambio" @cancel="confirmChange=false" @confirm="applyCashierChange" />
  <AppModal :open="confirmClose" title="¿Cerrar jornada?" message="Después del cierre, los resultados serán definitivos y las ventas de la jornada no podrán modificarse." confirm-label="Cerrar jornada" danger @cancel="confirmClose=false" @confirm="closeSession" />

  <template v-if="view==='form'">
    <AppHeader title="Nueva jornada" show-back @back="view='list'" />
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <BaseInput v-model="form.name" label="Nombre *" :error="errors.name" placeholder="Feria Artesanal Octubre" />
      <BaseInput v-model="form.address" label="Dirección *" :error="errors.address" placeholder="Plaza Abaroa" />
      <BaseInput v-model="form.startDate" label="Fecha inicio *" type="date" :error="errors.startDate" />
      <BaseInput v-model="form.endDate" label="Fecha fin *" type="date" :error="errors.endDate" />
      <BaseSelect v-model="form.cashierId" label="Cajero responsable *" :options="cashiers.map(u=>({value:u.id,label:`${u.name} ${u.lastName}`}))" placeholder="Seleccione un cajero" :error="errors.cashierId" />
      <div class="flex gap-3"><BaseButton full variant="secondary" @click="view='list'">Cancelar</BaseButton><BaseButton full @click="saveSession">Crear jornada</BaseButton></div>
    </div>
  </template>

  <template v-else-if="view==='products' && selected">
    <AppHeader title="Configurar productos" show-back @back="view='detail'" />
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <BaseSelect v-model="productBusiness" label="Emprendimiento" :options="store.businesses.filter(b=>b.active).map(b=>({value:b.id,label:b.name}))" placeholder="Todos los emprendimientos" />
      <div v-if="availableProducts.length===0" class="text-center text-sm text-[#7A6558] py-10">No existen productos disponibles para este emprendimiento.</div>
      <label v-for="p in availableProducts" :key="p.id" class="bg-white border rounded-xl p-3 flex items-center gap-3" :class="selectedProductIds.includes(p.id)?'border-[#2A6049] bg-[#E6F5EF]':'border-[#D8CFC4]'">
        <input type="checkbox" :checked="selectedProductIds.includes(p.id)" @change="$event.target.checked?selectedProductIds.push(p.id):selectedProductIds=selectedProductIds.filter(id=>id!==p.id)" class="accent-[#2A6049]" />
        <div class="flex-1"><p class="text-sm font-semibold">{{p.name}}</p><p class="text-xs text-[#7A6558]">{{p.code}} · {{businessName(p.businessId)}} · Stock {{p.stock}}</p></div><p class="text-sm font-bold">{{money(p.price-p.discount)}}</p>
      </label>
      <div class="flex gap-3 mt-2"><BaseButton full variant="secondary" @click="view='detail'">Cancelar</BaseButton><BaseButton full @click="saveProducts">Guardar selección</BaseButton></div>
    </div>
  </template>

  <template v-else-if="view==='cashier' && selected">
    <AppHeader title="Cambiar cajero" show-back @back="view='detail'" />
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div class="bg-white border border-[#D8CFC4] rounded-xl p-4"><p class="text-xs text-[#7A6558]">Cajero actual</p><p class="font-semibold">{{cashierName(selected.cashierId)}}</p></div>
      <div v-if="cashierErrors.general" class="bg-[#FDE8E3] text-[#A52D18] rounded-xl p-3 text-sm">⚠ {{cashierErrors.general}}</div>
      <BaseSelect v-model="cashierForm.newCashierId" label="Nuevo cajero *" :options="cashiers.filter(u=>u.id!==selected.cashierId).map(u=>({value:u.id,label:`${u.name} ${u.lastName}`}))" placeholder="Seleccione un cajero" :error="cashierErrors.newCashierId" />
      <BaseInput v-model="cashierForm.reason" label="Motivo del cambio *" :error="cashierErrors.reason" placeholder="Ej.: El cajero anterior tuvo que retirarse" />
      <div class="flex gap-3"><BaseButton full variant="secondary" @click="view='detail'">Cancelar</BaseButton><BaseButton full @click="requestCashierChange">Continuar</BaseButton></div>
    </div>
  </template>

  <template v-else-if="view==='close' && selected && currentSummary">
    <AppHeader title="Resumen previo al cierre" show-back @back="view='detail'" />
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div class="bg-[#2A6049] text-white rounded-2xl p-4"><p class="text-xs text-white/70">Total general</p><p class="font-display font-bold text-3xl">{{money(currentSummary.total)}}</p><p class="text-xs text-white/70 mt-1">{{currentSummary.sales.length}} ventas · {{currentSummary.units}} unidades</p></div>
      <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-3">Total por emprendimiento</p><div v-for="(v,bid) in currentSummary.byBusiness" :key="bid" class="flex justify-between py-2 border-b border-[#EEE]"><span class="text-sm">{{businessName(bid)}}</span><strong class="text-sm">{{money(v)}}</strong></div><div v-if="Object.keys(currentSummary.byBusiness).length===0" class="text-xs text-[#7A6558]">Sin ventas registradas.</div></div>
      <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold text-sm mb-3">Por método de pago</p><div v-for="(v,k) in currentSummary.byPayment" :key="k" class="flex justify-between py-1.5 text-sm"><span class="capitalize">{{k==='billetera'?'Billetera móvil':k}}</span><strong>{{money(v)}}</strong></div></div>
      <div v-if="currentSummary.balanced" class="bg-[#E6F5EF] text-[#1E6B47] rounded-xl p-3 text-sm">✓ El total general cuadra con la suma de los emprendimientos.</div>
      <div v-if="closeIssues.length" class="bg-[#FDE8E3] text-[#A52D18] rounded-xl p-3 text-sm"><p class="font-semibold mb-1">No se puede cerrar todavía:</p><p v-for="i in closeIssues" :key="i">• {{i}}</p></div>
      <BaseButton full variant="danger" :disabled="closeIssues.length>0" @click="confirmClose=true">Cerrar jornada</BaseButton>
    </div>
  </template>

  <template v-else-if="view==='detail' && selected">
    <AppHeader :title="selected.name" show-back @back="view='list'" />
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><div class="flex justify-between"><p class="font-semibold">Información de la jornada</p><span class="text-[10px] px-2 py-1 rounded-full" :class="selected.status==='open'?'bg-[#E6F5EF] text-[#1E6B47]':'bg-[#EEE] text-[#666]'">{{selected.status==='open'?'Abierta':'Cerrada'}}</span></div><p class="text-sm mt-2">📍 {{selected.address}}</p><p class="text-sm">📅 {{selected.startDate}} → {{selected.endDate}}</p><p class="text-sm">👤 {{cashierName(selected.cashierId)}}</p></div>
      <div class="grid grid-cols-2 gap-3"><div class="bg-white border border-[#D8CFC4] rounded-xl p-3 text-center"><p class="font-bold text-[#2A6049]">{{money(currentSummary.total)}}</p><p class="text-xs text-[#7A6558]">Total ventas</p></div><div class="bg-white border border-[#D8CFC4] rounded-xl p-3 text-center"><p class="font-bold">{{currentSummary.sales.length}}</p><p class="text-xs text-[#7A6558]">Transacciones</p></div></div>
      <div v-if="selected.status==='open'" class="grid gap-2"><BaseButton full @click="openProducts">📦 Configurar productos</BaseButton><BaseButton full variant="outline" @click="openCashier">🔄 Cambiar cajero</BaseButton><BaseButton full variant="danger" @click="view='close'">🔒 Revisar y cerrar jornada</BaseButton></div>
      <BaseButton v-else full @click="emit('navigate','session-results',{sessionId:selected.id})">📊 Ver resultados</BaseButton>
      <div><p class="text-xs font-semibold text-[#7A6558] mb-2">Productos habilitados ({{configuredProducts.length}})</p><div v-if="!configuredProducts.length" class="text-sm text-[#7A6558]">Sin productos configurados.</div><div v-for="p in configuredProducts" :key="p.id" class="flex justify-between py-2 border-b border-[#D8CFC4]"><div><p class="text-sm font-medium">{{p.name}}</p><p class="text-xs text-[#7A6558]">{{businessName(p.businessId)}} · Stock {{p.stock}}</p></div><strong class="text-sm">{{money(p.price-p.discount)}}</strong></div></div>
      <div v-if="selected.previousCashierIds.length"><p class="text-xs font-semibold text-[#7A6558] mb-2">Historial de cambios de cajero</p><div v-for="h in selected.previousCashierIds" :key="h.changedAt" class="bg-white border border-[#D8CFC4] rounded-xl p-3 mb-2 text-xs"><p><strong>{{cashierName(h.cashierId)}}</strong> → <strong>{{cashierName(h.newCashierId)}}</strong></p><p class="text-[#7A6558]">{{h.reason}}</p></div></div>
    </div>
  </template>

  <template v-else>
    <AppHeader title="Jornadas" show-back @back="emit('navigate','admin-home')"><template #right><BaseButton size="sm" @click="openNew">+ Nueva</BaseButton></template></AppHeader>
    <div class="flex-1 overflow-y-auto p-4">
      <div class="flex gap-2 mb-3"><button v-for="f in [['todas','Todas'],['abiertas','Abiertas'],['cerradas','Cerradas']]" :key="f[0]" @click="filter=f[0]" class="px-3 py-1.5 rounded-full text-xs font-semibold" :class="filter===f[0]?'bg-[#2A6049] text-white':'bg-white border border-[#D8CFC4]'">{{f[1]}}</button></div>
      <BaseInput v-model="dateFilter" type="date" label="Filtrar por fecha" />
      <div class="mt-4">
        <div v-if="filtered.length===0" class="text-center text-sm text-[#7A6558] py-12">Aún no existen jornadas para mostrar.</div>
        <button v-for="s in filtered" :key="s.id" @click="openDetail(s)" class="w-full text-left bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3">
          <div class="flex justify-between"><p class="font-semibold">{{s.name}}</p><span class="text-[10px] px-2 py-1 rounded-full" :class="s.status==='open'?'bg-[#E6F5EF] text-[#1E6B47]':'bg-[#EEE] text-[#666]'">{{s.status==='open'?'Abierta':'Cerrada'}}</span></div><p class="text-xs text-[#7A6558] mt-1">📍 {{s.address}}</p><p class="text-xs text-[#7A6558]">📅 {{s.startDate}} · 👤 {{cashierName(s.cashierId)}}</p><p class="text-xs font-semibold text-[#2A6049] mt-2">{{money(sessionSummary(store,s.id).total)}} · {{sessionSummary(store,s.id).sales.length}} ventas</p>
        </button>
      </div>
    </div>
  </template>
</div>
</template>
