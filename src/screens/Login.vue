<script setup>
import { reactive, ref } from 'vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import PasswordInput from '../components/ui/PasswordInput.vue'

const props = defineProps({ users: { type: Array, required: true } })
const emit = defineEmits(['login'])
const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '', general: '' })
const loading = ref(false)

function clearErrors() { errors.username=''; errors.password=''; errors.general='' }
async function submit() {
  clearErrors()
  if (!form.username.trim() && !form.password) {
    errors.username='Ingrese su usuario'; errors.password='Ingrese su contraseña'; errors.general='Complete los campos obligatorios'; return
  }
  if (!form.username.trim()) errors.username='Ingrese su usuario'
  if (!form.password) errors.password='Ingrese su contraseña'
  if (errors.username || errors.password) return
  loading.value = true
  await new Promise(r => setTimeout(r, 450))
  const user = props.users.find(u => u.username.toLowerCase() === form.username.trim().toLowerCase() && u.password === form.password)
  loading.value = false
  if (!user) { errors.general='Usuario o contraseña incorrectos'; return }
  if (!user.active) { errors.general='Su usuario no se encuentra habilitado'; return }
  emit('login', user)
}
function demo(username) { form.username=username; form.password='1234'; clearErrors() }
</script>
<template>
  <div class="h-full flex flex-col bg-[#F5F0E8] overflow-y-auto">
    <div class="bg-[#2A6049] px-6 pt-10 pb-8 rounded-b-[36px] text-white">
      <div class="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-4">🌱</div>
      <h1 class="font-display font-extrabold text-3xl">Wiñay Ayni</h1>
      <p class="text-white/75 text-sm mt-1">Ventas grupales e inventario</p>
    </div>
    <div class="p-5 flex flex-col gap-4">
      <div>
        <h2 class="font-display font-bold text-xl">Iniciar sesión</h2>
        <p class="text-sm text-[#7A6558]">Ingresa tus credenciales para continuar.</p>
      </div>
      <div v-if="errors.general" class="bg-[#FDE8E3] text-[#A52D18] text-sm rounded-xl p-3">⚠ {{ errors.general }}</div>
      <BaseInput v-model="form.username" label="Usuario" placeholder="Ingrese su usuario" :error="errors.username" />
      <PasswordInput v-model="form.password" label="Contraseña" placeholder="Ingrese su contraseña" :error="errors.password" @keyup.enter="submit" />
      <BaseButton full :loading="loading" @click="submit">Iniciar sesión</BaseButton>
      <div class="border-t border-[#D8CFC4] pt-4 mt-1">
        <p class="text-xs font-semibold text-[#7A6558] mb-2">Accesos de demostración</p>
        <div class="grid grid-cols-3 gap-2">
          <button @click="demo('admin')" class="rounded-xl bg-white border border-[#D8CFC4] p-2 text-[10px] font-semibold">Admin</button>
          <button @click="demo('cajero1')" class="rounded-xl bg-white border border-[#D8CFC4] p-2 text-[10px] font-semibold">Cajero</button>
          <button @click="demo('emprendedor1')" class="rounded-xl bg-white border border-[#D8CFC4] p-2 text-[10px] font-semibold">Emprendedor</button>
        </div>
      </div>
    </div>
  </div>
</template>
