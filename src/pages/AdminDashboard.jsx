import { useState } from 'react'
import { formatIDR } from '../utils/format.js'
import { ORDER_STATUSES, STATUS_SEALS } from '../data/orders.js'
import Cat from '../components/Cat.jsx'

// Administrator page. Takes a `view` prop:
//   'dashboard' -> stats + recent orders
//   'orders'    -> full order list with status updates
//   'profile'   -> account info (incl. display-name change) + logout
//
// (The admin's "Menu" tab is handled by the separate MenuManagement page,
// so this component no longer renders the food grid.)
//
// It updates order status in shared App state, so the change is also visible
// to the client on their "My Orders" view.
//
// KURO NEKO back-office: same design system as the customer site but
// information-dense — cream stat panels, vermillion key numbers, circular
// seal badges for order status, Kuro only as a small mark.
export default function AdminDashboard({ view, user, orders, onStatusChange, onLogout, onUpdateName }) {
  // Profile: inline display-name editor.
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(user.name)
  const [nameError, setNameError] = useState('')

  function startEditName() {
    setNameDraft(user.name)
    setNameError('')
    setEditingName(true)
  }
  function cancelEditName() {
    setEditingName(false)
    setNameError('')
  }
  function saveEditName(e) {
    e?.preventDefault()
    const next = nameDraft.trim()
    if (!next) {
      setNameError('Name cannot be empty.')
      return
    }
    onUpdateName(next)
    setEditingName(false)
  }

  // Build simple stats from the order list.
  const todayOrders = orders.filter((o) => o.placedAt === 'Today')
  const pending = orders.filter((o) => o.status === 'pending').length
  const preparing = orders.filter((o) => o.status === 'preparing').length
  const completed = orders.filter((o) => o.status === 'completed').length
  const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

  const stats = [
    { label: "Today's orders", value: todayOrders.length, kanji: '今' },
    { label: 'Pending', value: pending, kanji: '待' },
    { label: 'Preparing', value: preparing, kanji: '作' },
    { label: 'Completed', value: completed, kanji: '済' },
    { label: 'Today’s revenue', value: formatIDR(revenue), accent: true, kanji: '金' },
  ]

  return (
    <div className="page">
      <div className="container">
        {/* ---------- DASHBOARD VIEW ---------- */}
        {view === 'dashboard' && (
          <>
            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">厨房</span>
                <h2>Kitchen dashboard</h2>
              </div>
              <span className="band-kicker">厨</span>
            </div>
            <p className="section-sub">
              Live overview of today’s orders and revenue. Use the Orders tab to update statuses.
            </p>

            <div className="stats">
              {stats.map((s) => (
                <div className={`stat ${s.accent ? 'accent' : ''}`} key={s.label} data-kanji={s.kanji}>
                  <div className="stat-num">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="section-band" style={{ marginBottom: 14 }}>
              <div>
                <span className="kanji-eyebrow">直近</span>
                <h2 style={{ fontSize: 22 }}>Recent orders</h2>
              </div>
            </div>
            <OrderList orders={orders} onStatusChange={onStatusChange} showCustomer />
          </>
        )}

        {/* ---------- ORDERS VIEW ---------- */}
        {view === 'orders' && (
          <>
            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">全注文</span>
                <h2>All orders</h2>
              </div>
            </div>
            <p className="section-sub">
              Update each order’s status — clients see these changes instantly.
            </p>
            <OrderList orders={orders} onStatusChange={onStatusChange} showCustomer />
          </>
        )}

        {/* ---------- PROFILE ---------- */}
        {view === 'profile' && (
          <>
            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">プロフィール</span>
                <h2>Profile</h2>
              </div>
            </div>
            <p className="section-sub">Your account at KURO NEKO.</p>

            <div className="form-card" style={{ maxWidth: 460 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="brand-logo" style={{ width: 56, height: 56, fontSize: 28 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  {editingName ? (
                    <form onSubmit={saveEditName} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="input"
                        style={{ flex: 1, minWidth: 0 }}
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="Your name"
                        autoFocus
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>Save</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={cancelEditName}>Cancel</button>
                    </form>
                  ) : (
                    <div style={{ fontSize: 19, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                      {user.name}
                    </div>
                  )}
                  <div className="small muted">@{user.username}</div>
                </div>
              </div>

              {nameError && <div className="banner error" style={{ marginTop: 10 }}>{nameError}</div>}

              <div className="profile-rows">
                <div className="profile-row">
                  <span className="muted">Display name</span>
                  {editingName ? (
                    <span className="muted small">editing…</span>
                  ) : (
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }} onClick={startEditName}>
                      ✎ Change
                    </button>
                  )}
                </div>
                <div className="profile-row">
                  <span className="muted">Username</span>
                  <strong>{user.username}</strong>
                </div>
                <div className="profile-row">
                  <span className="muted">Role</span>
                  <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>
                </div>
                <div className="profile-row">
                  <span className="muted">Orders handled</span>
                  <strong>{orders.length}</strong>
                </div>
              </div>

              <button className="btn btn-outline" onClick={onLogout}>
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Small internal list renderer so dashboard + orders views share the same markup.
function OrderList({ orders, onStatusChange, showCustomer }) {
  if (orders.length === 0) {
    return (
      <div className="empty">
        <Cat size={80} line tail />
        <div className="empty-title">No orders yet.</div>
        <div className="small muted">Kuro has swept the counter clean.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid' }}>
      {orders.map((order) => (
        <div key={order.id} className="order-section">
          <div className="order-section-head">
            <div>
              <span className="kanji-eyebrow">注文</span>
              <h3>Order #{order.id}</h3>
            </div>
          </div>
          <OrderCard
            order={order}
            onStatusChange={onStatusChange}
            showCustomer={showCustomer}
            hideNumber
          />
        </div>
      ))}
    </div>
  )
}

// One order row: charcoal-topped card with the circular seal status badge,
// totals, and the status dropdown (all existing admin behavior preserved).
function OrderCard({ order, onStatusChange, showCustomer, hideNumber }) {
  const sealChar = STATUS_SEALS[order.status] || '印'
  return (
    <div className="order-card admin-card">
      <div className="order-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Circular seal badge for the order's status (mirrors the
              customer-side stamp treatment). */}
          <span
            className={`status-stamp ${order.status}`}
            style={{ background: 'transparent', border: 'none', padding: 0 }}
            aria-label={`Status: ${order.status}`}
          >
            <span className="stamp-circle" aria-hidden="true">{sealChar}</span>
          </span>
          <div>
            <div style={{ fontWeight: 700 }}>
              {!hideNumber && <>Order #{order.id}</>}
              {showCustomer && (
                <span className="muted" style={{ fontWeight: 400 }}>
                  {hideNumber ? order.customer : ` — ${order.customer}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`status status-${order.status}`}>{order.status}</span>
        </div>
      </div>

      {/* Two labeled sections: the menu (dish list) on the left, the total +
          status control on the right. Mirrors the client panel. */}
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
            <div className="order-total-row">
              <span className="muted" style={{ fontWeight: 500 }}>Total</span>
              <span>{formatIDR(order.total)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="small muted" htmlFor={`status-admin-${order.id}`}>Status:</label>
            <select
              id={`status-admin-${order.id}`}
              className="status-select"
              value={order.status}
              onChange={(e) => {
                onStatusChange(order.id, e.target.value)
              }}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
