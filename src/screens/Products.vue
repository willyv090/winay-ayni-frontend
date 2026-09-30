<script setup>
import { computed, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import BaseTextarea from '../components/ui/BaseTextarea.vue'
import AppModal from '../components/ui/AppModal.vue'
import ToastMessage from '../components/ui/ToastMessage.vue'
import { genId, money } from '../utils/helpers.js'

const props = defineProps({ store:Object, currentUser:Object })
const emit = defineEmits(['navigate'])
const isAdmin = computed(()=>props.currentUser.roles.includes('admin'))
const view=ref('list'), editing=ref(null), inventoryProduct=ref(null), search=ref(''), filter=ref('todos'), selectedBusiness=ref(''), modal=ref(null), toast=ref('')
const errors=reactive({}), invErrors=reactive({})
const form=reactive({code:'',name:'',businessId:'',price:'',discount:'',stock:'',notes:''})
const invForm=reactive({type:'ingreso',quantity:'',reason:''})
const businessOptions=computed(()=>props.store.businesses.filter(b=>b.active && (isAdmin.value || props.currentUser.businessIds.includes(b.id))).map(b=>({value:b.id,label:b.name})))
const allProducts=computed(()=>isAdmin.value?props.store.products:props.store.products.filter(p=>props.currentUser.businessIds.includes(p.businessId)))
const filtered=computed(()=>allProducts.value.filter(p=>{
  const q=search.value.toLowerCase(); const matchQ=!q||`${p.code} ${p.name}`.toLowerCase().includes(q); const matchBiz=!selectedBusiness.value||p.businessId===selectedBusiness.value
  const matchState=filter.value==='todos'||(filter.value==='activos'?p.active:filter.value==='inactivos'?!p.active:(p.active&&p.stock<=5)); return matchQ&&matchBiz&&matchState
}))
function notify(m){toast.value=m;setTimeout(()=>toast.value='',1800)}
function clear(obj){Object.keys(obj).forEach(k=>delete obj[k])}
function openCreate(){editing.value=null;Object.assign(form,{code:'',name:'',businessId:'',price:'',discount:'',stock:'',notes:''});clear(errors);view.value='form'}
function openEdit(p){editing.value=p;Object.assign(form,{code:p.code,name:p.name,businessId:p.businessId,price:String(p.price),discount:String(p.discount),stock:String(p.stock),notes:p.notes});clear(errors);view.value='form'}
function validate(){clear(errors);if(!form.code.trim())errors.code='Ingrese el código o ítem del producto';else if(props.store.products.some(p=>p.code.trim().toLowerCase()===form.code.trim().toLowerCase()&&p.id!==editing.value?.id))errors.code='El código ingresado ya pertenece a otro producto';if(!form.name.trim())errors.name='Ingrese el nombre del producto';if(!form.businessId)errors.businessId='Seleccione un emprendimiento';if(form.price===''||Number(form.price)<0||Number.isNaN(Number(form.price)))errors.price='Ingrese un precio válido';if(form.stock!==''&&Number(form.stock)<0)errors.stock='La cantidad no puede ser negativa';const d=Number(form.discount||0);if(Number.isNaN(d)||d<0||(d>0&&(d<5||d>10)))errors.discount='La rebaja debe ser 0 o estar entre 5 y 10 Bs';return Object.keys(errors).length===0}
function save(){if(!validate())return;if(editing.value){Object.assign(editing.value,{code:form.code.trim().toUpperCase(),name:form.name.trim(),businessId:form.businessId,price:Number(form.price),discount:Number(form.discount||0),notes:form.notes.trim()});notify('Cambios guardados correctamente')}else{props.store.products.push({id:genId('p'),code:form.code.trim().toUpperCase(),name:form.name.trim(),businessId:form.businessId,price:Number(form.price),discount:Number(form.discount||0),stock:Number(form.stock||0),notes:form.notes.trim(),active:true});notify('Producto registrado correctamente')}view.value='list'}
function openInventory(p){inventoryProduct.value=p;Object.assign(invForm,{type:'ingreso',quantity:'',reason:''});clear(invErrors);view.value='inventory'}
function saveInventory(){clear(invErrors);const q=Number(invForm.quantity);if(!invForm.quantity)invErrors.quantity='Ingrese una cantidad';else if(q<=0)invErrors.quantity='La cantidad debe ser mayor a cero';const subtract=['ajuste','adelanto'].includes(invForm.type);if(subtract&&inventoryProduct.value.stock-q<0)invErrors.quantity='El movimiento no puede dejar un stock negativo';if(Object.keys(invErrors).length)return;inventoryProduct.value.stock += subtract ? -q : q;props.store.inventoryMovements.push({id:genId('mv'),productId:inventoryProduct.value.id,type:invForm.type,quantity:q,reason:invForm.reason.trim(),date:new Date().toISOString(),userId:props.currentUser.id});notify('Inventario actualizado correctamente');view.value='list'}
function toggle(){if(!modal.value)return;modal.value.active=!modal.value.active;notify(modal.value.active?'Producto reactivado':'Producto desactivado');modal.value=null}
function bizName(id){return props.store.businesses.find(b=>b.id===id)?.name||'—'}
</script>
<template>
  <div class="h-full flex flex-col relative">
    <ToastMessage :message="toast" />
    <AppModal :open="!!modal" :title="modal?.active?'¿Desactivar producto?':'¿Reactivar producto?'" :message="modal?.active?'El producto dejará de estar disponible para nuevas jornadas y ventas.':'El producto volverá a estar disponible.'" :confirm-label="modal?.active?'Desactivar':'Reactivar'" :danger="modal?.active" @cancel="modal=null" @confirm="toggle" />
    <template v-if="view==='form'">
      <AppHeader :title="editing?'Editar producto':'Nuevo producto'" show-back @back="view='list'" />
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <BaseInput v-model="form.code" label="Código / ítem *" :error="errors.code" placeholder="VEL001" />
        <BaseInput v-model="form.name" label="Nombre *" :error="errors.name" placeholder="Vela aromática" />
        <BaseSelect v-model="form.businessId" label="Emprendimiento *" :options="businessOptions" placeholder="Seleccione un emprendimiento" :error="errors.businessId" />
        <BaseInput v-model="form.price" label="Precio unitario (Bs) *" type="number" min="0" step="0.5" :error="errors.price" placeholder="25" />
        <BaseInput v-if="!editing" v-model="form.stock" label="Cantidad inicial" type="number" min="0" :error="errors.stock" placeholder="0" />
        <BaseInput v-model="form.discount" label="Rebaja (Bs)" type="number" min="0" max="10" :error="errors.discount" hint="Sin rebaja: 0. Con rebaja: entre 5 y 10 Bs." placeholder="0" />
        <BaseTextarea v-model="form.notes" label="Notas" placeholder="Información adicional..." />
        <div class="flex gap-3 pb-8"><BaseButton full variant="secondary" @click="view='list'">Cancelar</BaseButton><BaseButton full @click="save">Guardar</BaseButton></div>
      </div>
    </template>
    <template v-else-if="view==='inventory' && inventoryProduct">
      <AppHeader title="Actualizar inventario" show-back @back="view='list'" />
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><p class="font-semibold">{{inventoryProduct.name}}</p><p class="text-xs text-[#7A6558]">{{inventoryProduct.code}}</p><p class="font-bold text-[#2A6049] mt-2">Stock actual: {{inventoryProduct.stock}}</p></div>
        <BaseSelect v-model="invForm.type" label="Tipo de movimiento" :options="[{value:'ingreso',label:'Ingreso'},{value:'ajuste',label:'Ajuste'},{value:'adelanto',label:'Adelanto'},{value:'reposicion',label:'Reposición'}]" />
        <BaseInput v-model="invForm.quantity" label="Cantidad *" type="number" min="1" :error="invErrors.quantity" placeholder="0" />
        <BaseTextarea v-model="invForm.reason" label="Motivo u observación" placeholder="Ingrese el motivo del movimiento..." />
        <div v-if="Number(invForm.quantity)>0" class="bg-[#E6F5EF] text-[#1E6B47] rounded-xl p-3 text-sm">Nuevo stock estimado: {{inventoryProduct.stock + (['ajuste','adelanto'].includes(invForm.type)?-Number(invForm.quantity):Number(invForm.quantity))}}</div>
        <div class="flex gap-3"><BaseButton full variant="secondary" @click="view='list'">Cancelar</BaseButton><BaseButton full @click="saveInventory">Actualizar</BaseButton></div>
      </div>
    </template>
    <template v-else>
      <AppHeader title="Productos e inventario" show-back @back="emit('navigate',isAdmin?'admin-home':'entrepreneur-home')"><template #right><BaseButton v-if="isAdmin" size="sm" @click="openCreate">+ Nuevo</BaseButton></template></AppHeader>
      <div class="flex-1 overflow-y-auto p-4">
        <BaseSelect v-if="isAdmin" v-model="selectedBusiness" :options="[{value:'',label:'Todos'},...businessOptions]" label="Emprendimiento" />
        <input v-model="search" placeholder="Buscar producto o código..." class="w-full h-10 rounded-xl border border-[#D8CFC4] bg-white px-4 text-sm my-3" />
        <div class="flex gap-2 overflow-x-auto mb-4"><button v-for="f in [['todos','Todos'],['activos','Activos'],['inactivos','Inactivos'],['bajo-stock','Bajo stock']]" :key="f[0]" @click="filter=f[0]" class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap" :class="filter===f[0]?'bg-[#2A6049] text-white':'bg-white border border-[#D8CFC4]'">{{f[1]}}</button></div>
        <div v-if="filtered.length===0" class="text-center py-12 text-sm text-[#7A6558]">Aún no existen productos para mostrar.</div>
        <div v-for="p in filtered" :key="p.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3">
          <div class="flex justify-between"><div><p class="font-semibold">{{p.name}}</p><p class="text-xs text-[#7A6558]">{{p.code}} · {{bizName(p.businessId)}}</p></div><span class="text-[10px] px-2 py-1 rounded-full h-fit" :class="p.active?'bg-[#E6F5EF] text-[#1E6B47]':'bg-[#EEE] text-[#666]'">{{p.active?'Activo':'Inactivo'}}</span></div>
          <div class="grid grid-cols-3 gap-2 mt-3 text-center"><div class="bg-[#F5F0E8] rounded-xl p-2"><p class="text-xs text-[#7A6558]">Stock</p><p class="font-bold" :class="p.stock<=5?'text-[#C23B22]':'text-[#1C1108]'">{{p.stock}}</p></div><div class="bg-[#F5F0E8] rounded-xl p-2"><p class="text-xs text-[#7A6558]">Precio</p><p class="font-bold text-sm">{{money(p.price)}}</p></div><div class="bg-[#F5F0E8] rounded-xl p-2"><p class="text-xs text-[#7A6558]">Rebaja</p><p class="font-bold text-sm">{{money(p.discount)}}</p></div></div>
          <div v-if="isAdmin" class="flex gap-2 mt-3"><BaseButton size="sm" variant="outline" @click="openEdit(p)">Editar</BaseButton><BaseButton size="sm" variant="secondary" @click="openInventory(p)">Inventario</BaseButton><BaseButton size="sm" :variant="p.active?'danger':'secondary'" @click="modal=p">{{p.active?'Desactivar':'Reactivar'}}</BaseButton></div>
        </div>
      </div>
    </template>
  </div>
</template>
