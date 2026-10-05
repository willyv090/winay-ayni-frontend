<script setup>
import { computed, onMounted, ref } from 'vue'
import { alertController } from '@ionic/vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import {
  listarEmpresas,
  desactivarEmpresa,
  reactivarEmpresa
} from '../services/empresaService.js'


const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})


const emit = defineEmits([
  'navigate'
])


const empresas = ref([])

const search = ref('')
const filter = ref('todos')

const loading = ref(false)
const error = ref('')
const procesandoId = ref(null)

const isAdmin = computed(() =>
  props.currentUser?.roles?.includes('ADMINISTRADOR')
)


// ========================================
// CARGAR EMPRESAS
// ========================================

async function cargarEmpresas() {

  loading.value = true
  error.value = ''

  try {

    const response = await listarEmpresas()

    console.log(
      'Respuesta empresas:',
      response
    )

    if (Array.isArray(response)) {

      empresas.value = response

    } else if (Array.isArray(response.empresas)) {

      empresas.value = response.empresas

    } else {

      empresas.value = []

    }

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar los emprendimientos.'

  } finally {

    loading.value = false

  }
}


// ========================================
// ID EMPRESA
// ========================================

function obtenerId(empresa) {

  return (
    empresa.id ??
    empresa.id_empresa
  )
}


// ========================================
// ESTADO
// ========================================

function estaActiva(empresa) {

  if (empresa.estado !== undefined) {
    return empresa.estado
  }

  return empresa.active
}


// ========================================
// FILTROS
// ========================================

const empresasFiltradas = computed(() => {

  const texto =
    search.value
      .trim()
      .toLowerCase()


  return empresas.value.filter(empresa => {

    const nombre = (
      empresa.nombre ||
      empresa.name ||
      ''
    ).toLowerCase()


    const direccion = (
      empresa.direccion ||
      empresa.address ||
      ''
    ).toLowerCase()


    const telefono = String(
      empresa.telefono ||
      empresa.phone ||
      ''
    ).toLowerCase()


    const coincideBusqueda =
      !texto ||
      nombre.includes(texto) ||
      direccion.includes(texto) ||
      telefono.includes(texto)


    const estado = estaActiva(empresa)


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


    return (
      coincideBusqueda &&
      coincideEstado
    )

  })
})


async function confirmarDesactivacion(empresa) {

  const id = obtenerId(empresa)

  const alert = await alertController.create({
    header: 'Desactivar emprendimiento',
    message: `¿Está seguro de desactivar "${empresa.nombre}"? La información histórica se conservará.`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Desactivar',
        role: 'destructive',

        handler: async () => {

          procesandoId.value = id

          try {

            await desactivarEmpresa(id)

            await cargarEmpresas()

          } catch (err) {

            console.error(err)

            const errorAlert =
              await alertController.create({
                header: 'Error',
                message:
                  err.message ||
                  'No se pudo desactivar el emprendimiento.',
                buttons: ['Aceptar']
              })

            await errorAlert.present()

          } finally {

            procesandoId.value = null
          }
        }
      }
    ]
  })

  await alert.present()
}

async function confirmarReactivacion(empresa) {

  const id = obtenerId(empresa)

  const alert = await alertController.create({
    header: 'Reactivar emprendimiento',
    message: `¿Desea reactivar "${empresa.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Reactivar',

        handler: async () => {

          procesandoId.value = id

          try {

            await reactivarEmpresa(id)

            await cargarEmpresas()

          } catch (err) {

            console.error(err)

            const errorAlert =
              await alertController.create({
                header: 'Error',
                message:
                  err.message ||
                  'No se pudo reactivar el emprendimiento.',
                buttons: ['Aceptar']
              })

            await errorAlert.present()

          } finally {

            procesandoId.value = null
          }
        }
      }
    ]
  })

  await alert.present()
}

// ========================================
// NAVEGACIONES
// ========================================

function verEmpresa(empresa) {

  emit(
    'navigate',
    'business-detail',
    {
      idEmpresa: obtenerId(empresa)
    }
  )
}


function editarEmpresa(empresa) {

  emit(
    'navigate',
    'business-edit',
    {
      idEmpresa: obtenerId(empresa)
    }
  )
}


onMounted(() => {
  cargarEmpresas()
})
</script>


<template>

  <div class="h-full flex flex-col relative">

    <!-- HEADER -->

    <AppHeader
      title="Emprendimientos"
      show-back
      @back="emit('navigate', 'home')"
    >

      <template #right>

        <BaseButton
          v-if="isAdmin"
          size="sm"
          @click="
            emit(
              'navigate',
              'business-create'
            )
          "
        >
          + Nuevo
        </BaseButton>

      </template>

    </AppHeader>


    <div class="flex-1 overflow-y-auto p-4">


      <!-- BUSCADOR -->

      <input
        v-model="search"
        placeholder="Buscar emprendimiento..."
        class="
          w-full
          h-10
          rounded-xl
          border
          border-[#D8CFC4]
          bg-white
          px-4
          text-sm
          mb-3
        "
      />


      <!-- FILTROS -->

      <div class="flex gap-2 mb-4">

        <button
          v-for="f in [
            ['todos', 'Todos'],
            ['activos', 'Activos'],
            ['inactivos', 'Inactivos']
          ]"
          :key="f[0]"
          @click="filter = f[0]"
          class="
            px-3
            py-1.5
            rounded-full
            text-xs
            font-semibold
          "
          :class="
            filter === f[0]
              ? 'bg-[#2A6049] text-white'
              : 'bg-white border border-[#D8CFC4]'
          "
        >
          {{ f[1] }}
        </button>

      </div>


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
        Cargando emprendimientos...
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
          text-sm
          text-red-700
        "
      >

        <p>
          {{ error }}
        </p>

        <BaseButton
          size="sm"
          class="mt-3"
          @click="cargarEmpresas"
        >
          Reintentar
        </BaseButton>

      </div>


      <!-- SIN RESULTADOS -->

      <div
        v-else-if="empresasFiltradas.length === 0"
        class="
          text-center
          text-sm
          text-[#7A6558]
          py-12
        "
      >
        No existen emprendimientos para mostrar.
      </div>


      <!-- LISTADO -->

      <div
        v-else
        v-for="empresa in empresasFiltradas"
        :key="obtenerId(empresa)"
        class="
          bg-white
          border
          border-[#D8CFC4]
          rounded-2xl
          p-4
          mb-3
        "
      >

        <div class="flex justify-between gap-3">

          <div class="flex-1">

            <!-- NOMBRE -->

            <p class="font-semibold">

              {{
                empresa.nombre ||
                empresa.name
              }}

            </p>


            <!-- DIRECCIÓN -->

            <p
              class="
                text-xs
                text-[#7A6558]
                mt-1
              "
            >

              📍
              {{
                empresa.direccion ||
                empresa.address ||
                'Sin dirección'
              }}

            </p>


            <!-- TELÉFONO -->

            <p
              class="
                text-xs
                text-[#7A6558]
                mt-1
              "
            >

              ☎
              {{
                empresa.telefono ||
                empresa.phone ||
                'Sin teléfono'
              }}

            </p>

          </div>


          <!-- ESTADO -->

          <span
            class="
              text-[10px]
              px-2
              py-1
              rounded-full
              h-fit
            "
            :class="
              estaActiva(empresa)
                ? 'bg-[#E6F5EF] text-[#1E6B47]'
                : 'bg-[#EEE] text-[#666]'
            "
          >

            {{
              estaActiva(empresa)
                ? 'Activo'
                : 'Inactivo'
            }}

          </span>

        </div>


        <!-- PERSONAS ASOCIADAS -->

        <p
          v-if="
            empresa.cantidad_personas !== undefined
          "
          class="
            text-xs
            text-[#7A6558]
            mt-2
          "
        >
          Personas asociadas:
          {{ empresa.cantidad_personas }}
        </p>


        <!-- ACCIONES -->

        <div
          v-if="isAdmin"
          class="flex gap-2 mt-3"
        >

          <BaseButton
            size="sm"
            variant="outline"
            @click="verEmpresa(empresa)"
          >
            Ver
          </BaseButton>


          <BaseButton
            size="sm"
            variant="outline"
            @click="editarEmpresa(empresa)"
          >
            Editar
          </BaseButton>


          <BaseButton
            v-if="estaActiva(empresa)"
            size="sm"
            variant="danger"
            :disabled="
              procesandoId === obtenerId(empresa)
            "
            @click="
              confirmarDesactivacion(empresa)
            "
          >
            {{
              procesandoId === obtenerId(empresa)
                ? 'Procesando...'
                : 'Desactivar'
            }}
          </BaseButton>


          <BaseButton
            v-else
            size="sm"
            variant="outline"
            class="
              !bg-[#2A6049]
              !text-white
              !border-[#2A6049]
              hover:!bg-[#214D3B]
              disabled:opacity-50
            "
            :disabled="
              procesandoId === obtenerId(empresa)
            "
            @click="
              confirmarReactivacion(empresa)
            "
          >
            {{
              procesandoId === obtenerId(empresa)
                ? 'Procesando...'
                : 'Reactivar'
            }}
          </BaseButton>

        </div>

      </div>

    </div>

  </div>

</template>