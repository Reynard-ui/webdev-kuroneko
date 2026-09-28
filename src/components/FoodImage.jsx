// A decorative "plate" for a food item. `food.image` is either a photo
// path/URL (seeded dishes, e.g. "dishes/tonkotsu-ramen.jpg", relative to
// the site base) or an emoji (admin-added dishes without a photo). Photos fill the plate as a
// cover-fitted <img>; emojis stay on the charcoal plate with the steam.
//
// Strict tri-color system: the plate is exactly the charcoal brand color
// (#26262b, via var(--charcoal)) — no darker gradient tints.
//
// Hot food categories get a gentle steam animation; drinks get ice crystals.
const CATEGORY_THEMES = {
  // Unified charcoal plate for every category, so a row of cards always
  // sits on the same background (charcoal card body, with the vermillion
  // accent staying the only loud color).
  Sushi: { bg: 'var(--charcoal)', steam: false },
  Ramen: { bg: 'var(--charcoal)', steam: true },
  Sashimi: { bg: 'var(--charcoal)', steam: false },
  Drinks: { bg: 'var(--charcoal)', steam: false },
  'Side Dishes': { bg: 'var(--charcoal)', steam: true },
  Other: { bg: 'var(--charcoal)', steam: false },
}

// Photos are real paths or URLs; placeholders are short emoji strings.
function isPhoto(image) {
  return typeof image === 'string' && (image.startsWith('/') || image.startsWith('http'))
}

export default function FoodImage({ image = '🍽️', category = '', size = 120, className = '', fill = false, onOpenPhoto }) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.Other
  // `fill` (used by menu cards) lets the surrounding CSS size the plate to
  // the full card width; otherwise it renders a fixed `size` x `size` box.
  const dims = fill ? {} : { width: size, height: size }
  // When `fill` + onOpenPhoto, the plate itself is the button that opens the
  // photo popup (single focusable element — no nested buttons).
  const clickable = fill && onOpenPhoto
  return (
    <div
      className={`food-plate ${fill ? 'food-plate-fill' : ''} ${className}`}
      style={{
        background: theme.bg,
        ...dims,
        fontSize: fill ? undefined : size * 0.5,
      }}
      aria-hidden={fill ? undefined : true}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `View photo of ${image}` : undefined}
      onClick={clickable ? onOpenPhoto : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenPhoto()
              }
            }
          : undefined
      }
    >
      {isPhoto(image) ? (
        <img className="food-plate-img" src={image} alt="" loading="lazy" />
      ) : (
        <span className="food-plate-item">{image}</span>
      )}
      {theme.steam ? (
        <div className="food-steam" aria-hidden="true">
          <span /><span /><span />
        </div>
      ) : category === 'Drinks' ? (
        <div className="food-ice" aria-hidden="true">
          <span /><span /><span />
        </div>
      ) : null}
    </div>
  )
}
