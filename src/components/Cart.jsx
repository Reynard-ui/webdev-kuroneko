import { formatIDR } from '../utils/format.js'
import FoodImage from './FoodImage.jsx'
import Cat from './Cat.jsx'

// Cart list with quantity steppers.
// `cart` is a Map-like object: { [foodId]: { food, qty } }
// The steppers call onInc / onDec which update the cart in App state.
export default function Cart({ cart, onInc, onDec, onRemove, subtotal, onGoToOrder }) {
  const entries = Object.values(cart)

  // Empty cart state — a small Kuro line-art moment.
  if (entries.length === 0) {
    return (
      <div className="empty">
        <Cat size={84} line tail />
        <div className="empty-title">Your cart is empty.</div>
        <div className="small muted">Add some dishes from the menu to get started — Kuro is keeping the counter warm.</div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {entries.map(({ food, qty }) => (
          <div key={food.id} className="card" style={{ display: 'flex', gap: 14, padding: 14, alignItems: 'center' }}>
            <div style={{ flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: '2px dashed var(--border)' }}>
              <FoodImage image={food.image} category={food.category} size={64} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="food-name" style={{ fontSize: 15 }}>{food.name}</div>
              <div className="muted small">{formatIDR(food.price)}</div>

              {/* Quantity stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => onDec(food.id)}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                <button className="btn btn-outline btn-sm" onClick={() => onInc(food.id)}>+</button>
                <button
                  className="btn btn-sm"
                  style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--vermillion-dark)' }}
                  onClick={() => onRemove(food.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-card" style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="muted small">Subtotal</div>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)' }}>{formatIDR(subtotal)}</div>
        </div>
        <button className="btn btn-primary" onClick={onGoToOrder}>
          Proceed to Order
        </button>
      </div>
    </div>
  )
}
