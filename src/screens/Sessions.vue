<script setup>
import { computed, onMounted, ref } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import JornadaEstadoButton from '../components/JornadaEstadoButton.vue'

import {
  listarJornadas
} from '../services/jornadaService.js'


const emit = defineEmits([
  'navigate'
])


const jornadas = ref([])

const search = ref('')
const filter = ref('todas')

const loading = ref(false)
const error = ref('')


// ========================================
// CARGAR JORNADAS
// ========================================

async function cargarJornadas() {

  loading.value = true
  error.value = ''

  try {

    const response = await listarJornadas()

    console.log(
      'Respuesta jornadas:',
      response
    )

    if (Array.isArray(response)) {

      jornadas.value = response

    } else if (
      Array.isArray(response.jornadas)
    ) {

      jornadas.value = response.jornadas

    } else {

      jornadas.value = []
    }

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar las jornadas.'

  } finally {

    loading.value = false
  }
}


// ========================================
// FORMATEAR FECHA
// ========================================

function formatearFecha(fecha) {

  if (!fecha) {
    return 'Sin fecha'
  }

  const partes = fecha.split('-')

  if (partes.length !== 3) {
    return fecha
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}


// ========================================
// FILTRAR JORNADAS
// ========================================

const jornadasFiltradas = computed(() => {

  const texto =
    search.value
      .trim()
      .toLowerCase()


  return jornadas.value.filter(jornada => {

    const nombre =
      (jornada.nombre || '')
        .toLowerCase()

    const direccion =
      (jornada.direccion || '')
        .toLowerCase()

    const fechaInicio =
      jornada.fecha_inicio || ''

    const fechaFin =
      jornada.fecha_fin || ''


    const coincideBusqueda =
      !texto ||
      nombre.includes(texto) ||
      direccion.includes(texto) ||
      fechaInicio.includes(texto) ||
      fechaFin.includes(texto)


    const coincideEstado =
      filter.value === 'todas' ||

      (
        filter.value === 'abiertas' &&
        jornada.estado === true
      ) ||

      (
        filter.value === 'finalizadas' &&
        jornada.estado === false
      )


    return (
      coincideBusqueda &&
      coincideEstado
    )
  })
})


// ========================================
// VER JORNADA
// ========================================

function verJornada(jornada) {

  emit(
    'navigate',
    'session-detail',
    {
      idJornada: jornada.id
    }
  )
}


// ========================================
// EDITAR JORNADA
// ========================================

function editarJornada(jornada) {

  emit(
    'navigate',
    'session-edit',
    {
      idJornada: jornada.id
    }
  )
}


onMounted(() => {
  cargarJornadas()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <!-- HEADER -->

    <AppHeader
      title="Jornadas"
      show-back
      @back="emit('navigate', 'home')"
    >

      <!--
      Lo conectaremos cuando hagamos
      la creación de jornadas.
      -->

      <template #right>

        <BaseButton
          size="sm"
          @click="
            emit(
              'navigate',
              'session-create'
            )
          "
        >
          + Nueva
        </BaseButton>

      </template>

    </AppHeader>


    <div
      class="
        flex-1
        overflow-y-auto
        p-4
      "
    >


      <!-- BUSCADOR -->

      <input
        v-model="search"
        type="text"
        placeholder="Buscar jornada..."
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

      <div
        class="
          flex
          gap-2
          mb-4
        "
      >

        <button
          v-for="f in [
            ['todas', 'Todas'],
            ['abiertas', 'Abiertas'],
            ['finalizadas', 'Finalizadas']
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


      <!-- CARGANDO -->

      <div
        v-if="loading"
        class="
          text-center
          text-sm
          text-[#7A6558]
          py-12
        "
      >
        Cargando jornadas...
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
          @click="cargarJornadas"
        >
          Reintentar
        </BaseButton>

      </div>


      <!-- SIN RESULTADOS -->

      <div
        v-else-if="
          jornadasFiltradas.length === 0
        "
        class="
          text-center
          text-sm
          text-[#7A6558]
          py-12
        "
      >
        No existen jornadas para mostrar.
      </div>


      <!-- LISTADO -->

      <div
        v-else
        v-for="jornada in jornadasFiltradas"
        :key="jornada.id"
        class="
          bg-white
          border
          border-[#D8CFC4]
          rounded-2xl
          p-4
          mb-3
        "
      >

        <!-- CABECERA -->

        <div
          class="
            flex
            justify-between
            gap-3
          "
        >

          <div class="flex-1">

            <p
              class="
                font-semibold
                text-base
              "
            >
              {{ jornada.nombre }}
            </p>


            <p
              class="
                text-xs
                text-[#7A6558]
                mt-1
              "
            >
              📍
              {{
                jornada.direccion ||
                'Sin dirección'
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
              font-semibold
            "
            :class="
              jornada.estado
                ? 'bg-[#E6F5EF] text-[#1E6B47]'
                : 'bg-[#EEE] text-[#666]'
            "
          >

            {{
              jornada.estado
                ? 'Abierta'
                : 'Finalizada'
            }}

          </span>

        </div>


        <!-- FECHAS -->

        <div
          class="
            bg-[#F7F4F0]
            rounded-xl
            p-3
            mt-3
          "
        >

          <div
            class="
              flex
              justify-between
              gap-4
            "
          >

            <div>

              <p
                class="
                  text-[10px]
                  text-[#7A6558]
                "
              >
                Inicio
              </p>

              <p
                class="
                  text-xs
                  font-semibold
                  mt-1
                "
              >
                {{
                  formatearFecha(
                    jornada.fecha_inicio
                  )
                }}
              </p>

            </div>


            <div class="text-right">

              <p
                class="
                  text-[10px]
                  text-[#7A6558]
                "
              >
                Fin
              </p>

              <p
                class="
                  text-xs
                  font-semibold
                  mt-1
                "
              >
                {{
                  formatearFecha(
                    jornada.fecha_fin
                  )
                }}
              </p>

            </div>

          </div>

        </div>


        <!-- ACCIONES -->

        <div
          class="
            flex
            flex-wrap
            gap-2
            mt-3
          "
        >

          <BaseButton
            size="sm"
            variant="outline"
            @click="verJornada(jornada)"
          >
            Ver
          </BaseButton>


          <BaseButton
            v-if="jornada.estado"
            size="sm"
            variant="outline"
            @click="editarJornada(jornada)"
          >
            Editar
          </BaseButton>

          <JornadaEstadoButton :jornada="jornada" @updated="cargarJornadas" />

        </div>

      </div>

    </div>

  </div>

</template>