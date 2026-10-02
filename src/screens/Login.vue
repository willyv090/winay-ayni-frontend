<script setup>
import { reactive, ref } from 'vue'

import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import PasswordInput from '../components/ui/PasswordInput.vue'

import { iniciarSesion } from '../services/authService.js'


const emit = defineEmits(['login'])

const form = reactive({
  username: '',
  contrasenia: ''
})

const errors = reactive({
  username: '',
  contrasenia: '',
  general: ''
})

const loading = ref(false)


function clearErrors() {
  errors.username = ''
  errors.contrasenia = ''
  errors.general = ''
}


async function submit() {
  clearErrors()

  if (!form.username.trim() && !form.contrasenia) {
    errors.username = 'Ingrese su usuario'
    errors.contrasenia = 'Ingrese su contraseña'
    errors.general = 'Complete los campos obligatorios'
    return
  }

  if (!form.username.trim()) {
    errors.username = 'Ingrese su usuario'
  }

  if (!form.contrasenia) {
    errors.contrasenia = 'Ingrese su contraseña'
  }

  if (errors.username || errors.contrasenia) {
    return
  }

  loading.value = true

  try {
    const data = await iniciarSesion(
      form.username.trim(),
      form.contrasenia
    )

    const user = {
      id: data.usuario.id,

      // Lo transformamos para que funcione
      // con el maquetado actual
      name: data.usuario.nombre,

      username: data.usuario.usuario,

      roles: data.usuario.roles,

      // Temporalmente vacío hasta conectar
      // PersonaEmpresa con el frontend
      businessIds: []
    }

    emit('login', user)

  } catch (error) {

    errors.general =
      error.message ||
      'No se pudo iniciar sesión.'

  } finally {

    loading.value = false

  }
}
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
      <PasswordInput v-model="form.contrasenia" label="Contraseña" placeholder="Ingrese su contraseña" :error="errors.contrasenia" @keyup.enter="submit" />
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
