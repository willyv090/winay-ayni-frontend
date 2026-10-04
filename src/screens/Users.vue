<script setup>
import { computed, onMounted, ref } from 'vue'
import { alertController } from '@ionic/vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import { listarUsuarios, desactivarUsuario, reactivarUsuario } from '../services/usuarioService.js'


const emit = defineEmits(['navigate'])

const usuarios = ref([])
const search = ref('')
const filter = ref('todos')
const loading = ref(false)
const error = ref('')
const procesandoId = ref(null)

async function cargarUsuarios() {
  loading.value = true
  error.value = ''

  try {
    const response = await listarUsuarios()

    console.log('Respuesta usuarios:', response)

    if (Array.isArray(response)) {
      usuarios.value = response
    } else if (Array.isArray(response.personas)) {
      usuarios.value = response.personas
    } else if (Array.isArray(response.usuarios)) {
      usuarios.value = response.usuarios
    } else {
      usuarios.value = []
    }

  } catch (err) {
    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar los usuarios.'

  } finally {
    loading.value = false
  }
}


const usuariosFiltrados = computed(() => {
  const texto = search.value.trim().toLowerCase()

  return usuarios.value.filter(usuario => {
    const nombre = (
      usuario.nombre ||
      usuario.name ||
      ''
    ).toLowerCase()

    const username = (
      usuario.usuario ||
      usuario.username ||
      ''
    ).toLowerCase()

    const coincideBusqueda =
      !texto ||
      nombre.includes(texto) ||
      username.includes(texto)

    const estado =
      usuario.estado !== undefined
        ? usuario.estado
        : usuario.active

    const coincideEstado =
      filter.value === 'todos' ||
      (
        filter.value === 'activos' &&
        estado === true
      ) ||
      (
        filter.value === 'inactivos' &&
        estado === false
      )

    return coincideBusqueda && coincideEstado
  })
})


function obtenerRoles(usuario) {
  if (!Array.isArray(usuario.roles)) {
    return []
  }

  return usuario.roles.map(rol => {
    if (typeof rol === 'string') {
      return rol
    }

    return (
      rol.nombre ||
      rol.rol ||
      rol.nombre_rol ||
      ''
    )
  }).filter(Boolean)
}


function obtenerId(usuario) {
  return usuario.id || usuario.id_per
}

async function desactivar(usuario) {

  const id = obtenerId(usuario)

  procesandoId.value = id
  error.value = ''

  try {

    const response = await desactivarUsuario(id)

    console.log(
      'Usuario desactivado:',
      response
    )

    // Volvemos a consultar el listado real
    await cargarUsuarios()

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo desactivar el usuario.'

  } finally {

    procesandoId.value = null
  }
}

async function reactivar(usuario) {

  const id = obtenerId(usuario)

  procesandoId.value = id
  error.value = ''

  try {

    const response = await reactivarUsuario(id)

    console.log(
      'Usuario reactivado:',
      response
    )

    await cargarUsuarios()

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo reactivar el usuario.'

  } finally {

    procesandoId.value = null
  }
}

async function confirmarDesactivacion(usuario) {

  const alert = await alertController.create({
    header: 'Desactivar usuario',
    message: `¿Desea desactivar al usuario "${usuario.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Desactivar',
        role: 'destructive',
        handler: () => {
          desactivar(usuario)
        }
      }
    ]
  })

  await alert.present()
}

async function confirmarReactivacion(usuario) {

  const alert = await alertController.create({
    header: 'Reactivar usuario',
    message: `¿Desea reactivar al usuario "${usuario.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Reactivar',
        handler: () => {
          reactivar(usuario)
        }
      }
    ]
  })

  await alert.present()
}

function verUsuario(usuario) {
  emit(
    'navigate',
    'user-detail',
    {
      idUsuario: obtenerId(usuario)
    }
  )
}

function estaActivo(usuario) {
  if (usuario.estado !== undefined) {
    return usuario.estado
  }

  return usuario.active
}


onMounted(() => {
  cargarUsuarios()
})
</script>


<template>
  <div class="h-full flex flex-col relative">

    <AppHeader
      title="Usuarios"
      show-back
      @back="emit('navigate', 'home')"
    >
      <template #right>
        <BaseButton
          size="sm"
          @click="emit('navigate', 'user-create')"
        >
          + Nuevo
        </BaseButton>
      </template>
    </AppHeader>


    <div class="flex-1 overflow-y-auto p-4">

      <input
        v-model="search"
        placeholder="Buscar usuario..."
        class="w-full h-10 rounded-xl border border-[#D8CFC4] bg-white px-4 text-sm mb-3"
      />


      <div class="flex gap-2 mb-4">
        <button
          v-for="f in [
            ['todos', 'Todos'],
            ['activos', 'Activos'],
            ['inactivos', 'Inactivos']
          ]"
          :key="f[0]"
          @click="filter = f[0]"
          class="px-3 py-1.5 rounded-full text-xs font-semibold"
          :class="
            filter === f[0]
              ? 'bg-[#2A6049] text-white'
              : 'bg-white border border-[#D8CFC4]'
          "
        >
          {{ f[1] }}
        </button>
      </div>


      <div
        v-if="loading"
        class="text-center text-sm text-[#7A6558] py-12"
      >
        Cargando usuarios...
      </div>


      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
      >
        <p>{{ error }}</p>

        <BaseButton
          size="sm"
          class="mt-3"
          @click="cargarUsuarios"
        >
          Reintentar
        </BaseButton>
      </div>


      <div
        v-else-if="usuariosFiltrados.length === 0"
        class="text-center text-sm text-[#7A6558] py-12"
      >
        No encontramos usuarios.
      </div>


      <div
        v-else
        v-for="usuario in usuariosFiltrados"
        :key="obtenerId(usuario)"
        class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3"
      >

        <div class="flex justify-between gap-3">

          <div class="flex-1">

            <p class="font-semibold">
              {{ usuario.nombre || usuario.name }}
            </p>


            <p class="text-xs text-[#7A6558] mt-1">
              @{{ usuario.usuario || usuario.username }}
            </p>


            <div class="flex flex-wrap gap-1 mt-2">

              <span
                v-for="rol in obtenerRoles(usuario)"
                :key="rol"
                class="text-[10px] px-2 py-1 rounded-full bg-[#EEF3F0] text-[#2A6049] font-semibold"
              >
                {{ rol }}
              </span>

            </div>

          </div>


          <span
            class="text-[10px] px-2 py-1 rounded-full h-fit"
            :class="
              estaActivo(usuario)
                ? 'bg-[#E6F5EF] text-[#1E6B47]'
                : 'bg-[#EEE] text-[#666]'
            "
          >
            {{ estaActivo(usuario) ? 'Activo' : 'Inactivo' }}
          </span>

        </div>


        <div class="flex gap-2 mt-3">

          <BaseButton
            size="sm"
            variant="outline"
            @click="verUsuario(usuario)"
          >
            Ver
          </BaseButton>

          <BaseButton
            size="sm"
            variant="outline"
            @click="emit('navigate', 'user-edit', { idUsuario: obtenerId(usuario) })"
          >
            Editar
          </BaseButton>

          <BaseButton
            v-if="estaActivo(usuario)"
            size="sm"
            variant="danger"
            @click="confirmarDesactivacion(usuario)"
          >
            Desactivar
          </BaseButton>


          <BaseButton
            v-else
            size="sm"
            class="
              !bg-[#2A6049]
              !text-white
              !border-[#2A6049]
              hover:!bg-[#214D3B]
              disabled:opacity-50
            "
            variant="outline"
            :disabled="procesandoId === obtenerId(usuario)"
            @click="confirmarReactivacion(usuario)"
          >
            {{
              procesandoId === obtenerId(usuario)
                ? 'Procesando...'
                : 'Reactivar'
            }}
          </BaseButton>

        </div>

      </div>

    </div>

  </div>
</template>