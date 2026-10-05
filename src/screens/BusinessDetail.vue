<script setup>
import { onMounted, ref } from 'vue'
import { alertController } from '@ionic/vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import {
  obtenerEmpresa,
  desactivarEmpresa,
  reactivarEmpresa
} from '../services/empresaService.js'


const props = defineProps({
  idEmpresa: {
    type: Number,
    required: true
  }
})


const emit = defineEmits([
  'navigate'
])


const empresa = ref(null)
const loading = ref(false)
const error = ref('')
const procesando = ref(false)

async function cargarEmpresa() {

  loading.value = true
  error.value = ''

  try {

    const response = await obtenerEmpresa(
      props.idEmpresa
    )

    empresa.value = response.empresa

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo cargar el emprendimiento.'

  } finally {

    loading.value = false
  }
}

async function confirmarDesactivacion() {

  if (!empresa.value) {
    return
  }


  const alert = await alertController.create({
    header: 'Desactivar emprendimiento',
    message: `¿Está seguro de desactivar "${empresa.value.nombre}"? La información histórica se conservará.`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },

      {
        text: 'Desactivar',
        role: 'destructive',

        handler: async () => {

          procesando.value = true

          try {

            await desactivarEmpresa(
              empresa.value.id
            )

            await cargarEmpresa()

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

            procesando.value = false
          }
        }
      }
    ]
  })

  await alert.present()
}

async function confirmarReactivacion() {

  if (!empresa.value) {
    return
  }


  const alert = await alertController.create({
    header: 'Reactivar emprendimiento',
    message: `¿Desea reactivar "${empresa.value.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },

      {
        text: 'Reactivar',

        handler: async () => {

          procesando.value = true

          try {

            await reactivarEmpresa(
              empresa.value.id
            )

            await cargarEmpresa()

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

            procesando.value = false
          }
        }
      }
    ]
  })

  await alert.present()
}


onMounted(() => {
  cargarEmpresa()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Detalle del emprendimiento"
      show-back
      @back="emit('navigate', 'businesses-list')"
    />


    <div class="flex-1 overflow-y-auto p-4">


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
        Cargando emprendimiento...
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
          @click="cargarEmpresa"
        >
          Reintentar
        </BaseButton>

      </div>


      <!-- DATOS -->

      <div
        v-else-if="empresa"
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
            {{ empresa.nombre }}
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
              empresa.direccion ||
              'Sin dirección'
            }}
          </p>

        </div>


        <!-- TELÉFONO -->

        <div class="mb-5">

          <p
            class="
              text-xs
              text-[#7A6558]
            "
          >
            Teléfono
          </p>

          <p
            class="
              font-semibold
              mt-1
            "
          >
            {{
              empresa.telefono ||
              'Sin teléfono'
            }}
          </p>

        </div>


        <!-- ESTADO -->

        <div class="mb-5">

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
              empresa.estado
                ? 'bg-[#E6F5EF] text-[#1E6B47]'
                : 'bg-[#EEE] text-[#666]'
            "
          >

            {{
              empresa.estado
                ? 'Activo'
                : 'Inactivo'
            }}

          </span>

        </div>


        <!-- PERSONAS ASOCIADAS -->

        <div class="mb-6">

          <p
            class="
              text-xs
              text-[#7A6558]
              mb-2
            "
          >
            Personas asociadas
          </p>


          <!-- SIN PERSONAS -->

          <div
            v-if="!empresa.personas?.length"
            class="
              bg-[#F7F4F0]
              rounded-xl
              p-3
              text-sm
              text-[#7A6558]
            "
          >
            Sin personas asociadas.
          </div>


          <!-- PERSONAS -->

          <div
            v-else
            class="space-y-2"
          >

            <div
              v-for="persona in empresa.personas"
              :key="persona.id"
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
                      font-semibold
                      text-sm
                    "
                  >
                    {{ persona.nombre }}
                  </p>

                  <p
                    class="
                      text-xs
                      text-[#7A6558]
                      mt-1
                    "
                  >
                    @{{ persona.usuario }}
                  </p>

                </div>


                <span
                  class="
                    text-[10px]
                    px-2
                    py-1
                    rounded-full
                    h-fit
                  "
                  :class="
                    persona.estado
                      ? 'bg-[#E6F5EF] text-[#1E6B47]'
                      : 'bg-[#EEE] text-[#666]'
                  "
                >
                  {{
                    persona.estado
                      ? 'Activo'
                      : 'Inactivo'
                  }}
                </span>

              </div>

            </div>

          </div>

        </div>


        <!-- ACCIONES -->

        <div class="flex gap-2">

          <BaseButton
            variant="outline"
            class="flex-1"
            @click="
              emit(
                'navigate',
                'business-edit',
                {
                  idEmpresa: empresa.id
                }
              )
            "
          >
            Editar
          </BaseButton>


          <BaseButton
            v-if="empresa.estado"
            variant="danger"
            class="flex-1"
            :disabled="procesando"
            @click="confirmarDesactivacion"
          >
            {{
              procesando
              ? 'Procesando...'
              : 'Desactivar'
            }}
          </BaseButton>


          <BaseButton
            v-else
            variant="outline"
            class="
                flex-1
                !bg-[#2A6049]
                !text-white
                !border-[#2A6049]
                hover:!bg-[#214D3B]
                disabled:opacity-50
            "
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