<script setup>
import { onMounted, ref } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import RetirarProductoButton from '../components/RetirarProductoButton.vue'
import RetirarCajeroButton from '../components/RetirarCajeroButton.vue'
import JornadaEstadoButton from '../components/JornadaEstadoButton.vue'

import {
  obtenerJornada,
  obtenerCajerosJornada,
  obtenerProductosJornada
} from '../services/jornadaService.js'


const props = defineProps({
  idJornada: {
    type: [Number, String],
    required: true
  }
})


const emit = defineEmits([
  'navigate'
])


const jornada = ref(null)
const cajeros = ref([])
const productos = ref([])
const loading = ref(false)
const error = ref('')


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
// CARGAR JORNADA
// ========================================

async function cargarJornada() {

  loading.value = true
  error.value = ''

  try {

    const [
      responseJornada,
      responseCajeros,
      responseProductos
    ] = await Promise.all([
      obtenerJornada(
        props.idJornada
      ),

      obtenerCajerosJornada(
        props.idJornada
      ),
      obtenerProductosJornada(props.idJornada)
    ])


    jornada.value =
      responseJornada.jornada


    cajeros.value =
      responseCajeros.cajeros || []

    productos.value = responseProductos.productos || []


    console.log(
      'Jornada:',
      jornada.value
    )

    console.log(
      'Cajeros:',
      cajeros.value
    )

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo cargar la jornada.'

  } finally {

    loading.value = false
  }
}


onMounted(() => {
  cargarJornada()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Detalle de jornada"
      show-back
      @back="
        emit(
          'navigate',
          'sessions-list'
        )
      "
    />


    <div
      class="
        flex-1
        overflow-y-auto
        p-4
      "
    >


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
        Cargando jornada...
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
          @click="cargarJornada"
        >
          Reintentar
        </BaseButton>

      </div>


      <!-- DETALLE -->

      <div
        v-else-if="jornada"
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

          <p
            class="
              font-semibold
              mt-1
            "
          >
            {{ jornada.nombre }}
          </p>

        </div>


        <!-- DIRECCIÓN -->

        <div class="mb-5">

          <p
            class="
              text-xs
              text-[#7A6558]
            "
          >
            Dirección
          </p>

          <p
            class="
              font-semibold
              mt-1
            "
          >
            {{
              jornada.direccion ||
              'Sin dirección'
            }}
          </p>

        </div>


        <!-- FECHAS -->

        <div
          class="
            grid
            grid-cols-2
            gap-3
            mb-5
          "
        >

          <div
            class="
              bg-[#F7F4F0]
              rounded-xl
              p-3
            "
          >

            <p
              class="
                text-xs
                text-[#7A6558]
              "
            >
              Fecha de inicio
            </p>

            <p
              class="
                font-semibold
                text-sm
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


          <div
            class="
              bg-[#F7F4F0]
              rounded-xl
              p-3
            "
          >

            <p
              class="
                text-xs
                text-[#7A6558]
              "
            >
              Fecha de fin
            </p>

            <p
              class="
                font-semibold
                text-sm
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

        <!-- CAJEROS ASIGNADOS -->

        <BaseButton
          v-if="jornada.estado"
          full
          variant="outline"
          class="mb-4"
          @click="emit('navigate', 'session-cashiers', { idJornada: jornada.id })"
        >
          Asignar cajeros
        </BaseButton>

        <div class="mb-6">

        <div
            class="
            flex
            justify-between
            items-center
            mb-3
            "
        >

            <div>

            <p
                class="
                text-sm
                font-semibold
                "
            >
                Cajeros asignados
            </p>

            <p
                class="
                text-xs
                text-[#7A6558]
                mt-1
                "
            >
                Personal asignado a esta jornada
            </p>

            </div>


            <span
            class="
                text-xs
                bg-[#F7F4F0]
                text-[#7A6558]
                px-2
                py-1
                rounded-full
            "
            >
            {{ cajeros.length }}
            </span>

        </div>


        <!-- SIN CAJEROS -->

        <div
            v-if="cajeros.length === 0"
            class="
            bg-[#F7F4F0]
            rounded-xl
            p-3
            text-sm
            text-[#7A6558]
            "
        >
            No existen cajeros asignados a esta jornada.
        </div>


        <!-- LISTADO -->

        <div
            v-else
            class="space-y-2"
        >

            <div
            v-for="cajero in cajeros"
            :key="cajero.id_jornada_cajero"
            class="
                border
                border-[#D8CFC4]
                rounded-xl
                p-3
                bg-[#FAF9F7]
            "
            >

            <div
                class="
                flex
                justify-between
                gap-3
                "
            >

                <div>

                <p
                    class="
                    text-sm
                    font-semibold
                    "
                >
                    {{ cajero.persona.nombre }}
                </p>


                <p
                    class="
                    text-xs
                    text-[#7A6558]
                    mt-1
                    "
                >
                    @{{ cajero.persona.usuario }}
                </p>


                <p
                    class="
                    text-xs
                    text-[#7A6558]
                    mt-1
                    "
                >
                    Asignado:
                    {{ formatearFecha(cajero.fecha) }}
                </p>

                </div>


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
                    cajero.estado
                    ? 'bg-[#E6F5EF] text-[#1E6B47]'
                    : 'bg-[#EEE] text-[#666]'
                "
                >
                {{
                    cajero.estado
                    ? 'Activo'
                    : 'Inactivo'
                }}
                </span>

            </div>

            <RetirarCajeroButton
              v-if="jornada.estado && cajero.estado"
              class="mt-3"
              :jornada="jornada"
              :cajero="cajero"
              @updated="cargarJornada"
            />

            </div>

        </div>

        </div>


        <section class="mb-6">
          <h2 class="text-sm font-semibold mb-3">Productos de la jornada ({{ productos.filter(item => item.estado).length }} activos)</h2>
          <BaseButton v-if="jornada.estado" full variant="outline" class="mb-3"
            @click="emit('navigate', 'session-products', { idJornada: jornada.id })">
            Asignar productos
          </BaseButton>
          <p v-if="!productos.length" class="bg-[#F7F4F0] rounded-xl p-3 text-sm text-[#7A6558]">No existen productos asignados a esta jornada.</p>
          <div v-else class="space-y-2">
            <div v-for="item in productos" :key="item.id_jornada_producto" class="border border-[#D8CFC4] rounded-xl p-3 bg-[#FAF9F7]">
              <div class="flex justify-between gap-3">
                <p class="text-sm font-semibold break-words min-w-0">{{ item.producto.nombre }}</p>
                <span class="text-xs rounded-full px-2 py-1 h-fit shrink-0"
                  :class="item.estado ? 'bg-[#E6F5EF] text-[#1E6B47]' : 'bg-[#EEE] text-[#666]'">
                  {{ item.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <p class="text-xs text-[#7A6558] mt-2">Stock actual: {{ item.producto.cantidad }} · Bs {{ Number(item.producto.precio_final).toFixed(2) }}</p>
              <p class="text-xs text-[#7A6558] mt-1">Asignado: {{ formatearFecha(item.fecha) }}</p>
              <RetirarProductoButton
                v-if="jornada.estado && item.estado"
                class="mt-3"
                :jornada="jornada"
                :producto="item"
                @updated="cargarJornada"
              />
            </div>
          </div>
        </section>

        <!-- ACCIONES -->

        <div
          class="
            flex
            flex-wrap
            gap-2
          "
        >

          <BaseButton
            v-if="jornada.estado"
            variant="outline"
            class="flex-1"
            @click="
              emit(
                'navigate',
                'session-edit',
                {
                  idJornada:
                    jornada.id
                }
              )
            "
          >
            Editar
          </BaseButton>




          <JornadaEstadoButton :jornada="jornada" @updated="cargarJornada" />

        </div>

      </div>

    </div>

  </div>

</template>