// Hardcoded food menu. This is the single source of truth for the menu.
// Later this can be replaced by fetching food items from a backend/database.
//
// `image` holds the path to the dish photo (public/dishes/...), so Vite
// serves it from the project root in dev and copies it into dist/ on build.
// Admin-added dishes that have no photo keep an emoji placeholder.
const foods = [
  {
    id: 1,
    name: 'Salmon Nigiri Set',
    category: 'Sushi',
    price: 85000,
    description: 'Eight pieces of fresh salmon nigiri with seasoned sushi rice and nori.',
    image: '/dishes/salmon-nigiri.jpg',
    available: true,
  },
  {
    id: 2,
    name: 'Ebi Temaki Roll',
    category: 'Sushi',
    price: 60000,
    description: 'Hand-rolled nori cone stuffed with crispy ebi shrimp, avocado, and cucumber.',
    image: '/dishes/ebi-temaki.jpg',
    available: true,
  },
  {
    id: 3,
    name: 'Tonkotsu Ramen',
    category: 'Ramen',
    price: 55000,
    description: 'Rich pork-bone broth with chashu, soft-boiled egg, and ramen noodles.',
    image: '/dishes/tonkotsu-ramen.jpg',
    available: true,
  },
  {
    id: 4,
    name: 'Shoyu Ramen',
    category: 'Ramen',
    price: 48000,
    description: 'Clear soy broth with chicken shoyu, nori, and bamboo shoots.',
    image: '/dishes/shoyu-ramen.jpg',
    available: true,
  },
  {
    id: 5,
    name: 'Sashimi Moriawase',
    category: 'Sashimi',
    price: 95000,
    description: 'Sliced salmon and tuna platter, served with daikon, shiso, and wasabi.',
    image: '/dishes/sashimi.jpg',
    available: false, // sold out for today
  },
  {
    id: 6,
    name: 'Matcha Latte',
    category: 'Drinks',
    price: 35000,
    description: 'Ceremonial-grade matcha whisked into oat milk, lightly sweetened.',
    image: '/dishes/matcha-latte.jpg',
    available: true,
  },
  {
    id: 7,
    name: 'Iced Hojicha Latte',
    category: 'Drinks',
    price: 30000,
    description: 'Roasted hojicha tea poured over milk and plenty of ice.',
    image: '/dishes/hojicha-latte.jpg',
    available: true,
  },
  {
    id: 8,
    name: 'Pork Gyoza (4 pcs)',
    category: 'Side Dishes',
    price: 30000,
    description: 'Pan-seared gyoza with a garlicky soy-vinegar dipping sauce.',
    image: '/dishes/gyoza.jpg',
    available: true,
  },
  {
    id: 9,
    name: 'Karaage',
    category: 'Side Dishes',
    price: 38000,
    description: 'Crispy soy-marinated fried chicken, finished with sea salt.',
    image: '/dishes/karaage.jpg',
    available: true,
  },
]

export default foods

// The category options the kitchen works with. Used by the admin "add dish"
// form. If a new category ever appears in the menu data, the client filter
// chips pick it up automatically (they are derived from the live foods list).
export const CATEGORIES = ['Sushi', 'Ramen', 'Sashimi', 'Drinks', 'Side Dishes']

// One kanji per category, used as small red hanko seals in the UI
// (menu tabs, food cards, stamps). Data-only — no component logic.
export const CATEGORY_KANJI = {
  All: '全',
  Sushi: '寿',
  Ramen: '麺',
  Sashimi: '刺',
  Drinks: '茶',
  'Side Dishes': '添',
  Other: '食',
}
