import FoodCard from './FoodCard.jsx'
import Reveal from './Reveal.jsx'
import Cat from './Cat.jsx'

// Renders a grid of FoodCard components.
// Pass the already-filtered list of foods so this stays simple.
//
// `mode` is forwarded to each card:
//   'client' (default) -> customer can add to cart
//   'admin'            -> kitchen can remove dishes
//
// Each card is wrapped in a <Reveal> so grids cascade in one by one as
// they scroll into view (staggered reveal, Tio Luncin-style). The per-card
// delay is capped so long lists don't take ages to settle.
export default function FoodGrid({ foods, onAddToCart, getQty, mode = 'client', onRemove, onEdit, className = '' }) {
  if (!foods || foods.length === 0) {
    return (
      <div className="empty">
        <Cat size={64} line tail />
        <div>No dishes match that search.</div>
        <div className="small muted">Try a different name or category — Kuro sniffed around and found nothing.</div>
      </div>
    )
  }

  return (
    <div className={`grid ${className}`.trim()}>
      {foods.map((food, i) => (
        <Reveal key={food.id} delay={Math.min(i * 45, 320)}>
          <FoodCard
            food={food}
            mode={mode}
            onAddToCart={onAddToCart}
            onRemove={onRemove}
            onEdit={onEdit}
            inCartQty={getQty ? getQty(food.id) : 0}
          />
        </Reveal>
      ))}
    </div>
  )
}
