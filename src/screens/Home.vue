<script setup>
import { computed, onMounted } from 'vue'

import AppHeader from '../components/AppHeader.vue'
import { obtenerModulos, rolesDisponibles, roleLabels } from '../config/navigation.js'


const props = defineProps({
  actualizandoRoles: Boolean,
  errorRoles: { type: String, default: '' },
  activeRole: { type: String, default: '' },
  user: {
    type: Object,
    required: true
  }
})


const emit = defineEmits([
  'navigate',
  'logout',
  'change-role',
  'refresh-roles'
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
onMounted(() => emit('refresh-roles'))
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


        <section class="role-picker" aria-label="Elegir rol de trabajo">
          <p class="role-heading">Trabajar como</p>
          <div class="role-options">
            <button v-for="rol in roles" :key="rol" type="button"
              class="role-option" :class="{ 'is-active': activeRole === rol }"
              :aria-pressed="activeRole === rol" :disabled="actualizandoRoles"
              @click="emit('change-role', rol)">
              <span aria-hidden="true">{{ { ADMINISTRADOR: '⚙', EMPRENDEDOR: '🏪', CAJERO: '🧾' }[rol] }}</span>
              <span>{{ roleLabels[rol] }}</span>
              <span v-if="activeRole === rol" class="role-check" aria-hidden="true">✓</span>
            </button>
          </div>
          <p v-if="!roles.length" class="role-status">Sin rol habilitado.</p>
          <p v-if="actualizandoRoles" role="status" class="role-status">Actualizando tus roles...</p>
          <p v-if="errorRoles" role="alert" class="role-error">{{ errorRoles }}</p>
          <button type="button" class="role-refresh" :disabled="actualizandoRoles"
            @click="emit('refresh-roles')">Actualizar mis roles</button>
        </section>

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

<style scoped>
.role-picker { margin-top: 1rem; }
.role-heading { margin: 0 0 .6rem; font-size: .875rem; font-weight: 600; color: #fff; }
.role-options { display: grid; gap: .5rem; }
.role-option { width: 100%; min-height: 48px; display: flex; align-items: center; gap: .65rem; padding: .7rem .85rem; border: 2px solid #d8e6df; border-radius: 12px; background: #fff; color: #254c3b; font: inherit; font-size: .875rem; font-weight: 600; text-align: left; cursor: pointer; }
.role-option.is-active { background: #e6f5ef; border-color: #a4d7ba; color: #174c35; }
.role-option:focus-visible, .role-refresh:focus-visible { outline: 3px solid #f4cf76; outline-offset: 3px; }
.role-option:disabled, .role-refresh:disabled { opacity: .65; cursor: wait; }
.role-check { margin-left: auto; font-weight: 800; }
.role-status { margin-top: .6rem; color: #fff; font-size: .8rem; }
.role-error { margin-top: .65rem; padding: .65rem; border-radius: 8px; background: #fff0ec; color: #8c281c; font-size: .8rem; }
.role-refresh { display: block; min-height: 44px; margin-top: .35rem; padding: .5rem 0; border: 0; background: transparent; color: #fff; text-decoration: underline; font: inherit; font-size: .8rem; cursor: pointer; }
</style>
