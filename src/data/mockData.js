export const initialStore = {
  users: [
    { id: 'u1', name: 'Administrador', lastName: 'General', username: 'admin', password: '1234', roles: ['admin'], businessIds: [], active: true },
    { id: 'u2', name: 'Carlos', lastName: 'Pérez Quispe', username: 'cajero1', password: '1234', roles: ['cashier'], businessIds: [], active: true },
    { id: 'u3', name: 'Ana', lastName: 'López Mamani', username: 'cajero2', password: '1234', roles: ['cashier'], businessIds: [], active: true },
    { id: 'u4', name: 'Rosa', lastName: 'Flores Condori', username: 'emprendedor1', password: '1234', roles: ['entrepreneur'], businessIds: ['b1'], active: true },
    { id: 'u5', name: 'Juan', lastName: 'Mamani Huanca', username: 'emprendedor2', password: '1234', roles: ['entrepreneur'], businessIds: ['b2'], active: true },
    { id: 'u6', name: 'María', lastName: 'Choque Apaza', username: 'emprendedor3', password: '1234', roles: ['entrepreneur'], businessIds: ['b3'], active: false }
  ],
  businesses: [
    { id: 'b1', name: 'Velas Artesanales Condori', address: 'Av. Montes 345, La Paz', phone: '71234567', associatedUserIds: ['u4'], active: true },
    { id: 'b2', name: 'Tejidos Andinos Mamani', address: 'Calle Comercio 128, El Alto', phone: '76543210', associatedUserIds: ['u5'], active: true },
    { id: 'b3', name: 'Mermeladas Choque', address: 'Villa Dolores, El Alto', phone: '69876543', associatedUserIds: ['u6'], active: true }
  ],
  products: [
    { id: 'p1', code: 'VEL001', name: 'Vela aromática lavanda', businessId: 'b1', price: 25, discount: 0, stock: 48, notes: 'Peso 150g, duración aprox. 30 horas', active: true },
    { id: 'p2', code: 'VEL002', name: 'Vela decorativa roja', businessId: 'b1', price: 18, discount: 5, stock: 3, notes: 'Bajo stock', active: true },
    { id: 'p3', code: 'VEL003', name: 'Vela navideña set x3', businessId: 'b1', price: 55, discount: 5, stock: 20, notes: '', active: true },
    { id: 'p4', code: 'TEJ001', name: 'Aguayo multicolor 2m', businessId: 'b2', price: 120, discount: 0, stock: 15, notes: 'Tejido a mano, 100% lana', active: true },
    { id: 'p5', code: 'TEJ002', name: 'Bolso wayuu artesanal', businessId: 'b2', price: 85, discount: 10, stock: 8, notes: '', active: true },
    { id: 'p6', code: 'MER001', name: 'Mermelada de durazno 350g', businessId: 'b3', price: 22, discount: 0, stock: 30, notes: 'Sin conservantes', active: true },
    { id: 'p7', code: 'MER002', name: 'Mermelada de frutilla 350g', businessId: 'b3', price: 22, discount: 0, stock: 25, notes: '', active: false }
  ],
  sessions: [
    {
      id: 's1', name: 'Feria Artesanal Octubre', address: 'Plaza Abaroa, La Paz', startDate: '2026-09-28', endDate: '2026-09-28',
      cashierId: 'u2', previousCashierIds: [], productIds: ['p1','p2','p3','p4','p5','p6'], status: 'open'
    },
    {
      id: 's2', name: 'Feria Agosto Villa Dolores', address: 'Villa Dolores, El Alto', startDate: '2026-08-15', endDate: '2026-08-15',
      cashierId: 'u3', previousCashierIds: [], productIds: ['p1','p4','p6'], status: 'closed', closedAt: '2026-08-15T18:30:00'
    }
  ],
  sales: [
    {
      id: 'vta001', sessionId: 's2', cashierId: 'u3', paymentMethod: 'efectivo', date: '2026-08-15T10:15:00', total: 116,
      items: [
        { productId: 'p1', quantity: 2, unitPrice: 25, discount: 0, subtotal: 50 },
        { productId: 'p6', quantity: 3, unitPrice: 22, discount: 0, subtotal: 66 }
      ]
    },
    {
      id: 'vta002', sessionId: 's2', cashierId: 'u3', paymentMethod: 'qr', date: '2026-08-15T11:30:00', total: 120,
      items: [{ productId: 'p4', quantity: 1, unitPrice: 120, discount: 0, subtotal: 120 }]
    },
    {
      id: 'vta003', sessionId: 's2', cashierId: 'u3', paymentMethod: 'billetera', date: '2026-08-15T14:00:00', total: 145,
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 25, discount: 0, subtotal: 25 },
        { productId: 'p4', quantity: 1, unitPrice: 120, discount: 0, subtotal: 120 }
      ]
    },
    {
      id: 'vta004', sessionId: 's1', cashierId: 'u2', paymentMethod: 'efectivo', date: '2026-09-28T09:20:00', total: 125,
      items: [
        { productId: 'p3', quantity: 1, unitPrice: 55, discount: 5, subtotal: 50 },
        { productId: 'p5', quantity: 1, unitPrice: 85, discount: 10, subtotal: 75 }
      ]
    },
    {
      id: 'vta005', sessionId: 's1', cashierId: 'u2', paymentMethod: 'qr', date: '2026-09-28T10:45:00', total: 75,
      items: [{ productId: 'p1', quantity: 3, unitPrice: 25, discount: 0, subtotal: 75 }]
    }
  ],
  inventoryMovements: []
}
