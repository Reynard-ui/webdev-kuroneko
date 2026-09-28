import { useState } from 'react'
import { formatIDR } from '../utils/format.js'
import OrderSummary from '../components/OrderSummary.jsx'

// Delivery fee constant. 0 for pickup, a flat fee for delivery.
const DELIVERY_FEE = 10000

// The "Place Order" form page.
// Reviews the cart, chooses Delivery/Pickup, collects an address for delivery,
// adds optional notes, shows live totals, and creates the order on submit.
// `nextOrderId` is passed down from App (the next unused order number).
export default function OrderForm({ cart, subtotal, user, nextOrderId, onCancel, onPlaceOrder }) {
  const [orderType, setOrderType] = useState('delivery')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Totals update live as order type changes.
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee

  const emptyCart = Object.keys(cart).length === 0

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // A cart must have items before an order can be placed.
    if (emptyCart) {
      setError('Your cart is empty. Add dishes from the menu first.')
      return
    }

    // Delivery needs a valid address.
    if (orderType === 'delivery' && address.trim().length < 8) {
      setError('Please enter a full delivery address (at least 8 characters).')
      return
    }

    // Build the new order in the shape defined in data/orders.js.
    const items = Object.values(cart).map(({ food, qty }) => ({
      foodId: food.id,
      name: food.name,
      quantity: qty,
      price: food.price,
    }))

    const newOrder = {
      id: nextOrderId,
      clientId: user.id,
      customer: user.name,
      items,
      subtotal,
      deliveryFee,
      total,
      orderType,
      address: orderType === 'delivery' ? address.trim() : '',
      status: 'pending', // new orders always start as pending
      placedAt: 'Today',
      notes: notes.trim(),
    }

    // Ask App to keep this order pending and open the payment page; the
    // order is only added to the shared list once payment is confirmed.
    onPlaceOrder(newOrder)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-band">
          <div>
            <span className="kanji-eyebrow">注文書</span>
            <h2>Place your order</h2>
          </div>
          <span className="band-kicker">発</span>
        </div>
        <p className="section-sub">Review your cart, choose how you’ll get it, and confirm.</p>

        <form className="split" onSubmit={handleSubmit} noValidate>
          {/* Left: the form fields */}
          <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18 }}>Delivery details</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onCancel('cart')}>
                ← Back to cart
              </button>
            </div>

            {/* Delivery / Pickup */}
            <div className="options">
              <div
                className={`option ${orderType === 'delivery' ? 'active' : ''}`}
                onClick={() => setOrderType('delivery')}
              >
                <div className="opt-title">🛵 Delivery</div>
                <div className="opt-desc">We bring it to you (+{formatIDR(DELIVERY_FEE)})</div>
              </div>
              <div
                className={`option ${orderType === 'pickup' ? 'active' : ''}`}
                onClick={() => setOrderType('pickup')}
              >
                <div className="opt-title">🏃 Pickup</div>
                <div className="opt-desc">Collect it at the counter (free)</div>
              </div>
            </div>

            {/* Address only matters for delivery */}
            {orderType === 'delivery' && (
              <div className="field" style={{ marginTop: 16 }}>
                <label htmlFor="address">Delivery address</label>
                <input
                  id="address"
                  className="input"
                  placeholder="Street, building, landmark…"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div className="hint">Required for delivery orders.</div>
              </div>
            )}

            {/* Optional notes */}
            <div className="field">
              <label htmlFor="notes">Order notes (optional)</label>
              <textarea
                id="notes"
                className="input"
                rows={2}
                placeholder="e.g. extra spicy, no onions…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <div className="banner error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block">
              Place order · {formatIDR(total)}
            </button>
          </div>

          {/* Right: live summary */}
          <OrderSummary cart={cart} subtotal={subtotal} deliveryFee={deliveryFee} total={total} />
        </form>
      </div>
    </div>
  )
}

// The next order id is supplied by App (it tracks the highest id already in use).
