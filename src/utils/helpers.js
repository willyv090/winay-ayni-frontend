export const money = (value) => `Bs ${Number(value || 0).toFixed(2)}`
export const formatDate = (value) => value ? new Date(value).toLocaleString('es-BO') : '—'
export const genId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`

export function getBusinessTotals(store, sessionId) {
  const totals = {}
  store.sales.filter(s => s.sessionId === sessionId).forEach(sale => {
    sale.items.forEach(item => {
      const product = store.products.find(p => p.id === item.productId)
      if (!product) return
      totals[product.businessId] = (totals[product.businessId] || 0) + item.subtotal
    })
  })
  return totals
}

export function getPaymentTotals(store, sessionId) {
  const totals = { efectivo: 0, qr: 0, billetera: 0 }
  store.sales.filter(s => s.sessionId === sessionId).forEach(sale => {
    totals[sale.paymentMethod] = (totals[sale.paymentMethod] || 0) + sale.total
  })
  return totals
}

export function sessionSummary(store, sessionId) {
  const sales = store.sales.filter(s => s.sessionId === sessionId)
  const total = sales.reduce((sum, s) => sum + s.total, 0)
  const units = sales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0)
  const byBusiness = getBusinessTotals(store, sessionId)
  const byPayment = getPaymentTotals(store, sessionId)
  const businessSum = Object.values(byBusiness).reduce((a, b) => a + b, 0)
  return { sales, total, units, byBusiness, byPayment, businessSum, balanced: Math.abs(total - businessSum) < 0.001 }
}
