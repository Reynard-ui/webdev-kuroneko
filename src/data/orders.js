// Hardcoded initial orders.
//
// In the app these become live React state (App.jsx holds `orders` and passes
// update functions down). New client orders are appended to this list at runtime.
// Later this can be replaced by reading/writing orders from a backend/database.
//
// Possible statuses: "pending", "confirmed", "preparing", "ready", "completed".

const seedOrders = [
  {
    id: 1024,
    clientId: 2,
    customer: 'Beany',
    items: [
      { foodId: 1, name: 'Salmon Nigiri Set', quantity: 2, price: 85000 },
      { foodId: 8, name: 'Pork Gyoza (4 pcs)', quantity: 1, price: 30000 },
    ],
    subtotal: 200000,
    deliveryFee: 10000,
    total: 210000,
    orderType: 'delivery',
    address: 'Jl. Sudirman No. 10, Jakarta',
    status: 'preparing',
    placedAt: 'Today',
  },
  {
    id: 1023,
    clientId: 2,
    customer: 'Beany',
    items: [
      { foodId: 3, name: 'Tonkotsu Ramen', quantity: 2, price: 55000 },
      { foodId: 7, name: 'Iced Hojicha Latte', quantity: 1, price: 30000 },
    ],
    subtotal: 140000,
    deliveryFee: 0,
    total: 140000,
    orderType: 'pickup',
    address: '',
    status: 'completed',
    placedAt: 'Yesterday',
  },
  {
    id: 1022,
    clientId: 2,
    customer: 'Beany',
    items: [
      { foodId: 5, name: 'Sashimi Moriawase', quantity: 1, price: 95000 },
    ],
    subtotal: 95000,
    deliveryFee: 10000,
    total: 105000,
    orderType: 'delivery',
    address: 'Jl. Sudirman No. 10, Jakarta',
    status: 'completed',
    placedAt: 'Yesterday',
  },
]

// Simple list of status values, used by the admin status selector.
export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed']

// A kanji seal per order status, shown inside the Japanese status stamps.
export const STATUS_SEALS = {
  pending: '待',
  confirmed: '認',
  preparing: '作',
  ready: '可',
  completed: '終',
}

export default seedOrders
