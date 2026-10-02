<script setup>
import { onMounted, reactive, ref } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'

import {
  crearUsuario,
  listarRoles
} from '../services/usuarioService.js'


const emit = defineEmits(['navigate'])

const loading = ref(false)
const loadingRoles = ref(false)

const error = ref('')
const mensaje = ref('')

const rolesDisponibles = ref([])


const form = reactive({
  nombre: '',
  usuario: '',
  contrasenia: '',
  confirmarContrasenia: '',
  roles: []
})


const errors = reactive({
  nombre: '',
  usuario: '',
  contrasenia: '',
  confirmarContrasenia: '',
  roles: ''
})


function limpiarErrores() {
  errors.nombre = ''
  errors.usuario = ''
  errors.contrasenia = ''
  errors.confirmarContrasenia = ''
  errors.roles = ''

  error.value = ''
  mensaje.value = ''
}


async function cargarRoles() {
  loadingRoles.value = true

  try {

    const response = await listarRoles()

    if (Array.isArray(response)) {
      rolesDisponibles.value = response
    }
    else if (Array.isArray(response.roles)) {
      rolesDisponibles.value = response.roles
    }
    else {
      rolesDisponibles.value = []
    }

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar los roles.'

  } finally {

    loadingRoles.value = false
  }
}


function validarFormulario() {

  limpiarErrores()

  let valido = true


  if (!form.nombre.trim()) {
    errors.nombre =
      'Ingrese el nombre.'
    valido = false
  }


  if (!form.usuario.trim()) {
    errors.usuario =
      'Ingrese el usuario.'
    valido = false
  }


  if (!form.contrasenia) {
    errors.contrasenia =
      'Ingrese una contraseña.'
    valido = false
  }


  if (!form.confirmarContrasenia) {

    errors.confirmarContrasenia =
      'Confirme la contraseña.'

    valido = false

  }
  else if (
    form.contrasenia !==
    form.confirmarContrasenia
  ) {

    errors.confirmarContrasenia =
      'Las contraseñas no coinciden.'

    valido = false
  }


  if (form.roles.length === 0) {

    errors.roles =
      'Seleccione al menos un rol.'

    valido = false
  }


  return valido
}


async function guardar() {

  if (!validarFormulario()) {
    return
  }

  loading.value = true

  try {

    const response = await crearUsuario({
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      contrasenia: form.contrasenia,
      roles: form.roles
    })

    mensaje.value =
      response.mensaje ||
      'Usuario registrado correctamente.'

    setTimeout(() => {

      emit(
        'navigate',
        'users-list'
      )

    }, 800)

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo registrar el usuario.'

  } finally {

    loading.value = false
  }
}


onMounted(() => {
  cargarRoles()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Nuevo usuario"
      show-back
      @back="emit('navigate', 'users-list')"
    />


    <div class="flex-1 overflow-y-auto p-4">

      <div
        class="
          bg-white
          border
          border-[#D8CFC4]
          rounded-2xl
          p-4
        "
      >

        <!-- NOMBRE -->

        <div class="mb-4">

          <label
            class="
              text-sm
              font-semibold
            "
          >
            Nombre
          </label>

          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej. Ana López"
            class="
              w-full
              h-11
              border
              border-[#D8CFC4]
              rounded-xl
              px-3
              mt-1
            "
          />

          <p
            v-if="errors.nombre"
            class="
              text-xs
              text-red-600
              mt-1
            "
          >
            {{ errors.nombre }}
          </p>

        </div>


        <!-- USUARIO -->

        <div class="mb-4">

          <label class="text-sm font-semibold">
            Usuario
          </label>

          <input
            v-model="form.usuario"
            type="text"
            placeholder="Ej. ana"
            class="
              w-full
              h-11
              border
              border-[#D8CFC4]
              rounded-xl
              px-3
              mt-1
            "
          />

          <p
            v-if="errors.usuario"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors.usuario }}
          </p>

        </div>


        <!-- CONTRASEÑA -->

        <div class="mb-4">

          <label class="text-sm font-semibold">
            Contraseña
          </label>

          <input
            v-model="form.contrasenia"
            type="password"
            class="
              w-full
              h-11
              border
              border-[#D8CFC4]
              rounded-xl
              px-3
              mt-1
            "
          />

          <p
            v-if="errors.contrasenia"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors.contrasenia }}
          </p>

        </div>


        <!-- CONFIRMAR -->

        <div class="mb-5">

          <label class="text-sm font-semibold">
            Confirmar contraseña
          </label>

          <input
            v-model="form.confirmarContrasenia"
            type="password"
            class="
              w-full
              h-11
              border
              border-[#D8CFC4]
              rounded-xl
              px-3
              mt-1
            "
          />

          <p
            v-if="errors.confirmarContrasenia"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors.confirmarContrasenia }}
          </p>

        </div>


        <!-- ROLES -->

        <div class="mb-5">

          <p class="text-sm font-semibold mb-2">
            Roles
          </p>


          <p
            v-if="loadingRoles"
            class="text-sm text-[#7A6558]"
          >
            Cargando roles...
          </p>


          <div
            v-else
            class="space-y-2"
          >

            <label
              v-for="rol in rolesDisponibles"
              :key="rol.id || rol.id_rol"
              class="
                flex
                items-center
                gap-3
                border
                border-[#D8CFC4]
                rounded-xl
                p-3
                cursor-pointer
              "
            >

              <input
                v-model="form.roles"
                type="checkbox"
                :value="rol.id || rol.id_rol"
              />

              <span class="text-sm">
                {{ rol.nombre }}
              </span>

            </label>

          </div>


          <p
            v-if="errors.roles"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors.roles }}
          </p>

        </div>


        <!-- ERROR GENERAL -->

        <div
          v-if="error"
          class="
            bg-red-50
            text-red-700
            rounded-xl
            p-3
            text-sm
            mb-4
          "
        >
          {{ error }}
        </div>


        <!-- ÉXITO -->

        <div
          v-if="mensaje"
          class="
            bg-green-50
            text-green-700
            rounded-xl
            p-3
            text-sm
            mb-4
          "
        >
          {{ mensaje }}
        </div>


        <BaseButton
          class="w-full"
          :disabled="loading"
          @click="guardar"
        >

          {{
            loading
              ? 'Guardando...'
              : 'Registrar usuario'
          }}

        </BaseButton>

      </div>

    </div>

  </div>

</template>