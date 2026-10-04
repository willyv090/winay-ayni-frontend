<script setup>
import { computed } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import { modules } from '../config/navigation.js'


const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})


const emit = defineEmits([
  'navigate',
  'logout'
])


const modulosVisibles = computed(() => {

  const rolesUsuario = props.user.roles || []

  return modules.filter(modulo =>
    modulo.roles.some(rol =>
      rolesUsuario.includes(rol)
    )
  )
})


const secciones = computed(() => {

  const resultado = {}

  modulosVisibles.value.forEach(modulo => {

    if (!resultado[modulo.section]) {
      resultado[modulo.section] = []
    }

    resultado[modulo.section].push(modulo)
  })

  return resultado
})


function abrirModulo(modulo) {
  emit('navigate', modulo.screen)
}
</script>


<template>

  <div class="h-full flex flex-col">

    <AppHeader title="Inicio" />


    <div class="flex-1 overflow-y-auto p-4">

      <!-- BIENVENIDA -->

      <div
        class="
          bg-[#2A6049]
          text-white
          rounded-2xl
          p-5
          mb-5
        "
      >

        <p class="text-sm opacity-80">
          Bienvenido
        </p>

        <h2 class="text-xl font-bold mt-1">
          {{ user.name || user.nombre }}
        </h2>


        <!-- ROLES -->

        <div class="flex flex-wrap gap-2 mt-3">

          <span
            v-for="rol in user.roles"
            :key="rol"
            class="
              bg-white/20
              px-2
              py-1
              rounded-full
              text-xs
            "
          >
            {{ rol }}
          </span>

        </div>

      </div>


      <!-- SECCIONES -->

      <div
        v-for="(items, nombreSeccion) in secciones"
        :key="nombreSeccion"
        class="mb-6"
      >

        <h3
          class="
            font-semibold
            text-[#4A3B32]
            mb-3
          "
        >
          {{ nombreSeccion }}
        </h3>


        <div
          class="
            grid
            grid-cols-2
            gap-3
          "
        >

          <button
            v-for="modulo in items"
            :key="modulo.id"
            @click="abrirModulo(modulo)"
            class="
              bg-white
              border
              border-[#D8CFC4]
              rounded-2xl
              p-4
              text-left
              min-h-[130px]
              hover:bg-[#F8F5F1]
              active:scale-[0.98]
              transition
            "
          >

            <div class="text-3xl mb-3">
              {{ modulo.icon }}
            </div>

            <p
              class="
                font-semibold
                text-sm
                text-[#332A24]
              "
            >
              {{ modulo.title }}
            </p>

            <p
              class="
                text-xs
                text-[#7A6558]
                mt-1
              "
            >
              {{ modulo.description }}
            </p>

          </button>

        </div>

      </div>


      <!-- SIN FUNCIONES -->

      <div
        v-if="modulosVisibles.length === 0"
        class="
          text-center
          text-[#7A6558]
          py-12
        "
      >
        No tiene funciones habilitadas.
      </div>


      <!-- CERRAR SESIÓN -->

      <button
        @click="emit('logout')"
        class="
          w-full
          border
          border-red-200
          text-red-600
          rounded-xl
          py-3
          text-sm
          font-semibold
          mt-4
        "
      >
        Cerrar sesión
      </button>

    </div>

  </div>

</template>