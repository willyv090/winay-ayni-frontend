<script setup>
import { computed, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import PasswordInput from '../components/ui/PasswordInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import ToastMessage from '../components/ui/ToastMessage.vue'
import { genId } from '../utils/helpers.js'

const props = defineProps({ store: Object, currentUser: Object })
const emit = defineEmits(['navigate'])
const view = ref('list')
const editing = ref(null)
const search = ref('')
const filter = ref('todos')
const modal = ref(null)
const toast = ref('')
const errors = reactive({})
const form = reactive({ name:'', lastName:'', username:'', password:'', confirmPassword:'', role:'entrepreneur', businessId:'' })
const roleOptions = [
  { value:'admin', label:'Administrador' }, { value:'cashier', label:'Cajero rotativo' }, { value:'entrepreneur', label:'Emprendedor' }
]
const activeBusinesses = computed(()=>props.store.businesses.filter(b=>b.active).map(b=>({value:b.id,label:b.name})))
const filtered = computed(()=>props.store.users.filter(u=>{
  const term = search.value.toLowerCase()
  const matchSearch = !term || `${u.name} ${u.lastName} ${u.username}`.toLowerCase().includes(term)
  const matchState = filter.value==='todos' || (filter.value==='activos' ? u.active : !u.active)
  return matchSearch && matchState
}))
function notify(msg){ toast.value=msg; setTimeout(()=>toast.value='',1800) }
function resetErrors(){ Object.keys(errors).forEach(k=>delete errors[k]) }
function openCreate(){ editing.value=null; Object.assign(form,{name:'',lastName:'',username:'',password:'',confirmPassword:'',role:'entrepreneur',businessId:''}); resetErrors(); view.value='form' }
function openEdit(u){ editing.value=u; Object.assign(form,{name:u.name,lastName:u.lastName,username:u.username,password:'',confirmPassword:'',role:u.roles[0]||'entrepreneur',businessId:u.businessIds[0]||''}); resetErrors(); view.value='form' }
function validate(){ resetErrors(); if(!form.name.trim()) errors.name='Este campo es obligatorio'; if(!form.lastName.trim()) errors.lastName='Este campo es obligatorio'; if(!form.username.trim()) errors.username='Este campo es obligatorio'; if(!editing.value && !form.password) errors.password='Este campo es obligatorio'; if(form.password && form.password!==form.confirmPassword) errors.confirmPassword='Las contraseñas no coinciden'; if(!form.role) errors.role='Seleccione un rol'; if(form.role==='entrepreneur' && !form.businessId) errors.businessId='Seleccione un emprendimiento'; const dup=props.store.users.find(u=>u.username.toLowerCase()===form.username.trim().toLowerCase() && u.id!==editing.value?.id); if(dup) errors.username='Ya existe un usuario registrado con este identificador'; return Object.keys(errors).length===0 }
function syncBusiness(userId, oldIds, newIds){
  props.store.businesses.forEach(b=>{ b.associatedUserIds = b.associatedUserIds.filter(id=>id!==userId); if(newIds.includes(b.id)) b.associatedUserIds.push(userId) })
}
function save(){ if(!validate()) return; const businessIds = form.role==='entrepreneur' && form.businessId ? [form.businessId] : []; if(editing.value){ const u=props.store.users.find(x=>x.id===editing.value.id); const old=[...u.businessIds]; Object.assign(u,{name:form.name.trim(),lastName:form.lastName.trim(),username:form.username.trim(),roles:[form.role],businessIds}); if(form.password) u.password=form.password; syncBusiness(u.id,old,businessIds); notify('Cambios guardados correctamente') } else { const u={id:genId('u'),name:form.name.trim(),lastName:form.lastName.trim(),username:form.username.trim(),password:form.password,roles:[form.role],businessIds,active:true}; props.store.users.push(u); syncBusiness(u.id,[],businessIds); notify('Usuario registrado correctamente') } view.value='list' }
function toggleUser(){ if(!modal.value) return; const u=modal.value; u.active=!u.active; notify(u.active?'Usuario reactivado correctamente':'Usuario desactivado correctamente'); modal.value=null }
function roleLabel(u){ return u.roles[0]==='admin'?'Administrador':u.roles[0]==='cashier'?'Cajero':'Emprendedor' }
</script>
<template>
  <div class="h-full flex flex-col relative">
    <ToastMessage :message="toast" />
    <AppModal :open="!!modal" :title="modal?.active ? '¿Desactivar usuario?' : '¿Reactivar usuario?'" :message="modal?.active ? 'El usuario dejará de tener acceso al sistema, pero se conservará su historial.' : 'El usuario podrá volver a ingresar al sistema.'" :confirm-label="modal?.active ? 'Desactivar' : 'Reactivar'" :danger="modal?.active" @cancel="modal=null" @confirm="toggleUser" />
    <template v-if="view==='form'">
      <AppHeader :title="editing ? 'Editar usuario' : 'Nuevo usuario'" show-back @back="view='list'" />
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <BaseInput v-model="form.name" label="Nombre *" :error="errors.name" placeholder="Rosa" />
        <BaseInput v-model="form.lastName" label="Apellido *" :error="errors.lastName" placeholder="Flores Condori" />
        <BaseInput v-model="form.username" label="Usuario *" :error="errors.username" placeholder="rosa.flores" />
        <PasswordInput v-model="form.password" :label="editing ? 'Nueva contraseña (opcional)' : 'Contraseña *'" :error="errors.password" placeholder="••••••" />
        <PasswordInput v-if="form.password || !editing" v-model="form.confirmPassword" label="Confirmar contraseña" :error="errors.confirmPassword" placeholder="••••••" />
        <BaseSelect v-model="form.role" label="Rol *" :options="roleOptions" :error="errors.role" />
        <BaseSelect v-if="form.role==='entrepreneur'" v-model="form.businessId" label="Emprendimiento *" :options="activeBusinesses" placeholder="Seleccione un emprendimiento" :error="errors.businessId" />
        <p class="text-xs text-[#7A6558]">Cada usuario emprendedor se asocia a un emprendimiento, de acuerdo con el requerimiento definido.</p>
        <div class="flex gap-3 pb-8"><BaseButton variant="secondary" full @click="view='list'">Cancelar</BaseButton><BaseButton full @click="save">Guardar</BaseButton></div>
      </div>
    </template>
    <template v-else>
      <AppHeader title="Usuarios" show-back @back="emit('navigate','admin-home')"><template #right><BaseButton size="sm" @click="openCreate">+ Nuevo</BaseButton></template></AppHeader>
      <div class="flex-1 overflow-y-auto p-4">
        <input v-model="search" placeholder="Buscar usuario..." class="w-full h-10 rounded-xl border border-[#D8CFC4] bg-white px-4 text-sm mb-3" />
        <div class="flex gap-2 mb-4"><button v-for="f in [['todos','Todos'],['activos','Activos'],['inactivos','Inactivos']]" :key="f[0]" @click="filter=f[0]" class="px-3 py-1.5 rounded-full text-xs font-semibold" :class="filter===f[0]?'bg-[#2A6049] text-white':'bg-white border border-[#D8CFC4]'">{{f[1]}}</button></div>
        <div v-if="filtered.length===0" class="text-center text-sm text-[#7A6558] py-12">No encontramos usuarios para esta búsqueda.</div>
        <div v-for="u in filtered" :key="u.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3">
          <div class="flex justify-between gap-3"><div><p class="font-semibold">{{u.name}} {{u.lastName}}</p><p class="text-xs text-[#7A6558]">@{{u.username}} · {{roleLabel(u)}}</p><p v-if="u.businessIds[0]" class="text-xs text-[#7A6558] mt-1">🏪 {{store.businesses.find(b=>b.id===u.businessIds[0])?.name}}</p></div><span class="text-[10px] px-2 py-1 rounded-full h-fit" :class="u.active?'bg-[#E6F5EF] text-[#1E6B47]':'bg-[#EEE] text-[#666]'">{{u.active?'Activo':'Inactivo'}}</span></div>
          <div class="flex gap-2 mt-3"><BaseButton size="sm" variant="outline" @click="openEdit(u)">Editar</BaseButton><BaseButton size="sm" :variant="u.active?'danger':'secondary'" @click="modal=u">{{u.active?'Desactivar':'Reactivar'}}</BaseButton></div>
        </div>
      </div>
    </template>
  </div>
</template>
