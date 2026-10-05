<script setup>
import { onMounted, reactive, ref } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'

import {
  obtenerEmpresa,
  editarEmpresa
} from '../services/empresaService.js'

import {
  listarUsuarios
} from '../services/usuarioService.js'


const props = defineProps({
  idEmpresa: {
    type: [Number, String],
    required: true
  }
})


const emit = defineEmits([
  'navigate'
])


const personas = ref([])

const loading = ref(false)
const loadingInicial = ref(false)
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
// CARGAR DATOS
// ========================================

async function cargarDatos() {

  loadingInicial.value = true
  error.value = ''

  try {

    const [
      responseEmpresa,
      responsePersonas
    ] = await Promise.all([
      obtenerEmpresa(props.idEmpresa),
      listarUsuarios()
    ])


    // ====================================
    // EMPRESA
    // ====================================

    const empresa = responseEmpresa.empresa

    if (!empresa) {
      throw new Error(
        'No se encontró el emprendimiento.'
      )
    }


    form.nombre =
      empresa.nombre || ''

    form.direccion =
      empresa.direccion || ''

    form.telefono =
      empresa.telefono
        ? String(empresa.telefono)
        : ''


    // Personas actualmente asociadas
    form.personas = (
      empresa.personas || []
    ).map(
      persona => Number(persona.id)
    )


    // ====================================
    // PERSONAS DISPONIBLES
    // ====================================

    let listadoPersonas = []

    if (
      Array.isArray(responsePersonas)
    ) {

      listadoPersonas =
        responsePersonas

    } else if (
      Array.isArray(
        responsePersonas.personas
      )
    ) {

      listadoPersonas =
        responsePersonas.personas
    }


    // Para asociar solamente personas activas
    personas.value =
      listadoPersonas.filter(
        persona =>
          persona.estado === true
      )


  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudieron cargar los datos.'

  } finally {

    loadingInicial.value = false
  }
}


// ========================================
// VALIDACIÓN
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
// GUARDAR CAMBIOS
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
        form.direccion.trim(),

      telefono:
        Number(form.telefono),

      personas:
        form.personas.map(Number)
    }


    console.log(
      'Empresa editada:',
      payload
    )


    const response =
      await editarEmpresa(
        props.idEmpresa,
        payload
      )


    mensaje.value =
      response.mensaje ||
      'Emprendimiento actualizado correctamente.'


    setTimeout(() => {

      emit(
        'navigate',
        'business-detail',
        {
          idEmpresa:
            Number(props.idEmpresa)
        }
      )

    }, 700)


  } catch (err) {

    console.error(err)

    error.value =
      err.message ||
      'No se pudo actualizar el emprendimiento.'

  } finally {

    loading.value = false
  }
}


onMounted(() => {
  cargarDatos()
})
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader
      title="Editar emprendimiento"
      show-back
      @back="
        emit(
          'navigate',
          'business-detail',
          {
            idEmpresa: Number(idEmpresa)
          }
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
        v-if="loadingInicial"
        class="
          text-center
          text-sm
          text-[#7A6558]
          py-12
        "
      >
        Cargando emprendimiento...
      </div>


      <!-- ERROR INICIAL -->

      <div
        v-else-if="
          error &&
          !form.nombre
        "
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
            placeholder="Nombre del emprendimiento"
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
            placeholder="Dirección"
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
            placeholder="71234567"
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


        <!-- PERSONAS -->

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
            Seleccione las personas que pertenecen
            al emprendimiento.
          </p>


          <div
            v-if="personas.length === 0"
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


          <div
            v-else
            class="space-y-2"
          >

            <label
              v-for="persona in personas"
              :key="
                persona.id ||
                persona.id_per
              "
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
                  Number(
                    persona.id ||
                    persona.id_per
                  )
                "
              />


              <div class="flex-1">

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


              <span
                class="
                  text-[10px]
                  px-2
                  py-1
                  rounded-full
                  bg-[#E6F5EF]
                  text-[#1E6B47]
                "
              >
                Activo
              </span>

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
                'business-detail',
                {
                  idEmpresa:
                    Number(idEmpresa)
                }
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
                : 'Guardar cambios'
            }}

          </BaseButton>

        </div>

      </div>

    </div>

  </div>

</template>