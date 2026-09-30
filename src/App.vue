<script setup>
import { computed, reactive, ref } from 'vue'
import PhoneFrame from './components/PhoneFrame.vue'
import BottomNav from './components/BottomNav.vue'
import { initialStore } from './data/mockData.js'
import Login from './screens/Login.vue'
import AdminHome from './screens/AdminHome.vue'
import CashierHome from './screens/CashierHome.vue'
import EntrepreneurHome from './screens/EntrepreneurHome.vue'
import Users from './screens/Users.vue'
import Businesses from './screens/Businesses.vue'
import Products from './screens/Products.vue'
import Sessions from './screens/Sessions.vue'
import RegisterSale from './screens/RegisterSale.vue'
import SalesList from './screens/SalesList.vue'
import SaleDetail from './screens/SaleDetail.vue'
import SessionResults from './screens/SessionResults.vue'
import Metrics from './screens/Metrics.vue'
import AIQuery from './screens/AIQuery.vue'

const store=reactive(structuredClone(initialStore))
const currentUser=ref(null)
const screen=ref('login')
const params=reactive({})
const history=ref([])
function homeFor(user){return user.roles.includes('admin')?'admin-home':user.roles.includes('cashier')?'cashier-home':'entrepreneur-home'}
function login(user){currentUser.value=user;history.value=[];screen.value=homeFor(user);Object.keys(params).forEach(k=>delete params[k])}
function logout(){currentUser.value=null;history.value=[];screen.value='login';Object.keys(params).forEach(k=>delete params[k])}
function navigate(next,nextParams={}){if(screen.value!=='login')history.value.push({screen:screen.value,params:{...params}});screen.value=next;Object.keys(params).forEach(k=>delete params[k]);Object.assign(params,nextParams)}
const showNav=computed(()=>currentUser.value && ['admin-home','cashier-home','entrepreneur-home','users-list','businesses-list','products-list','sessions-list','sales-list','metrics','ai-query'].includes(screen.value))
</script>
<template>
  <PhoneFrame>
    <Login v-if="!currentUser || screen==='login'" :users="store.users" @login="login" />
    <div v-else class="h-full flex flex-col overflow-hidden bg-[#F5F0E8]">
      <div class="flex-1 overflow-hidden">
        <AdminHome v-if="screen==='admin-home'" :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
        <CashierHome v-else-if="screen==='cashier-home'" :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
        <EntrepreneurHome v-else-if="screen==='entrepreneur-home'" :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
        <Users v-else-if="screen==='users-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <Businesses v-else-if="screen==='businesses-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <Products v-else-if="screen==='products-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <Sessions v-else-if="screen==='sessions-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <RegisterSale v-else-if="screen==='register-sale'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <SalesList v-else-if="screen==='sales-list'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <SaleDetail v-else-if="screen==='sale-detail'" :store="store" :current-user="currentUser" :sale-id="params.saleId" @navigate="navigate" />
        <SessionResults v-else-if="screen==='session-results'" :store="store" :current-user="currentUser" :session-id="params.sessionId" @navigate="navigate" />
        <Metrics v-else-if="screen==='metrics'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <AIQuery v-else-if="screen==='ai-query'" :store="store" :current-user="currentUser" @navigate="navigate" />
        <AdminHome v-else :user="currentUser" :store="store" @navigate="navigate" @logout="logout" />
      </div>
      <BottomNav v-if="showNav" :user="currentUser" :current-screen="screen" @navigate="navigate" />
    </div>
  </PhoneFrame>
</template>
