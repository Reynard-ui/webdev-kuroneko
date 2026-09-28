import { formatIDR } from '../utils/format.js'
import { STATUS_SEALS } from '../data/orders.js'

// Shows a single order and its current status.
// Used on the client "My Orders" view and the home "Your active order".
// The status renders as a Japanese stamp-style badge (dashed ring + kanji)
// instead of a generic gray pill.
//
// Layout inside the charcoal .order-section panel is wide-and-low:
// the line items fill the left column while totals / address / status
// control sit in a right column (falls back to one column on phones).
export default function OrderStatus({ order, canUpdate, onStatusChange, showCustomer = false, hideNumber = false }) {
  const sealChar = STATUS_SEALS[order.status] || '印'
  return (
    <div className="order-card">
      <div className="order-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            {!hideNumber && <div style={{ fontWeight: 700 }}>Order #{order.id}</div>}
            <div className="muted small">
              {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'} · {order.placedAt}
              {order.orderType === 'delivery' && order.address && (
                <> · 📍 {order.address}</>
              )}
              {showCustomer && <> · {order.customer}</>}
            </div>
          </div>
        </div>

        {/* Stamp-style status badge: dashed ring + status kanji + label. */}
        <span className={`status-stamp ${order.status}`} aria-label={`Status: ${order.status}`}>
          <span className="stamp-circle" aria-hidden="true">
            {sealChar}
          </span>
          <span className="stamp-label">{order.status}</span>
        </span>
      </div>

      {/* Wide body: two labeled sections — the menu (dish list) on the left,
          the total on the right. The address now lives in the header next to
          "Delivery" instead of dangling at the bottom. */}
      <div className="order-body">
        <div className="order-menu">
          <span className="order-block-label">Menu</span>
          <div className="order-items">
            {order.items.map((it) => (
              <div className="order-item" key={it.foodId}>
                <span>{it.quantity}× {it.name}</span>
                <span>{formatIDR(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-total">
          <span className="order-block-label">Total</span>
          <div className="order-totals">
            <div className="order-item">
              <span>Subtotal</span>
              <span>{formatIDR(order.subtotal)}</span>
            </div>
            {order.orderType === 'delivery' && (
              <div className="order-item">
                <span>Delivery</span>
                <span>{formatIDR(order.deliveryFee)}</span>
              </div>
            )}
            <div className="order-total-row">
              <span>Total</span>
              <span>{formatIDR(order.total)}</span>
            </div>
          </div>

          {/* Admin can update the status; client is read-only. */}
          {canUpdate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="small muted" htmlFor={`status-${order.id}`}>
                Update status:
              </label>
              <select
                id={`status-${order.id}`}
                className="status-select"
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
              >
                {['pending', 'confirmed', 'preparing', 'ready', 'completed'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
