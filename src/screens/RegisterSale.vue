<script setup>
import { computed, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import ToastMessage from '../components/ui/ToastMessage.vue'
import { genId, money } from '../utils/helpers.js'

const props=defineProps({store:Object,currentUser:Object})
const emit=defineEmits(['navigate'])
const activeSession=computed(()=>props.store.sessions.find(s=>s.status==='open'&&s.cashierId===props.currentUser.id))
const paymentMethod=ref(''), search=ref(''), found=ref(null), quantity=ref('1'), cart=ref([]), view=ref('sale'), savedSale=ref(null), loading=ref(false), removeId=ref(null), toast=ref('')
const errors=reactive({})
const total=computed(()=>cart.value.reduce((a,b)=>a+b.subtotal,0))
const methods=[['efectivo','💵 Efectivo'],['qr','📱 QR'],['billetera','👛 Billetera móvil']]
function notify(m,type='success'){toast.value=m;setTimeout(()=>toast.value='',1800)}
function clear(k){errors[k]=''}
function searchProduct(){clear('product');const q=search.value.trim().toLowerCase();if(!q){errors.product='Ingrese una búsqueda';return}const p=props.store.products.find(p=>p.code.toLowerCase()===q||p.name.toLowerCase().includes(q));if(!p){errors.product='Producto no encontrado';found.value=null;return}if(!activeSession.value?.productIds.includes(p.id)){errors.product='El producto no está habilitado para esta jornada';found.value=null;return}if(!p.active){errors.product='El producto se encuentra inactivo';found.value=null;return}found.value=p;quantity.value='1'}
function add(){errors.paymentMethod='';errors.quantity='';if(!paymentMethod.value)errors.paymentMethod='Seleccione un método de pago';if(!found.value){errors.product='Busque y seleccione un producto';return}const q=Number(quantity.value);if(!quantity.value||q<=0)errors.quantity='La cantidad debe ser mayor a cero';else if(q>found.value.stock)errors.quantity=`Stock insuficiente. Disponible: ${found.value.stock} unidades`;if(errors.paymentMethod||errors.quantity)return;const existing=cart.value.find(i=>i.productId===found.value.id);if(existing){const next=existing.quantity+q;if(next>found.value.stock){errors.quantity=`Stock insuficiente. Disponible: ${found.value.stock} unidades`;return}existing.quantity=next;existing.subtotal=(existing.unitPrice-existing.discount)*next;notify('Producto actualizado en la venta')}else{const b=props.store.businesses.find(x=>x.id===found.value.businessId);cart.value.push({productId:found.value.id,productName:found.value.name,businessName:b?.name||'—',quantity:q,unitPrice:found.value.price,discount:found.value.discount,subtotal:(found.value.price-found.value.discount)*q})}found.value=null;search.value='';quantity.value='1'}
function setCartQty(item,val){const q=Math.max(1,Number(val)||1);const p=props.store.products.find(x=>x.id===item.productId);if(q>p.stock){notify(`Stock insuficiente. Disponible: ${p.stock} unidades`,'error');return}item.quantity=q;item.subtotal=(item.unitPrice-item.discount)*q}
function goConfirm(){if(!paymentMethod.value){errors.paymentMethod='Seleccione un método de pago';return}if(cart.value.length===0){notify('Agregue al menos un producto','error');return}view.value='confirm'}
async function confirmSale(){loading.value=true;await new Promise(r=>setTimeout(r,350));for(const item of cart.value){const p=props.store.products.find(x=>x.id===item.productId);if(!p||!p.active||p.stock<item.quantity){loading.value=false;notify(`No se pudo registrar la venta. Revise el stock de ${item.productName}. No se realizaron cambios.`,'error');return}}
  const sale={id:genId('vta'),sessionId:activeSession.value.id,cashierId:props.currentUser.id,paymentMethod:paymentMethod.value,items:cart.value.map(({productName,businessName,...i})=>({...i})),total:total.value,date:new Date().toISOString()}
  // Transacción simulada: primero se valida todo, luego se aplican cambios.
  sale.items.forEach(i=>{const p=props.store.products.find(x=>x.id===i.productId);p.stock-=i.quantity;props.store.inventoryMovements.push({id:genId('mv'),productId:i.productId,type:'venta',quantity:i.quantity,reason:`Venta ${sale.id}`,date:sale.date,userId:props.currentUser.id})})
  props.store.sales.push(sale);savedSale.value=sale;loading.value=false;view.value='success'
}
function resetSale(){paymentMethod.value='';search.value='';found.value=null;quantity.value='1';cart.value=[];savedSale.value=null;view.value='sale'}
</script>
<template>
<div class="h-full flex flex-col relative">
  <ToastMessage :message="toast" :type="toast.includes('No se pudo')||toast.includes('Stock')?'error':'success'" />
  <AppModal :open="!!removeId" title="¿Quitar producto?" message="¿Desea quitar este producto de la venta?" confirm-label="Quitar" danger @cancel="removeId=null" @confirm="cart=cart.filter(i=>i.productId!==removeId);removeId=null" />
  <template v-if="!activeSession">
    <AppHeader title="Registrar venta" show-back @back="emit('navigate','cashier-home')" />
    <div class="p-4"><div class="bg-[#FDE8E3] text-[#A52D18] rounded-2xl p-4 text-sm">No existe una jornada activa asignada a este cajero.</div></div>
  </template>
  <template v-else-if="view==='success' && savedSale">
    <AppHeader title="Venta registrada" />
    <div class="flex-1 p-4 flex flex-col items-center justify-center gap-4"><div class="w-20 h-20 bg-[#E6F5EF] rounded-full flex items-center justify-center text-4xl">✓</div><h2 class="font-display font-bold text-xl text-[#1E7E4A]">Venta registrada correctamente</h2><div class="w-full bg-white border border-[#D8CFC4] rounded-2xl p-5"><div class="flex justify-between border-b border-[#EEE] pb-3"><span class="text-sm text-[#7A6558]">Total</span><strong class="text-xl text-[#2A6049]">{{money(savedSale.total)}}</strong></div><p class="text-sm text-[#7A6558] mt-3">Método: <strong class="capitalize">{{savedSale.paymentMethod==='billetera'?'Billetera móvil':savedSale.paymentMethod}}</strong></p><p class="text-sm text-[#7A6558]">Productos: <strong>{{savedSale.items.length}}</strong></p></div><BaseButton full @click="resetSale">+ Nueva venta</BaseButton><BaseButton full variant="outline" @click="emit('navigate','sale-detail',{saleId:savedSale.id})">Ver detalle de venta</BaseButton></div>
  </template>
  <template v-else-if="view==='confirm'">
    <AppHeader title="Confirmar venta" show-back @back="view='sale'" />
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4"><div class="bg-[#2A6049] rounded-2xl p-5 text-white"><p class="text-xs text-white/70">Total de la venta</p><p class="font-display font-bold text-3xl">{{money(total)}}</p><p class="text-xs text-white/70 mt-2">{{cart.length}} producto(s) · {{methods.find(m=>m[0]===paymentMethod)?.[1]}}</p></div><div class="bg-white border border-[#D8CFC4] rounded-2xl p-4"><div v-for="i in cart" :key="i.productId" class="flex justify-between py-2 border-b border-[#EEE]"><div><p class="text-sm font-medium">{{i.productName}}</p><p class="text-xs text-[#7A6558]">{{i.businessName}} · x{{i.quantity}}</p></div><strong class="text-sm">{{money(i.subtotal)}}</strong></div></div><div class="flex gap-3"><BaseButton full variant="secondary" @click="view='sale'">Volver</BaseButton><BaseButton full :loading="loading" @click="confirmSale">Confirmar</BaseButton></div></div>
  </template>
  <template v-else>
    <AppHeader title="Nueva venta" show-back @back="emit('navigate','cashier-home')" />
    <div class="bg-[#2A6049] px-4 py-3 text-white"><p class="text-[10px] text-white/70">Jornada actual</p><p class="font-semibold text-sm">{{activeSession.name}}</p><p class="text-[10px] text-white/70">Cajero: {{currentUser.name}} {{currentUser.lastName}}</p></div>
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div><p class="text-sm font-semibold mb-2">Método de pago *</p><div class="flex gap-2"><button v-for="m in methods" :key="m[0]" @click="paymentMethod=m[0];clear('paymentMethod')" class="flex-1 py-2.5 rounded-xl text-[11px] font-semibold border" :class="paymentMethod===m[0]?'bg-[#2A6049] text-white border-[#2A6049]':'bg-white border-[#D8CFC4]'">{{m[1]}}</button></div><p v-if="errors.paymentMethod" class="text-xs text-[#C23B22] mt-1">⚠ {{errors.paymentMethod}}</p></div>
      <div><p class="text-sm font-semibold mb-2">Buscar producto</p><div class="flex gap-2"><input v-model="search" @keyup.enter="searchProduct" placeholder="Código o nombre del producto" class="flex-1 h-11 rounded-xl border border-[#D8CFC4] bg-white px-3 text-sm"/><BaseButton size="sm" @click="searchProduct">Buscar</BaseButton></div><p v-if="errors.product" class="text-xs text-[#C23B22] mt-1">⚠ {{errors.product}}</p></div>
      <div v-if="found" class="bg-white border-l-4 border-l-[#C8861A] border border-[#D8CFC4] rounded-2xl p-4"><div class="flex justify-between"><div><p class="font-semibold">{{found.name}}</p><p class="text-xs text-[#7A6558]">{{found.code}} · {{store.businesses.find(b=>b.id===found.businessId)?.name}}</p></div><button @click="found=null">×</button></div><div class="flex gap-4 mt-3"><div><p class="text-[10px] text-[#7A6558]">Precio final</p><strong>{{money(found.price-found.discount)}}</strong></div><div><p class="text-[10px] text-[#7A6558]">Rebaja</p><strong class="text-[#C8861A]">{{money(found.discount)}}</strong></div><div><p class="text-[10px] text-[#7A6558]">Stock</p><strong :class="found.stock<=5?'text-[#C23B22]':''">{{found.stock}}</strong></div></div><div class="flex items-end gap-2 mt-3"><BaseInput v-model="quantity" label="Cantidad" type="number" min="1" :max="found.stock" :error="errors.quantity"/><BaseButton @click="add">Agregar</BaseButton></div></div>
      <div v-if="cart.length"><p class="text-sm font-semibold mb-2">Productos en la venta</p><div class="bg-white border border-[#D8CFC4] rounded-2xl divide-y divide-[#EEE]"><div v-for="i in cart" :key="i.productId" class="p-3 flex items-center gap-2"><div class="flex-1 min-w-0"><p class="text-sm font-medium truncate">{{i.productName}}</p><p class="text-xs text-[#7A6558]">{{i.businessName}}</p></div><input :value="i.quantity" @change="setCartQty(i,$event.target.value)" type="number" min="1" class="w-14 h-8 border border-[#D8CFC4] rounded-lg text-center text-sm"/><strong class="text-sm w-20 text-right">{{money(i.subtotal)}}</strong><button @click="removeId=i.productId" class="text-[#C23B22]">×</button></div></div></div>
      <div v-if="cart.length" class="sticky bottom-0 bg-white border-t border-[#D8CFC4] -mx-4 px-4 py-3 flex items-center justify-between"><div><p class="text-xs text-[#7A6558]">Total</p><p class="font-display font-bold text-xl text-[#2A6049]">{{money(total)}}</p></div><BaseButton @click="goConfirm">Confirmar venta →</BaseButton></div>
    </div>
  </template>
</div>
</template>
