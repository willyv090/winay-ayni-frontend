<script setup>
import { onMounted, reactive, ref } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import {
  crearEmpresa
} from '../services/empresaService.js'

import {
  listarUsuarios
} from '../services/usuarioService.js'


const emit = defineEmits([
  'navigate'
])


const personas = ref([])

const loading = ref(false)
const loadingPersonas = ref(false)

const error = ref('')
const mensaje = ref('')


const form = reactive({
  nombre: '',
  direccion: '',
  telefono: '',
  personas: []
})


const errors = reactive({
  nombre: '',
  telefono: ''
})


// ========================================
// LIMPIAR ERRORES
// ========================================

function limpiarErrores() {

  errors.nombre = ''
  errors.telefono = ''

  error.value = ''
  mensaje.value = ''
}


// ========================================
// CARGAR PERSONAS
// ========================================

async function cargarPersonas() {

  loadingPersonas.value = true

  try {

    const response = await listarUsuarios()

    if (Array.isArray(response)) {

      personas.value = response

    } else if (Array.isArray(response.personas)) {

      personas.value = response.personas

    } else {

      personas.value = []

    }

    // Solo personas activas
    personas.value = personas.value.filter(
      persona => persona.estado === true
    )

  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar las personas.'

  } finally {

    loadingPersonas.value = false
  }
}


// ========================================
// VALIDAR
// ========================================

function validarFormulario() {

  limpiarErrores()

  let valido = true


  if (!form.nombre.trim()) {

    errors.nombre =
      'Ingrese el nombre del emprendimiento.'

    valido = false
  }


  if (!form.telefono.trim()) {

    errors.telefono =
      'Ingrese un número de teléfono.'

    valido = false

  } else if (
    !/^\d{7,10}$/.test(
      form.telefono.trim()
    )
  ) {

    errors.telefono =
      'Ingrese un teléfono válido.'

    valido = false
  }


  return valido
}


// ========================================
// GUARDAR
// ========================================

async function guardar() {

  if (!validarFormulario()) {
    return
  }

  loading.value = true
  error.value = ''
  mensaje.value = ''


  try {

    const payload = {

      nombre:
        form.nombre.trim(),

      direccion:
        form.direccion.trim() || null,

      telefono:
        Number(form.telefono),

      personas:
        form.personas.map(Number)
    }


    console.log(
      'Empresa enviada:',
      payload
    )


    const response = await crearEmpresa(
      payload
    )


    mensaje.value =
      response.mensaje ||
      'Emprendimiento registrado correctamente.'


    setTimeout(() => {

      emit(
        'navigate',
        'businesses-list'
      )

    }, 700)


  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo registrar el emprendimiento.'

  } finally {

    loading.value = false
  }
}


onMounted(() => {
  cargarPersonas()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Nuevo emprendimiento"
      show-back
      @back="
        emit(
          'navigate',
          'businesses-list'
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
            Nombre *
          </label>

          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej. Velas Artesanales Condori"
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


        <!-- DIRECCIÓN -->

        <div class="mb-4">

          <label
            class="
              text-sm
              font-semibold
            "
          >
            Dirección
          </label>

          <input
            v-model="form.direccion"
            type="text"
            placeholder="Ej. Av. Montes 345"
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

        </div>


        <!-- TELÉFONO -->

        <div class="mb-5">

          <label
            class="
              text-sm
              font-semibold
            "
          >
            Teléfono *
          </label>

          <input
            v-model="form.telefono"
            type="tel"
            inputmode="numeric"
            placeholder="Ej. 71234567"
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
            v-if="errors.telefono"
            class="
              text-xs
              text-red-600
              mt-1
            "
          >
            {{ errors.telefono }}
          </p>

        </div>


        <!-- PERSONAS ASOCIADAS -->

        <div class="mb-5">

          <p
            class="
              text-sm
              font-semibold
            "
          >
            Personas asociadas
          </p>

          <p
            class="
              text-xs
              text-[#7A6558]
              mt-1
              mb-3
            "
          >
            Puede seleccionar una o varias personas.
          </p>


          <!-- LOADING -->

          <p
            v-if="loadingPersonas"
            class="
              text-sm
              text-[#7A6558]
            "
          >
            Cargando personas...
          </p>


          <!-- SIN PERSONAS -->

          <div
            v-else-if="personas.length === 0"
            class="
              bg-[#F7F4F0]
              rounded-xl
              p-3
              text-sm
              text-[#7A6558]
            "
          >
            No existen personas activas disponibles.
          </div>


          <!-- PERSONAS -->

          <div
            v-else
            class="space-y-2"
          >

            <label
              v-for="persona in personas"
              :key="persona.id || persona.id_per"
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
                v-model="form.personas"
                type="checkbox"
                :value="
                  persona.id ||
                  persona.id_per
                "
              />


              <div>

                <p
                  class="
                    text-sm
                    font-semibold
                  "
                >
                  {{ persona.nombre }}
                </p>

                <p
                  class="
                    text-xs
                    text-[#7A6558]
                  "
                >
                  @{{ persona.usuario }}
                </p>

              </div>

            </label>

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


        <!-- BOTONES -->

        <div class="flex gap-3">

          <BaseButton
            full
            variant="secondary"
            :disabled="loading"
            @click="
              emit(
                'navigate',
                'businesses-list'
              )
            "
          >
            Cancelar
          </BaseButton>


          <BaseButton
            full
            :disabled="loading"
            @click="guardar"
          >

            {{
              loading
                ? 'Guardando...'
                : 'Registrar'
            }}

          </BaseButton>

        </div>

      </div>

    </div>

  </div>

</template>