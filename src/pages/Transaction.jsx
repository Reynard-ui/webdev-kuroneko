import { formatIDR } from '../utils/format.js'
import { STATUS_SEALS } from '../data/orders.js'
import Confetti from '../components/Confetti.jsx'
import Cat from '../components/Cat.jsx'

// The transaction / receipt page, shown right after an order is placed.
// It renders the confirmed order as a paper-receipt card (hanko stamp +
// confetti on entry) with the itemized lines, totals, and delivery detail,
// then hands the user forward to "My orders" or back to the menu.
//
// `order` is the object App just created (see OrderForm's submit shape in
// data/orders.js). Confetti is keyed on the order id so it bursts once.
export default function Transaction({ order, onNavigateView }) {
  const sealChar = STATUS_SEALS[order.status] || '印'
  const itemCount = order.items.reduce((n, it) => n + it.quantity, 0)

  return (
    <div className="page">
      <div className="container">
        <div className="receipt" style={{ position: 'relative', overflow: 'hidden', maxWidth: 560, margin: '8px auto 0' }}>
          <Confetti playKey={order.id} />
          <div
            className="form-card receipt-card"
            style={{ animation: 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Perforated receipt edge: two side notches on the header rule. */}
            <div className="receipt-notches" aria-hidden="true">
              <span />
              <span />
            </div>

            {/* Header: the "order confirmed" hanko moment. */}
            <div style={{ textAlign: 'center', paddingBottom: 18, marginBottom: 18, borderBottom: '2px dashed var(--border)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
                <span
                  className="seal seal-red"
                  style={{ width: 58, height: 58, background: 'rgba(192,57,43,0.10)' }}
                  aria-hidden="true"
                >
                  <span className="seal-ring" style={{ borderColor: 'var(--vermillion)' }} />
                  <span className="seal-char" style={{ fontSize: 20 }}>納品</span>
                </span>
                <Cat size={46} line tail />
              </div>
              <h2 style={{ fontSize: 26, marginBottom: 4 }}>Order confirmed!</h2>
              <div className="muted small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span>Receipt <b style={{ color: 'var(--ink)' }}>#{order.id}</b></span>
                <span aria-hidden="true">·</span>
                <span>{order.placedAt}</span>
                <span aria-hidden="true">·</span>
                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              </div>
              {/* Live status stamp, same treatment as the order cards. */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <span className={`status-stamp ${order.status}`} aria-label={`Status: ${order.status}`}>
                  <span className="stamp-circle" aria-hidden="true">{sealChar}</span>
                  <span className="stamp-label">{order.status}</span>
                </span>
              </div>
            </div>

            {/* Body: delivery detail + items on the left, totals on the right. */}
            <div className="receipt-grid">
              <div className="receipt-col">
                <span className="order-block-label">Details</span>
                <div className="receipt-lines">
                  <div className="receipt-line">
                    <span className="muted">{order.orderType === 'delivery' ? '🛵 Delivery' : '🏃 Pickup'}</span>
                    {order.orderType === 'delivery' ? (
                      <span>{order.address || 'Delivery'}</span>
                    ) : (
                      <span>At the counter</span>
                    )}
                  </div>
                  <div className="receipt-line">
                    <span className="muted">Customer</span>
                    <span>{order.customer}</span>
                  </div>
                  {order.notes && (
                    <div className="receipt-line">
                      <span className="muted">Notes</span>
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>

                <div style={{ height: 14 }} />
                <span className="order-block-label">Items</span>
                <div className="receipt-lines">
                  {order.items.map((it) => (
                    <div className="receipt-line" key={it.foodId}>
                      <span>
                        {it.quantity}× {it.name}
                      </span>
                      <span>{formatIDR(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="receipt-col">
                <span className="order-block-label">Total</span>
                <div className="receipt-lines">
                  <div className="receipt-line">
                    <span className="muted">Subtotal</span>
                    <span>{formatIDR(order.subtotal)}</span>
                  </div>
                  <div className="receipt-line">
                    <span className="muted">Delivery</span>
                    <span>{order.deliveryFee ? formatIDR(order.deliveryFee) : 'Free'}</span>
                  </div>
                  <div className="receipt-line receipt-total">
                    <span>Total</span>
                    <span>{formatIDR(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forward actions. */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => onNavigateView('orders')}>
                View my orders
              </button>
              <button className="btn btn-primary" onClick={() => onNavigateView('menu')}>
                Order more
              </button>
            </div>

            {/* Footer: a thank-you line + the brand mark, receipt-style. */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 14,
                borderTop: '2px dashed var(--border)',
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--muted)',
                letterSpacing: '0.06em',
              }}
            >
              黒猫 · KURO NEKO — thank you, see you soon 🐾
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
