<script setup>
import { computed } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import { obtenerModulos, rolesDisponibles, roleLabels } from '../config/navigation.js'


const props = defineProps({
  activeRole: { type: String, default: '' },
  user: {
    type: Object,
    required: true
  }
})


const emit = defineEmits([
  'navigate',
  'logout',
  'change-role'
])


const roles = computed(() => rolesDisponibles(props.user.roles))
const modulosVisibles = computed(() => obtenerModulos(props.user.roles, props.activeRole))

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


        <label v-if="roles.length > 1" class="block mt-4">
          <span class="block text-sm mb-1">Trabajar como</span>
          <select :value="activeRole" @change="emit('change-role', $event.target.value)"
            class="w-full min-h-12 rounded-xl bg-white text-[#2A6049] px-3 font-semibold">
            <option v-for="rol in roles" :key="rol" :value="rol">{{ roleLabels[rol] }}</option>
          </select>
        </label>
        <p v-else class="text-sm mt-3">{{ roleLabels[activeRole] || 'Sin rol habilitado' }}</p>

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

            <span v-if="modulo.pendiente" class="block text-[10px] text-[#7A6558] mb-2">Pendiente de conexión</span>
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