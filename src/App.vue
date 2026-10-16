<script setup>
import { computed, reactive, ref } from 'vue'
import { alertController } from '@ionic/vue'
import PhoneFrame from './components/PhoneFrame.vue'
import BottomNav from './components/BottomNav.vue'
import { initialStore } from './data/mockData.js'
import Login from './screens/Login.vue'
import Users from './screens/Users.vue'
import UserDetail from './screens/UserDetail.vue'
import UserCreate from './screens/UserCreate.vue'
import UserEdit from './screens/UserEdit.vue'
import Businesses from './screens/Businesses.vue'
import BusinessDetail from './screens/BusinessDetail.vue'
import BusinessCreate from './screens/BusinessCreate.vue'
import BusinessEdit from './screens/BusinessEdit.vue'
import Sessions from './screens/Sessions.vue'
import SessionDetail from './screens/SessionDetail.vue'
import SessionEdit from './screens/SessionEdit.vue'
import SessionCreate from './screens/SessionCreate.vue'
import SessionCashiers from './screens/SessionCashiers.vue'
import SessionProducts from './screens/SessionProducts.vue'
import MyInventory from './screens/MyInventory.vue'
import MyBusinesses from './screens/MyBusinesses.vue'
import MyBusinessDetail from './screens/MyBusinessDetail.vue'
import Home from './screens/Home.vue'
import PendingModule from './screens/PendingModule.vue'
import {
  puedeAcceder, elegirRol, rolesDisponibles, roleLabels, modules
} from './config/navigation.js'

const store=reactive(structuredClone(initialStore))
function leerUsuario() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
    return usuario && typeof usuario === 'object' && Array.isArray(usuario.roles) ? usuario : null
  } catch {
    return null
  }
}
const currentUser = ref(leerUsuario())
const activeRole = ref(elegirRol(currentUser.value?.roles, sessionStorage.getItem('rolActivo') || ''))
const contextUser = computed(() => currentUser.value ? { ...currentUser.value, roles: activeRole.value ? [activeRole.value] : [] } : null)
const pendingModule = computed(() => modules.find(modulo => modulo.screen === screen.value && modulo.pendiente))
function cambiarRol(rol) {
  // El selector vive en Inicio; no interrumpe formularios ni peticiones.
  if (screen.value !== 'home' || !rolesDisponibles(currentUser.value?.roles).includes(rol)) return
  activeRole.value = rol
  sessionStorage.setItem('rolActivo', rol)
  history.value = []
  Object.keys(params).forEach(key => delete params[key])
  screen.value = 'home'
}

const screen = ref(
  currentUser.value
    ? homeFor(currentUser.value)
    : 'login'
)
const params=reactive({})
const history=ref([])
function homeFor() {
  return 'home'
}

function login(user) {
  currentUser.value = user
  activeRole.value = elegirRol(user.roles)
  sessionStorage.setItem('rolActivo', activeRole.value)

  localStorage.setItem(
    'usuario',
    JSON.stringify(user)
  )

  history.value = []

  screen.value = homeFor(user)

  Object.keys(params).forEach(
    key => delete params[key]
  )
}
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')

  currentUser.value = null
  activeRole.value = ''
  sessionStorage.removeItem('rolActivo')
  history.value = []

  screen.value = 'login'

  Object.keys(params).forEach(
    key => delete params[key]
  )
}
async function navigate(
  next,
  nextParams = {}
) {

  // ==========================
  // VALIDAR PERMISOS
  // ==========================

  if (
    currentUser.value &&
    !puedeAcceder(
      next,
      currentUser.value.roles,
      activeRole.value
    )
  ) {

    const alert = await alertController.create({
      header: 'Acceso no permitido',
      message:
        'No tiene permisos para acceder a esta función.',
      buttons: ['Aceptar']
    })

    await alert.present()

    return
  }


  // ==========================
  // GUARDAR HISTORIAL
  // ==========================

  if (screen.value !== 'login') {

    history.value.push({
      screen: screen.value,
      params: {
        ...params
      }
    })
  }


  // ==========================
  // CAMBIAR PANTALLA
  // ==========================

  screen.value = next


  Object.keys(params).forEach(
    key => delete params[key]
  )


  Object.assign(
    params,
    nextParams
  )
}

</script>
<template>
  <PhoneFrame>
    <Login v-if="!currentUser || screen==='login'" @login="login" />
    <div v-else class="h-full flex flex-col overflow-hidden bg-[#F5F0E8]">
      <div :key="activeRole" class="flex-1 overflow-hidden">
        <Home
          v-if="screen === 'home'"
          :user="currentUser"
          :active-role="activeRole"
          @change-role="cambiarRol"
          @navigate="navigate"
          @logout="logout"
        />
        <PendingModule v-else-if="pendingModule" :key="activeRole + screen"
          :title="pendingModule.title" :role-label="roleLabels[activeRole]"
          :description="pendingModule.description" @navigate="navigate" />
        <MyInventory v-else-if="screen==='my-inventory'" :key="params.idEmpresa" :id-empresa="params.idEmpresa" @navigate="navigate" />
        <MyBusinesses v-else-if="screen==='my-businesses'" @navigate="navigate" />
        <MyBusinessDetail v-else-if="screen==='my-business-detail'" :id-empresa="params.idEmpresa" @navigate="navigate" />
        <Users v-else-if="screen==='users-list'" @navigate="navigate" />
        <UserCreate v-else-if="screen==='user-create'" @navigate="navigate" />
        <UserEdit v-else-if="screen==='user-edit'" :id-usuario="params.idUsuario" @navigate="navigate" />
        <UserDetail
          v-else-if="screen === 'user-detail'"
          :id-usuario="params.idUsuario"
          @navigate="navigate"
        />
        <Businesses v-else-if="screen==='businesses-list'" :current-user="contextUser" @navigate="navigate" />
        <BusinessDetail v-else-if="screen==='business-detail'" :id-empresa="params.idEmpresa" @navigate="navigate" />
        <BusinessCreate v-else-if="screen==='business-create'" @navigate="navigate" />
        <BusinessEdit v-else-if="screen==='business-edit'" :id-empresa="params.idEmpresa" @navigate="navigate" />
        <Sessions v-else-if="screen==='sessions-list'" :store="store" :current-user="contextUser" @navigate="navigate" />
        <SessionDetail v-else-if="screen==='session-detail'" :id-jornada="params.idJornada" @navigate="navigate" />
        <SessionEdit v-else-if="screen==='session-edit'" :id-jornada="params.idJornada" @navigate="navigate" />
        <SessionCreate v-else-if="screen==='session-create'" @navigate="navigate" />
        <SessionCashiers v-else-if="screen==='session-cashiers'" :id-jornada="params.idJornada" @navigate="navigate" />
        <SessionProducts v-else-if="screen==='session-products'" :id-jornada="params.idJornada" @navigate="navigate" />
      </div>
      <BottomNav
        v-if="currentUser && screen !== 'login'"
        :user="currentUser"
        :active-role="activeRole"
        :current-screen="screen"
        @navigate="navigate"
      />
    </div>
  </PhoneFrame>
</template>
