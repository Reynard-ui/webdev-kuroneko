import { useEffect, useState } from 'react'
import { formatIDR } from '../utils/format.js'
import FoodGrid from '../components/FoodGrid.jsx'
import Cart from '../components/Cart.jsx'
import OrderStatus from '../components/OrderStatus.jsx'
import Cat from '../components/Cat.jsx'
import { STORY, BRANCHES, FEATURES, SPECIALTIES, CONTACT } from '../data/brand.js'

// Client page. Takes a `view` prop:
//   'home' / 'about' / 'contact' -> ONE single page: welcome hero, features
//   strip, active order, popular dishes, then the About (story +
//   specialties) and Contact (get-in-touch form) sections stacked below.
//   'about' and 'contact' don't render different content — they just
//   auto-scroll to their section on mount (App remounts this page on every
//   view change) and light up their navbar link.
//   'branches' -> "find the cat" branch/location cards
//   'cart'     -> cart with steppers + subtotal
//   'orders'   -> this client's orders with live stamp-style status
//   'profile'  -> account info + logout
//
// The cart/order state lives in App; this page just calls the handlers up.
// `onNavigateView` lets in-page CTAs ("Be in Touch") jump between client views.
export default function ClientDashboard({
  view,
  user,
  foods,
  cart,
  subtotal,
  onInc, onDec, onRemove, onAddToCart,
  getQty,
  onGoToOrder,
  onBrowseMenu,
  onBrowseCategory,
  onNavigateView,
  myOrders,
  onLogout,
  onUpdateName,
}) {
  // Contact form (about view): fields + transient "sent" confirmation.
  const [contact, setContact] = useState({ name: '', email: '', message: '' })
  const [contactError, setContactError] = useState('')
  const [contactSent, setContactSent] = useState(false)
  function submitContact(e) {
    e.preventDefault()
    setContactError('')
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
      setContactError('Please fill in every field.')
      return
    }
    setContactSent(true)
    setContact({ name: '', email: '', message: '' })
  }

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

  // Single-page scroll behavior: 'about' and 'contact' are sections of the
  // home page, so on mount (App remounts this component on every view
  // change) we scroll to the matching section. 'home' jumps back to the top.
  // scroll-margin-top in CSS keeps the pinned navbar from covering the
  // section heading.
  useEffect(() => {
    if (view === 'about' || view === 'contact') {
      const el = document.getElementById(`client-${view}`)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else if (view === 'home') {
      // 'instant' overrides the page's global smooth scroll-behavior —
      // clicking Home should snap back to the top, not crawl.
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [view])

  // Popular = first few items; current = not-completed orders (the "active
  // order" section). The "recent orders" section was removed from home.
  const popular = foods.slice(0, 4)
  const current = myOrders.filter((o) => o.status !== 'completed')

  // Specialties: pair each specialty blurb with the FIRST live dish in that
  // category, so the section stays data-bound (admin removes a dish -> row
  // disappears instead of showing stale copy).
  const specialtyRows = Object.entries(SPECIALTIES)
    .map(([cat, s]) => ({ cat, ...s, dish: foods.find((f) => f.category === cat) }))
    .filter((r) => r.dish)

  return (
    <div className="page">
      <div className="container">
        {/* ---------- HOME (single page: welcome -> active order -> popular
            -> about -> contact). 'about'/'contact' render the same page and
            just auto-scroll to their section + highlight their navbar link. */}
        {(view === 'home' || view === 'about' || view === 'contact') && (
          <>
            {/* Hero: two-column vintage poster. Left copy + pill buttons,
                right oversized kanji display in a dashed frame, with a big
                bleeding red circle and cherry-blossom linework. */}
            <div className="hero">
              <div className="confetti-sq" style={{ top: 18, left: 30, width: 14, height: 14, transform: 'rotate(18deg)' }} aria-hidden="true" />
              <div className="confetti-sq" style={{ top: 52, left: 62, width: 8, height: 8, transform: 'rotate(-12deg)', opacity: 0.22 }} aria-hidden="true" />
              <div className="hero-red-circle" aria-hidden="true" />
              <div className="hero-grid">
                {/* Left: eyebrow + welcome copy + two pill buttons. */}
                <div className="hero-text">
                  <div className="hero-label">Fresh · Daily · Handmade</div>
                  <h1>Welcome back, {user.name}</h1>
                  <p>
                    KURO NEKO serves fresh sushi, ramen, and sashimi made to
                    order. Build your cart and track your order live — Kuro
                    is watching the kitchen.
                  </p>
                  <div className="hero-btns">
                    <button className="btn btn-pill red" onClick={onBrowseMenu}>
                      Order Now
                    </button>
                    <button className="btn btn-pill" onClick={() => onNavigateView('contact')}>
                      Be in Touch
                    </button>
                  </div>
                </div>

                {/* Right: oversized kanji display + subtitle in a dashed
                    circular frame, with Kuro worked into the graphic. */}
                <div className="hero-display">
                  <div className="hero-display-frame">
                    <div>
                      <span className="hero-kanji">黒猫</span>
                      <div className="hero-subtitle">Sushi · Ramen · Sashimi</div>
                    </div>
                    <div className="hero-plaque" aria-hidden="true">
                      <span>黒</span>
                      <span>KURO</span>
                    </div>
                    <Cat size={92} className="hero-cat" />
                  </div>
                </div>
              </div>
            </div>

            {/* Features strip: dark pill bar with seal icons, decorative. */}
            <div className="features-strip" aria-label="Kitchen features">
              {FEATURES.map((f) => (
                <div className="feature-item" key={f.label}>
                  <span className="feature-seal" aria-hidden="true">{f.kanji}</span>
                  {f.label}
                </div>
              ))}
            </div>

            {current.length > 0 && (
              <>
                <div className="section-band">
                  <div>
                    <span className="kanji-eyebrow">進行中</span>
                    <h2>Your active order</h2>
                  </div>
                </div>
                <div style={{ display: 'grid' }}>
                  {current.map((o) => (
                    <div key={o.id} className="order-section">
                      <div className="order-section-head">
                        <div>
                          <span className="kanji-eyebrow">注文</span>
                          <h3>Order #{o.id}</h3>
                        </div>
                      </div>
                      <OrderStatus order={o} hideNumber />
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">人気</span>
                <h2>Popular today</h2>
              </div>
              <span className="band-kicker">好</span>
            </div>
            <FoodGrid
              foods={popular}
              className="popular-grid"
              onAddToCart={onAddToCart}
              getQty={getQty}
            />

            {/* ABOUT: the story of Kuro Neko + specialties, now a section of
                the home page (nav "About" scrolls here). */}
            <div id="client-about">
              <div className="section-band">
                <div>
                  <span className="kanji-eyebrow">{STORY.eyebrow}</span>
                  <h2>{STORY.title}</h2>
                </div>
                <span className="band-kicker">{STORY.kanji.slice(0, 1)}</span>
              </div>
              <div className="story-grid">
                <div className="story-copy">
                  {STORY.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <div className="red-rule" aria-hidden="true" />
                </div>
                <div className="story-visual">
                  <div className="dash-frame" aria-hidden="true">
                    <Cat size={150} />
                  </div>
                </div>
              </div>

              {/* Our Specialties: editorial rows mixing copy + kanji + dish. */}
              <div className="section-band">
                <div>
                  <span className="kanji-eyebrow">名物</span>
                  <h2>Our specialties</h2>
                </div>
                <span className="band-kicker">名</span>
              </div>
              <div style={{ display: 'grid', gap: 18 }}>
                {specialtyRows.map((row, i) => (
                  <div key={row.cat} className={`specialty-row ${i % 2 ? 'reverse' : ''}`}>
                    <div className="specialty-copy">
                      <span className="kanji-eyebrow">{row.eyebrow}</span>
                      <h3>{row.title}</h3>
                      <p>{row.copy}</p>
                      <button
                        className="btn btn-pill red"
                        style={{ marginTop: 16 }}
                        onClick={() => onBrowseCategory(row.cat)}
                      >
                        See {row.cat}
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div
                        className="food-plate"
                        style={{
                          background: 'var(--charcoal)',
                          width: '100%',
                          height: 170,
                          borderRadius: 12,
                        }}
                        aria-hidden="true"
                      >
                        {row.dish.image.startsWith ? (
                          <img
                            className="food-plate-img"
                            src={row.dish.image}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="food-plate-item">{row.dish.image}</span>
                        )}
                      </div>
                      <span className="specialty-kanji" aria-hidden="true">{row.eyebrow}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CONTACT: "get in touch" form, now a section of the home page
                (nav "Contact" scrolls here; the hero's "Be in Touch" too). */}
            <div id="client-contact">
              <div className="section-band">
                <div>
                  <span className="kanji-eyebrow">{CONTACT.eyebrow}</span>
                  <h2>{CONTACT.title}</h2>
                </div>
                <span className="band-kicker">便</span>
              </div>
              <div className="contact-split">
                <div className="contact-dark">
                  <div className="confetti-sq" style={{ top: 16, right: 20, width: 12, height: 12, transform: 'rotate(20deg)', opacity: 0.35 }} aria-hidden="true" />
                  <div className="confetti-sq" style={{ bottom: 70, left: 18, width: 8, height: 8, transform: 'rotate(-15deg)', opacity: 0.3 }} aria-hidden="true" />
                  <div className="contact-vertical" aria-hidden="true">{CONTACT.verticalKanji}</div>
                  <svg className="mountain-line" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true"
                       style={{ width: '100%', height: 90 }}>
                    <path d="M0 90 L80 30 L150 70 L230 18 L310 62 L400 24 L400 90 Z"
                          fill="rgba(245,238,225,0.16)" />
                    <path d="M0 90 L60 55 L140 84 L260 40 L340 78 L400 52 L400 90 Z"
                          fill="rgba(38,38,43,0.5)" />
                  </svg>
                  <div className="contact-note" style={{ position: 'relative', zIndex: 1 }}>{CONTACT.blurb}</div>
                </div>
                <div className="contact-form">
                  <h3>Get in touch</h3>
                  <form onSubmit={submitContact} noValidate>
                    <div className="field">
                      <label htmlFor="contact-name">Name</label>
                      <input
                        id="contact-name"
                        className="input input-pill"
                        placeholder="Your name"
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="contact-email">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        className="input input-pill"
                        placeholder="you@example.com"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="contact-message">Message</label>
                      <textarea
                        id="contact-message"
                        className="input"
                        rows={3}
                        placeholder="Reservations, events, questions…"
                        value={contact.message}
                        onChange={(e) => setContact({ ...contact, message: e.target.value })}
                      />
                    </div>
                    {contactError && <div className="banner error">{contactError}</div>}
                    {contactSent && (
                      <div className="banner success">Thanks — we’ll be in touch. Kuro says hello.</div>
                    )}
                    <button type="submit" className="btn btn-primary btn-pill red" style={{ borderRadius: 999 }}>
                      Send message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ---------- BRANCHES / FIND THE CAT ---------- */}
        {view === 'branches' && (
          <>
            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">探猫</span>
                <h2>Find the cat</h2>
              </div>
              <span className="band-kicker">店</span>
            </div>
            <p className="section-sub">
              Three ways to meet Kuro — in the flagship counter, the Kemang
              izakaya room, or on delivery to your door.
            </p>
            <div className="branch-grid">
              {BRANCHES.map((b) => (
                <div className="branch-card" key={b.id}>
                  <span className="branch-kanji" aria-hidden="true">{b.kanji}</span>
                  <h4>{b.name}</h4>
                  <div className="branch-meta">
                    <div>{b.address}</div>
                    <div>{b.hours}</div>
                    <div style={{ marginTop: 8 }}>{b.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- CART ---------- */}
        {view === 'cart' && (
          <>
            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">カート</span>
                <h2>Your cart</h2>
              </div>
            </div>
            <p className="section-sub">Adjust quantities, then proceed to place the order.</p>
            <Cart
              cart={cart}
              onInc={onInc}
              onDec={onDec}
              onRemove={onRemove}
              subtotal={subtotal}
              onGoToOrder={onGoToOrder}
            />
          </>
        )}

        {/* ---------- MY ORDERS ---------- */}
        {view === 'orders' && (
          <>
            <div className="section-band">
              <div>
                <span className="kanji-eyebrow">注文</span>
                <h2>My orders</h2>
              </div>
            </div>
            <p className="section-sub">
              Track your order status. The kitchen updates it in real time.
            </p>
            {myOrders.length === 0 ? (
              <div className="empty">
                <Cat size={72} line tail />
                <div className="empty-title">No orders yet.</div>
                <div className="small muted">Place your first order from the menu — Kuro will wait.</div>
              </div>
            ) : (
              <div style={{ display: 'grid' }}>
                {myOrders.map((o) => (
                  <div key={o.id} className="order-section">
                    <div className="order-section-head">
                      <div>
                        <span className="kanji-eyebrow">注文</span>
                        <h3>Order #{o.id}</h3>
                      </div>
                    </div>
                    <OrderStatus order={o} hideNumber />
                  </div>
                ))}
              </div>
            )}
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
                  <span className="muted">Orders placed</span>
                  <strong>{myOrders.length}</strong>
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

