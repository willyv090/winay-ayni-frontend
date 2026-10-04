<script setup>
import { computed, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import ToastMessage from '../components/ui/ToastMessage.vue'
import { genId } from '../utils/helpers.js'

const props = defineProps({ store:Object, currentUser:Object })
const emit = defineEmits(['navigate'])
const isAdmin = computed(()=>props.currentUser.roles.includes('ADMINISTRADOR'))
const view = ref('list'), editing = ref(null), search = ref(''), modal = ref(null), toast = ref('')
const errors = reactive({})
const form = reactive({ name:'', address:'', phone:'' })
const visibleBusinesses = computed(()=>{
  const base = isAdmin.value ? props.store.businesses : props.store.businesses.filter(b=>props.currentUser.businessIds.includes(b.id))
  const q=search.value.toLowerCase(); return base.filter(b=>!q || `${b.name} ${b.address} ${b.phone}`.toLowerCase().includes(q))
})
function notify(m){toast.value=m;setTimeout(()=>toast.value='',1800)}
function clear(){Object.keys(errors).forEach(k=>delete errors[k])}
function openCreate(){editing.value=null;Object.assign(form,{name:'',address:'',phone:''});clear();view.value='form'}
function openEdit(b){editing.value=b;Object.assign(form,{name:b.name,address:b.address,phone:b.phone});clear();view.value='form'}
function validate(){clear();if(!form.name.trim())errors.name='Este campo es obligatorio';if(form.phone && !/^\d{7,10}$/.test(form.phone.trim()))errors.phone='Ingrese un teléfono válido';const dup=props.store.businesses.find(b=>b.name.trim().toLowerCase()===form.name.trim().toLowerCase()&&b.id!==editing.value?.id);if(dup)errors.name='Ya existe un emprendimiento con estos datos';return Object.keys(errors).length===0}
function save(){if(!validate())return;if(editing.value){Object.assign(editing.value,{name:form.name.trim(),address:form.address.trim(),phone:form.phone.trim()});notify('Cambios guardados correctamente')}else{props.store.businesses.push({id:genId('b'),name:form.name.trim(),address:form.address.trim(),phone:form.phone.trim(),associatedUserIds:[],active:true});notify('Emprendimiento registrado correctamente')}view.value='list'}
function toggle(){if(!modal.value)return;modal.value.active=!modal.value.active;notify(modal.value.active?'Emprendimiento reactivado':'Emprendimiento desactivado');modal.value=null}
</script>
<template>
  <div class="h-full flex flex-col relative">
    <ToastMessage :message="toast" />
    <AppModal :open="!!modal" :title="modal?.active?'¿Desactivar emprendimiento?':'¿Reactivar emprendimiento?'" :message="modal?.active?'El emprendimiento quedará inactivo, pero se conservará su información histórica.':'El emprendimiento volverá a estar disponible.'" :confirm-label="modal?.active?'Desactivar':'Reactivar'" :danger="modal?.active" @cancel="modal=null" @confirm="toggle" />
    <template v-if="view==='form'">
      <AppHeader :title="editing?'Editar emprendimiento':'Nuevo emprendimiento'" show-back @back="view='list'" />
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <BaseInput v-model="form.name" label="Nombre *" :error="errors.name" placeholder="Velas Artesanales Condori" />
        <BaseInput v-model="form.address" label="Dirección" placeholder="Av. Montes 345" />
        <BaseInput v-model="form.phone" label="Teléfono" :error="errors.phone" placeholder="71234567" />
        <div class="flex gap-3"><BaseButton full variant="secondary" @click="view='list'">Cancelar</BaseButton><BaseButton full @click="save">Guardar</BaseButton></div>
      </div>
    </template>
    <template v-else>
      <AppHeader
        title="Emprendimientos"
        show-back
        @back="emit('navigate', 'home')"
      >
      <template #right><BaseButton v-if="isAdmin" size="sm" @click="openCreate">+ Nuevo</BaseButton></template></AppHeader>
      <div class="flex-1 overflow-y-auto p-4">
        <input v-model="search" placeholder="Buscar emprendimiento..." class="w-full h-10 rounded-xl border border-[#D8CFC4] bg-white px-4 text-sm mb-4" />
        <div v-if="visibleBusinesses.length===0" class="text-center text-sm text-[#7A6558] py-12">No existen emprendimientos para mostrar.</div>
        <div v-for="b in visibleBusinesses" :key="b.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3">
          <div class="flex justify-between gap-3"><div><p class="font-semibold">{{b.name}}</p><p class="text-xs text-[#7A6558]">📍 {{b.address||'Sin dirección'}}</p><p class="text-xs text-[#7A6558]">☎ {{b.phone||'Sin teléfono'}}</p></div><span class="text-[10px] px-2 py-1 rounded-full h-fit" :class="b.active?'bg-[#E6F5EF] text-[#1E6B47]':'bg-[#EEE] text-[#666]'">{{b.active?'Activo':'Inactivo'}}</span></div>
          <p class="text-xs text-[#7A6558] mt-2">Personas asociadas: {{b.associatedUserIds.length}}</p>
          <div v-if="isAdmin" class="flex gap-2 mt-3"><BaseButton size="sm" variant="outline" @click="openEdit(b)">Editar</BaseButton><BaseButton size="sm" :variant="b.active?'danger':'secondary'" @click="modal=b">{{b.active?'Desactivar':'Reactivar'}}</BaseButton></div>
        </div>
      </div>
    </template>
  </div>
</template>
