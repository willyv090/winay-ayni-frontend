<script setup>
import { computed } from 'vue'

import {
  obtenerBottomTabs
} from '../config/navigation.js'


const props = defineProps({
  activeRole: { type: String, default: '' },
  user: {
    type: Object,
    required: true
  },

  currentScreen: {
    type: String,
    default: 'home'
  }
})


const emit = defineEmits([
  'navigate'
])


const tabs = computed(() => {
  return obtenerBottomTabs(
    props.user?.roles || [], props.activeRole
  )
})
</script>


<template>

  <nav
    class="
      bg-white
      border-t
      border-[#D8CFC4]
      flex
      items-center
      justify-around
      px-1
      py-2
    "
  >

    <button
      v-for="tab in tabs"
      :key="tab.screen"
      @click="
        emit(
          'navigate',
          tab.screen
        )
      "
      class="
        flex
        flex-col
        items-center
        justify-center
        flex-1
        py-1
        rounded-xl
        transition
      "
      :class="
        currentScreen === tab.screen
          ? 'text-[#2A6049] bg-[#EEF3F0]'
          : 'text-[#7A6558]'
      "
    >

      <span class="text-lg">
        {{ tab.icon }}
      </span>

      <span
        class="
          text-[10px]
          font-semibold
          mt-1
        "
      >
        {{ tab.label }}
      </span>

    </button>

  </nav>

</template>