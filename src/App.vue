<script setup>
import { computed, reactive, ref } from 'vue'
import { alertController } from '@ionic/vue'
import PhoneFrame from './components/PhoneFrame.vue'
import BottomNav from './components/BottomNav.vue'
import { initialStore } from './data/mockData.js'
import Login from './screens/Login.vue'
import AdminHome from './screens/AdminHome.vue'
import CashierHome from './screens/CashierHome.vue'
import EntrepreneurHome from './screens/EntrepreneurHome.vue'
import Users from './screens/Users.vue'
import UserDetail from './screens/UserDetail.vue'
import UserCreate from './screens/UserCreate.vue'
import UserEdit from './screens/UserEdit.vue'
import Businesses from './screens/Businesses.vue'
import BusinessDetail from './screens/BusinessDetail.vue'
import BusinessCreate from './screens/BusinessCreate.vue'
import BusinessEdit from './screens/BusinessEdit.vue'
import Products from './screens/Products.vue'
import Sessions from './screens/Sessions.vue'
import SessionDetail from './screens/SessionDetail.vue'
import SessionEdit from './screens/SessionEdit.vue'
import SessionCreate from './screens/SessionCreate.vue'
import RegisterSale from './screens/RegisterSale.vue'
import SalesList from './screens/SalesList.vue'
import SaleDetail from './screens/SaleDetail.vue'
import SessionResults from './screens/SessionResults.vue'
import Metrics from './screens/Metrics.vue'
import AIQuery from './screens/AIQuery.vue'
import Home from './screens/Home.vue'
import {
  puedeAcceder
} from './config/navigation.js'

const store=reactive(structuredClone(initialStore))
const savedUser = localStorage.getItem('usuario')

const currentUser = ref(
  savedUser
    ? JSON.parse(savedUser)
    : null
)

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
      currentUser.value.roles
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
const showNav=computed(()=>currentUser.value && ['admin-home','cashier-home','entrepreneur-home','users-list','businesses-list','products-list','sessions-list','sales-list','metrics','ai-query'].includes(screen.value))
</script>
<template>
  <PhoneFrame>
    <Login v-if="!currentUser || screen==='login'" @login="login" />
    <div v-else class="h-full flex flex-col overflow-hidden bg-[#F5F0E8]">
      <div class="flex-1 overflow-hidden">
        <AdminHome v-if="screen==='admin-home'" :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
        <CashierHome v-else-if="screen==='cashier-home'" :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
        <EntrepreneurHome v-else-if="screen==='entrepreneur-home'" :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
        <Home
          v-else-if="screen === 'home'"
          :user="currentUser"
          @navigate="navigate"
          @logout="logout"
        />
        <Users v-else-if="screen==='users-list'" @navigate="navigate" />
        <UserCreate v-else-if="screen==='user-create'" @navigate="navigate" />
        <UserEdit v-else-if="screen==='user-edit'" :id-usuario="params.idUsuario" @navigate="navigate" />
        <UserDetail
          v-else-if="screen === 'user-detail'"
          :id-usuario="params.idUsuario"
          @navigate="navigate"
        />
        <Businesses v-else-if="screen==='businesses-list'" :current-user="currentUser" @navigate="navigate" />
        <BusinessDetail v-else-if="screen==='business-detail'" :id-empresa="params.idEmpresa" @navigate="navigate" />
        <BusinessCreate v-else-if="screen==='business-create'" @navigate="navigate" />
        <BusinessEdit v-else-if="screen==='business-edit'" :id-empresa="params.idEmpresa" @navigate="navigate" />
        <Products v-else-if="screen==='products-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <Sessions v-else-if="screen==='sessions-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <SessionDetail v-else-if="screen==='session-detail'" :id-jornada="params.idJornada" @navigate="navigate" />
        <SessionEdit v-else-if="screen==='session-edit'" :id-jornada="params.idJornada" @navigate="navigate" />
        <SessionCreate v-else-if="screen==='session-create'" @navigate="navigate" />
        <RegisterSale v-else-if="screen==='register-sale'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <SalesList v-else-if="screen==='sales-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <SaleDetail v-else-if="screen==='sale-detail'" :store="store" :current-user="currentUser" :sale-id="params.saleId" @navigate="navigate" />
        <SessionResults v-else-if="screen==='session-results'" :store="store" :current-user="currentUser" :session-id="params.sessionId" @navigate="navigate" />
        <Metrics v-else-if="screen==='metrics'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <AIQuery v-else-if="screen==='ai-query'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <AdminHome v-else :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
      </div>
      <BottomNav
        v-if="currentUser && screen !== 'login'"
        :user="currentUser"
        :current-screen="screen"
        @navigate="navigate"
      />
    </div>
  </PhoneFrame>
</template>
