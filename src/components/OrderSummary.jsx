import { formatIDR } from '../utils/format.js'

// Reusable order line-items + totals block.
// Used by the cart page and the order form.
export default function OrderSummary({ cart, subtotal, deliveryFee, total }) {
  const entries = Object.values(cart)

  return (
    <div className="form-card">
      <h3 style={{ fontSize: 18, marginBottom: 12 }}>Order summary</h3>

      {entries.length === 0 ? (
        <p className="muted small">No items selected yet.</p>
      ) : (
        <div>
          {entries.map(({ food, qty }) => (
            <div className="order-item" key={food.id}>
              <span>{food.name} × {qty}</span>
              <span>{formatIDR(food.price * qty)}</span>
            </div>
          ))}

          <div className="order-totals">
            <div className="order-item" style={{ color: 'var(--ink-soft)' }}>
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <div className="order-item" style={{ color: 'var(--ink-soft)' }}>
              <span>Delivery</span>
              <span>{formatIDR(deliveryFee)}</span>
            </div>
            <div className="order-total-row" style={{ marginTop: 6 }}>
              <span>Total</span>
              <span>{formatIDR(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
