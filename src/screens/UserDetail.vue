<script setup>
import { onMounted, ref } from 'vue'
import { alertController } from '@ionic/vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import {
  obtenerUsuario,
  desactivarUsuario,
  reactivarUsuario
} from '../services/usuarioService.js'


const props = defineProps({
  idUsuario: {
    type: Number,
    required: true
  }
})


const emit = defineEmits(['navigate'])

const usuario = ref(null)
const loading = ref(false)
const error = ref('')
const procesando = ref(false)

async function cargarUsuario() {
  loading.value = true
  error.value = ''

  try {

    const response = await obtenerUsuario(
      props.idUsuario
    )

    usuario.value = response.persona

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo cargar el usuario.'

  } finally {

    loading.value = false

  }
}

async function desactivar() {

  if (!usuario.value) {
    return
  }


  procesando.value = true
  error.value = ''

  try {

    await desactivarUsuario(
      usuario.value.id
    )

    emit(
      'navigate',
      'users-list'
    )

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo desactivar el usuario.'

  } finally {

    procesando.value = false
  }
}

async function confirmarDesactivacion() {
  if (!usuario.value) {
    return
  }

  const alert = await alertController.create({
    header: 'Desactivar usuario',
    message: `¿Desea desactivar al usuario "${usuario.value.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Desactivar',
        role: 'destructive',
        handler: () => {
          desactivar()
        }
      }
    ]
  })

  await alert.present()
}

async function reactivar() {

  if (!usuario.value) {
    return
  }

  procesando.value = true
  error.value = ''

  try {

    await reactivarUsuario(
      usuario.value.id
    )

    // Volvemos a cargar el detalle
    await cargarUsuario()

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo reactivar el usuario.'

  } finally {

    procesando.value = false
  }
}

async function confirmarReactivacion() {
  if (!usuario.value) {
    return
  }

  const alert = await alertController.create({
    header: 'Reactivar usuario',
    message: `¿Desea reactivar al usuario "${usuario.value.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Reactivar',
        handler: () => {
          reactivar()
        }
      }
    ]
  })

  await alert.present()
}

onMounted(() => {
  cargarUsuario()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Detalle de usuario"
      show-back
      @back="emit('navigate', 'users-list')"
    />


    <div
      class="
        flex-1
        overflow-y-auto
        p-4
      "
    >

      <!-- LOADING -->

      <div
        v-if="loading"
        class="
          text-center
          text-sm
          text-[#7A6558]
          py-12
        "
      >
        Cargando usuario...
      </div>


      <!-- ERROR -->

      <div
        v-else-if="error"
        class="
          bg-red-50
          border
          border-red-200
          rounded-xl
          p-4
          text-red-700
          text-sm
        "
      >

        {{ error }}

        <BaseButton
          size="sm"
          class="mt-3"
          @click="cargarUsuario"
        >
          Reintentar
        </BaseButton>

      </div>


      <!-- DATOS -->

      <div
        v-else-if="usuario"
        class="
          bg-white
          border
          border-[#D8CFC4]
          rounded-2xl
          p-5
        "
      >

        <!-- NOMBRE -->

        <div class="mb-5">

          <p
            class="
              text-xs
              text-[#7A6558]
            "
          >
            Nombre
          </p>

          <p class="font-semibold mt-1">
            {{ usuario.nombre }}
          </p>

        </div>


        <!-- USUARIO -->

        <div class="mb-5">

          <p
            class="
              text-xs
              text-[#7A6558]
            "
          >
            Usuario
          </p>

          <p class="font-semibold mt-1">
            @{{ usuario.usuario }}
          </p>

        </div>


        <!-- ROLES -->

        <div class="mb-5">

          <p
            class="
              text-xs
              text-[#7A6558]
              mb-2
            "
          >
            Roles
          </p>

          <div
            class="
              flex
              flex-wrap
              gap-2
            "
          >

            <span
              v-for="rol in usuario.roles"
              :key="rol"
              class="
                text-xs
                px-3
                py-1.5
                rounded-full
                bg-[#EEF3F0]
                text-[#2A6049]
                font-semibold
              "
            >
              {{ rol }}
            </span>

            <span
              v-if="!usuario.roles?.length"
              class="
                text-sm
                text-[#7A6558]
              "
            >
              Sin roles activos
            </span>

          </div>

        </div>

        <!-- EMPRENDIMIENTOS ASOCIADOS -->

<div class="mb-5">

  <p
    class="
      text-xs
      text-[#7A6558]
      mb-2
    "
  >
    Emprendimientos asociados
  </p>


  <!-- SIN EMPRENDIMIENTOS -->

  <div
    v-if="!usuario.empresas?.length"
    class="
      bg-[#F7F4F0]
      rounded-xl
      p-3
      text-sm
      text-[#7A6558]
    "
  >
    Sin emprendimientos asociados.
  </div>


        <!-- EMPRENDIMIENTOS -->

        <div
            v-else
            class="space-y-2"
        >

            <div
            v-for="empresa in usuario.empresas"
            :key="empresa.id"
            class="
                border
                border-[#D8CFC4]
                rounded-xl
                p-3
                bg-[#FAF9F7]
            "
            >

            <p class="font-semibold text-sm">
                {{ empresa.nombre }}
            </p>


            <p
                v-if="empresa.direccion"
                class="
                text-xs
                text-[#7A6558]
                mt-1
                "
            >
                Dirección: {{ empresa.direccion }}
            </p>


            <p
                v-if="empresa.telefono"
                class="
                text-xs
                text-[#7A6558]
                mt-1
                "
            >
                Teléfono: {{ empresa.telefono }}
            </p>

            </div>

        </div>

        </div>


        <!-- ESTADO -->

        <div class="mb-6">

          <p
            class="
              text-xs
              text-[#7A6558]
              mb-2
            "
          >
            Estado
          </p>

          <span
            class="
              text-xs
              px-3
              py-1.5
              rounded-full
              font-semibold
            "
            :class="
              usuario.estado
                ? 'bg-[#E6F5EF] text-[#1E6B47]'
                : 'bg-[#EEE] text-[#666]'
            "
          >

            {{
              usuario.estado
                ? 'Activo'
                : 'Inactivo'
            }}

          </span>

        </div>


        <!-- ACCIONES -->

        <div class="flex gap-2">

          <BaseButton
            variant="outline"
            class="flex-1"
            @click="
              emit(
                'navigate',
                'user-edit',
                {
                  idUsuario: usuario.id
                }
              )
            "
          >
            Editar
          </BaseButton>


          <!-- USUARIO ACTIVO -->

          <BaseButton
            v-if="usuario.estado"
            class="flex-1"
            variant="danger"
            :disabled="procesando"
            @click="confirmarDesactivacion"
          >
            {{
              procesando
                ? 'Procesando...'
                : 'Desactivar'
            }}
          </BaseButton>


          <!-- USUARIO INACTIVO -->

          <BaseButton
            v-else
            class="
              flex-1
              !bg-[#2A6049]
              !text-white
              !border-[#2A6049]
              hover:!bg-[#214D3B]
              disabled:opacity-50
            "
            variant="outline"
            :disabled="procesando"
            @click="confirmarReactivacion"
          >
            {{
              procesando
                ? 'Procesando...'
                : 'Reactivar'
            }}
          </BaseButton>
          
        </div>

      </div>

    </div>

  </div>

</template>