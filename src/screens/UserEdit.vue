<script setup>
import { onMounted, reactive, ref } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import {
  obtenerUsuario,
  listarRoles,
  editarUsuario
} from '../services/usuarioService.js'


const props = defineProps({
  idUsuario: {
    type: Number,
    required: true
  }
})


const emit = defineEmits(['navigate'])


const loading = ref(true)
const guardando = ref(false)

const error = ref('')
const mensaje = ref('')

const rolesDisponibles = ref([])
const rolesOriginales = ref([])


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


function obtenerIdRol(rol) {
  return rol.id ?? rol.id_rol
}


async function cargarDatos() {
  loading.value = true
  error.value = ''

  try {

    // Traemos persona y roles disponibles al mismo tiempo
    const [
      respuestaPersona,
      respuestaRoles
    ] = await Promise.all([
      obtenerUsuario(props.idUsuario),
      listarRoles()
    ])


    const persona = respuestaPersona.persona


    // =========================
    // ROLES DISPONIBLES
    // =========================

    if (Array.isArray(respuestaRoles)) {
      rolesDisponibles.value = respuestaRoles
    }
    else if (Array.isArray(respuestaRoles.roles)) {
      rolesDisponibles.value = respuestaRoles.roles
    }
    else {
      rolesDisponibles.value = []
    }


    // =========================
    // DATOS PERSONA
    // =========================

    form.nombre = persona.nombre || ''
    form.usuario = persona.usuario || ''


    // El detalle actualmente devuelve los nombres:
    // ["ADMINISTRADOR", "EMPRENDEDOR"]
    //
    // Los convertimos a IDs usando GET /api/roles

    const idsRolesActuales = rolesDisponibles.value
      .filter(rol =>
        persona.roles?.includes(rol.nombre)
      )
      .map(rol => obtenerIdRol(rol))


    form.roles = [...idsRolesActuales]

    rolesOriginales.value = [...idsRolesActuales]

  }
  catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar los datos del usuario.'

  }
  finally {

    loading.value = false
  }
}


function rolesHanCambiado() {

  const actuales = [...form.roles]
    .map(Number)
    .sort((a, b) => a - b)

  const originales = [...rolesOriginales.value]
    .map(Number)
    .sort((a, b) => a - b)


  if (actuales.length !== originales.length) {
    return true
  }


  return actuales.some(
    (id, index) => id !== originales[index]
  )
}


function validarFormulario() {

  limpiarErrores()

  let valido = true


  if (!form.nombre.trim()) {
    errors.nombre = 'Ingrese el nombre.'
    valido = false
  }


  if (!form.usuario.trim()) {
    errors.usuario = 'Ingrese el usuario.'
    valido = false
  }


  // Solo validamos contraseña si el usuario
  // escribió una nueva
  if (form.contrasenia) {

    if (form.contrasenia.length < 6) {
      errors.contrasenia =
        'La contraseña debe tener al menos 6 caracteres.'

      valido = false
    }


    if (
      form.contrasenia !==
      form.confirmarContrasenia
    ) {

      errors.confirmarContrasenia =
        'Las contraseñas no coinciden.'

      valido = false
    }
  }


  // Si cambió roles, no permitimos dejarlo sin ninguno
  if (
    rolesHanCambiado() &&
    form.roles.length === 0
  ) {

    errors.roles =
      'El usuario debe tener al menos un rol.'

    valido = false
  }


  return valido
}


async function guardar() {

  if (!validarFormulario()) {
    return
  }


  guardando.value = true
  error.value = ''
  mensaje.value = ''


  try {

    const payload = {
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),

      // Si los roles NO cambiaron:
      // []
      //
      // Si cambiaron:
      // [1, 2, ...]
      roles: rolesHanCambiado()
        ? form.roles.map(Number)
        : []
    }


    // Solo enviamos contraseña si escribió una nueva
    if (form.contrasenia) {
      payload.contrasenia = form.contrasenia
    }


    console.log(
      'Datos enviados para editar:',
      payload
    )


    const response = await editarUsuario(
      props.idUsuario,
      payload
    )


    mensaje.value =
      response.mensaje ||
      'Usuario actualizado correctamente.'


    setTimeout(() => {

      emit(
        'navigate',
        'user-detail',
        {
          idUsuario: props.idUsuario
        }
      )

    }, 700)

  }
  catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo actualizar el usuario.'

  }
  finally {

    guardando.value = false
  }
}


onMounted(() => {
  cargarDatos()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Editar usuario"
      show-back
      @back="
        emit(
          'navigate',
          'user-detail',
          {
            idUsuario: props.idUsuario
          }
        )
      "
    />


    <div class="flex-1 overflow-y-auto p-4">


      <!-- LOADING -->

      <div
        v-if="loading"
        class="text-center text-sm text-[#7A6558] py-12"
      >
        Cargando usuario...
      </div>


      <!-- ERROR DE CARGA -->

      <div
        v-else-if="error && !form.nombre"
        class="
          bg-red-50
          border
          border-red-200
          rounded-xl
          p-4
          text-sm
          text-red-700
        "
      >

        {{ error }}

        <BaseButton
          size="sm"
          class="mt-3"
          @click="cargarDatos"
        >
          Reintentar
        </BaseButton>

      </div>


      <!-- FORMULARIO -->

      <div
        v-else
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

          <label class="text-sm font-semibold">
            Nombre
          </label>

          <input
            v-model="form.nombre"
            type="text"
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
            class="text-xs text-red-600 mt-1"
          >
            {{ errors.nombre }}
          </p>

        </div>


        <!-- USUARIO -->

        <div class="mb-5">

          <label class="text-sm font-semibold">
            Usuario
          </label>

          <input
            v-model="form.usuario"
            type="text"
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


        <!-- ROLES -->

        <div class="mb-6">

          <p class="text-sm font-semibold mb-1">
            Roles
          </p>

          <p class="text-xs text-[#7A6558] mb-3">
            Seleccione uno o varios roles.
          </p>


          <div class="space-y-2">

            <label
              v-for="rol in rolesDisponibles"
              :key="obtenerIdRol(rol)"
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
                :value="obtenerIdRol(rol)"
              />

              <span class="text-sm">
                {{ rol.nombre }}
              </span>

            </label>

          </div>


          <p
            v-if="errors.roles"
            class="text-xs text-red-600 mt-2"
          >
            {{ errors.roles }}
          </p>

        </div>


        <!-- CAMBIAR CONTRASEÑA -->

        <div
          class="
            border-t
            border-[#E5DDD4]
            pt-5
            mt-5
          "
        >

          <p class="font-semibold text-sm">
            Cambiar contraseña
          </p>

          <p
            class="
              text-xs
              text-[#7A6558]
              mt-1
              mb-4
            "
          >
            Déjela vacía si no desea modificarla.
          </p>


          <div class="mb-4">

            <label class="text-sm font-semibold">
              Nueva contraseña
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


          <div class="mb-5">

            <label class="text-sm font-semibold">
              Confirmar nueva contraseña
            </label>

            <input
              v-model="form.confirmarContrasenia"
              type="password"
              :disabled="!form.contrasenia"
              class="
                w-full
                h-11
                border
                border-[#D8CFC4]
                rounded-xl
                px-3
                mt-1
                disabled:bg-gray-100
              "
            />

            <p
              v-if="errors.confirmarContrasenia"
              class="text-xs text-red-600 mt-1"
            >
              {{ errors.confirmarContrasenia }}
            </p>

          </div>

        </div>


        <!-- ERROR -->

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


        <!-- MENSAJE -->

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


        <!-- GUARDAR -->

        <BaseButton
          class="w-full"
          :disabled="guardando"
          @click="guardar"
        >

          {{
            guardando
              ? 'Guardando...'
              : 'Guardar cambios'
          }}

        </BaseButton>

      </div>

    </div>

  </div>

</template>