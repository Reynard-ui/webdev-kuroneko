import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FoodGrid from '../components/FoodGrid.jsx'

// The client's standalone Menu page: just the item boxes, grouped by the
// category selected in the navbar (which shows the categories as links on
// this page). No header, no search box, no in-page category chips — the
// navbar owns the categories now.
//
// `foods` is the live menu; `activeCat` is 'All' or a category name; a null/
// undefined 'All' means show everything. Each card is wrapped in <Reveal>
// inside FoodGrid, so the grid cascades in one by one on scroll.
export default function ClientMenuPage({ foods, activeCat, onAddToCart, getQty }) {
  // Snap to the top whenever the page mounts OR the navbar switches the
  // category, so the filtered grid is always revealed just under the pinned
  // navbar. ('instant' overrides the page's global smooth scroll-behavior.)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeCat])

  const filtered = activeCat && activeCat !== 'All'
    ? foods.filter((f) => f.category === activeCat)
    : foods

  // "Back to home" — goes to the root URL (/), which the App's router
  // effect mirrors back to the client home view.
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="container">
        <div className="menu-page-grid" style={{ marginTop: 12 }}>
          <FoodGrid foods={filtered} onAddToCart={onAddToCart} getQty={getQty} />
        </div>

        {/* Back to home, at the very bottom of the menu page. */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '48px 0 24px' }}>
          <button
            type="button"
            className="btn btn-pill red"
            onClick={() => navigate('/')}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
