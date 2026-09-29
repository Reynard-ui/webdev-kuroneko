// KURO NEKO brand content: story copy, branch locations, the features strip,
// and specialty blurbs. Frontend-only demo data — later this could come
// from a CMS or backend. Kept in data/ so the UI sections stay data-bound.

// The restaurant story, shown in "The Story of Kuro Neko" (customer home).

// "Find the cat" / branches: restyled location cards. Purely data-driven.
export const BRANCHES = [
  {
    id: 1,
    name: 'Kuro Neko — Sudirman',
    kanji: '店',
    address: 'Jl. Jend. Sudirman No. 42, Jakarta',
    hours: '11:00 — 22:00 daily',
    note: 'The flagship counter. Kuro usually naps near the sushi case.',
  },
  {
    id: 2,
    name: 'Kuro Neko — Kemang',
    kanji: '猫',
    address: 'Jl. Kemang Selatan III/12, Jakarta',
    hours: '10:00 — 21:00 daily',
    note: 'A small izakaya-style room. Kuro patrols the ramen counter.',
  },
  {
    id: 3,
    name: 'Kuro Neko — Online',
    kanji: '月',
    address: 'Delivering across Greater Jakarta',
    hours: 'Order 10:00 — 21:00',
    note: 'Kuro approves every delivery personally. (Mostly.)',
  },
]

// Features strip: 4 icon+label pairs, each a small circular seal mark.
export const FEATURES = [
  { kanji: '鮮', label: 'Fresh Daily' },
  { kanji: '速', label: 'Fast Prep' },
  { kanji: '証', label: 'Guarantee' },
  { kanji: '極', label: 'Best Quality' },
]

// Specialty blurbs keyed by existing food category, for the editorial
// "Our Specialties" section. Each specialty shows the first dish of that
// category from the live menu (existing data — nothing hardcoded to the UI).
export const SPECIALTIES = {
  Sushi: {
    eyebrow: '鮨',
    title: 'Sushi, cut to order',
    copy: 'Eight pieces of hand-pressed nigiri on seasoned rice, finished with a single cut of wasabi. No shortcuts, no pre-rolled trays — only what the fish of the day allows.',
  },
  Ramen: {
    eyebrow: '麺',
    title: 'Ramen broth, nine hours',
    copy: 'Pork bones simmered until the broth turns to silk. Slurp loud — the kitchen likes it when the soup is taken seriously.',
  },
  Sashimi: {
    eyebrow: '刺',
    title: 'Sashimi of the moment',
    copy: 'A platter that changes with the morning catch, sliced thin, dressed with daikon and shiso, and served on cold stone.',
  },
}

// Contact panel copy (customer "Be in Touch" section).
export const CONTACT = {
  eyebrow: '連絡',
  title: 'Contact us',
  blurb: 'Reservations, events, or questions — write to us and the kitchen will answer.',
  verticalKanji: '連絡先',
}

export default {}
