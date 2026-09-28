import { useState } from 'react'
import { createPortal } from 'react-dom'
import { formatIDR } from '../utils/format.js'
import FoodImage from './FoodImage.jsx'
import { CATEGORY_KANJI } from '../data/foods.js'

// A single menu item card (KURO NEKO vintage-poster treatment):
//   - circular/rounded photo thumbnail on top
//   - small red circular badge overlaid on the photo corner (add/qty)
//   - dark card body with a dashed-border inset box for name + description
//   - red ribbon strip at the card bottom showing the price
//
// `mode` decides what actions the card offers:
//   'client' (default) -> an "Add +" badge so the customer can order it
//   'admin'            -> "Edit" and "Remove" buttons so the kitchen can manage it
//
// Sold-out items (available: false) always show a "Sold out" tag and are not
// orderable, but the admin can still edit or remove them.
export default function FoodCard({ food, onAddToCart, inCartQty = 0, mode = 'client', onRemove, onEdit, onOpenPhoto }) {
  const available = food.available
  const isAdmin = mode === 'admin'

  // Subtle pointer tilt (a few degrees). Pointer position sets two CSS vars
  // that the stylesheet turns into a perspective rotation — no React state.
  function handlePointerMove(e) {
    const el = e.currentTarget
    if (e.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--tilt-x', `${(-y * 4).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(x * 4).toFixed(2)}deg`)
  }
  function handlePointerLeave(e) {
    e.currentTarget.style.removeProperty('--tilt-x')
    e.currentTarget.style.removeProperty('--tilt-y')
  }

  // Photo lightbox: a fixed-size popup showing the full dish photo.
  // Clicking the plate opens it; the × button or clicking empty space
  // (the dark backdrop, anything outside the photo) closes it.
  const [lightboxOpen, setLightboxOpen] = useState(false)
  function openLightbox() {
    setLightboxOpen(true)
  }
  function closeLightbox() {
    setLightboxOpen(false)
  }

  return (
    <>
    <div
      className={`card food-card ${available ? '' : 'is-out'}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {!available && <span className="soldout-tag">Sold out</span>}

      {/* Admin only: pencil icon in the corner opens the edit popup. */}
      {isAdmin && (
        <button
          className="card-edit"
          title={`Edit ${food.name}`}
          aria-label={`Edit ${food.name}`}
          onClick={() => onEdit(food)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
      )}

      <FoodImage
        image={food.image}
        category={food.category}
        fill
        onOpenPhoto={openLightbox}
      />

      <div className="food-body">
        {/* Dashed-border inset box: category mark + name + short description. */}
        <div className="food-info">
          <span className="food-cat">
            {CATEGORY_KANJI[food.category] && (
              <span
                className="seal seal-red"
                style={{
                  width: 18,
                  height: 18,
                  margin: '0 6px 0 0',
                  verticalAlign: '-4px',
                  background: 'rgba(192,57,43,0.12)',
                  display: 'inline-grid',
                }}
                aria-hidden="true"
              >
                <span className="seal-ring" style={{ borderColor: 'var(--vermillion)' }} />
                <span className="seal-char" style={{ fontSize: 8, color: 'var(--vermillion)' }}>
                  {CATEGORY_KANJI[food.category]}
                </span>
              </span>
            )}
            {food.category}
          </span>
          <h3 className="food-name">{food.name}</h3>
          <p className="food-desc">{food.description}</p>
        </div>

        {/* Red ribbon strip at the card bottom: price + state/action. */}
        <div className="food-meta">
          <span className="food-price">{formatIDR(food.price)}</span>

          {isAdmin ? (
            // Admin management mode: edit pencil is in the card corner;
            // Remove sits in the ribbon, styled like the price pill.
            <button
              className="card-remove"
              onClick={() => onRemove(food.id)}
            >
              Remove
            </button>
          ) : !available ? (
            <span className="small" style={{ color: 'var(--offwhite-dim)' }}>Unavailable</span>
          ) : (
            // The red + add-to-cart badge now sits in the ribbon (where the
            // "Tap the + to add" hint was). It shows the cart quantity once
            // the dish is added, and click toggles add/remove.
            <button
              className={`card-add ${inCartQty > 0 ? 'has-qty' : ''}`}
              title={inCartQty > 0 ? `Remove ${food.name}` : `Add ${food.name}`}
              aria-label={inCartQty > 0 ? `Remove ${food.name}` : `Add ${food.name}`}
              onClick={() => {
                onAddToCart(food)
              }}
            >
              {inCartQty > 0 ? inCartQty : '+'}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Photo popup. Rendered into <body> via a portal so the card's
        overflow:hidden and hover transform can't clip or move it. The
        dark backdrop closes it on click (empty space outside the photo);
        the red × button does the same. */}
    {lightboxOpen &&
      createPortal(
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${food.name}`}
        >
          <figure
            className="lightbox-box"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="lightbox-img"
              src={food.image}
              alt={food.name}
            />
            <button
              className="lightbox-close"
              onClick={(e) => {
                e.stopPropagation()
                closeLightbox()
              }}
              aria-label="Close photo"
            >
              ×
            </button>
          </figure>
        </div>,
        document.body,
      )}
    </>
  )
}
