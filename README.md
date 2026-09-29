<<<<<<< HEAD
# KURO NEKO 黒猫

## Online Japanese Restaurant Ordering System

KURO NEKO is a web-based Japanese restaurant ordering system. Customers browse the
menu, build a cart, check out with delivery details, pay, and follow their order
through to a printable-style receipt. The kitchen side is an administrator
interface for managing menu items and monitoring customer orders.

Everything runs client-side: menu, orders, and accounts are seeded in JavaScript,
and user-created data (signups, sessions, display names) is stored in the browser's
`localStorage`. There is no backend server.

---

## Features

### Client

- Create a new account (saved on-device) and sign in / sign out
- Browse the full menu with dish photos, prices, and availability
- Filter dishes by category (sushi, ramen, sashimi, drinks, side dishes)
- Add dishes to the cart, update quantities, and remove items
- Choose delivery or pickup and fill in the order details
- Pay with a card / phone form (validated, demo only — no real payment)
- Receive a receipt confirmation for every placed order
- View order history and live order status
- Edit display name and manage the profile

### Administrator

- Sign in to the administrator account
- Open the admin dashboard with order overview
- View customer orders and update their status
  (received → preparing → out for delivery → delivered, etc.)
- Manage menu items: add new dishes, edit or remove existing ones,
  and toggle dish availability (sold out / available)

---

## User Roles

| Role | Description |
|---|---|
| Guest | Sees the landing page and can sign in or create an account. |
| Client | Browses the menu, manages the cart, places orders, and tracks order status. |
| Administrator | Manages menu items and monitors/updates customer orders. |

---

## Demo Accounts

The two seeded accounts below are hardcoded in `src/data/users.js`
(along with the demo menu and orders). New accounts created through the
signup page are stored per-device in `localStorage` and are not shared
between visitors.

| Role | Username | Password |
|---|---|---|
| Client | `client` | *(see `src/data/users.js`)* |
| Administrator | `admin` | *(see `src/data/users.js`)* |

> **Note:** the passwords are the `password` fields of the two seeded
> accounts in `src/data/users.js`. Both are for demonstration only and are
> visible to anyone who opens the site's source — change them before using
> the app in any real context.

---

## Technologies Used

| Technology | Version | Role |
|---|---|---|
| React | ^18.3 | UI components and state |
| Vite | ^5.4 | Dev server, bundling, build |
| React Router | ^7.18 | Addressable URLs (menu, profile, deep links) |
| JavaScript (ESM) | — | Application logic |
| HTML / CSS | — | Structure and the tri-color design system |
| Git & GitHub | — | Version control |
| GitHub Actions + GitHub Pages | — | Static site deployment |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Reynard-ui/webdev-kuroneko.git
cd webdev-kuroneko

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The dev server runs at `http://localhost:5173/webdev-kuroneko/`
(Vite serves the app under its configured base path).

### Build & Preview

```bash
npm run build    # produces a static bundle in dist/
npm run preview  # serves the production build locally
```

---

## Project Structure

```text
webdev-kuroneko/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions: build + deploy to Pages
├── public/
│   ├── 404.html             # Pages deep-link fallback (redirects to /)
│   ├── favicon.svg
│   └── dishes/              # Menu photos (served verbatim from the site base)
│       ├── salmon-nigiri.jpg
│       ├── ebi-temaki.jpg
│       ├── tonkotsu-ramen.jpg
│       ├── shoyu-ramen.jpg
│       ├── sashimi.jpg
│       ├── matcha-latte.jpg
│       ├── hojicha-latte.jpg
│       ├── gyoza.jpg
│       └── karaage.jpg
├── src/
│   ├── components/
│   │   ├── Cart.jsx         # Client cart (add/remove/quantity, order handoff)
│   │   ├── Cat.jsx          # Decorative cat mascot
│   │   ├── Confetti.jsx     # Receipt celebration effect
│   │   ├── FoodCard.jsx     # Single menu card
│   │   ├── FoodGrid.jsx     # Menu grid with category filtering
│   │   ├── FoodImage.jsx    # Dish photo / emoji plate with steam effect
│   │   ├── Logo.jsx         # KURO NEKO wordmark
│   │   ├── Navbar.jsx       # Role-aware navigation + cart access
│   │   ├── OrderStatus.jsx  # Order status seals and timeline
│   │   ├── OrderSummary.jsx # Itemized order breakdown
│   │   ├── Reveal.jsx       # Scroll-reveal animation wrapper
│   │   └── Seal.jsx         # Hanko-style status stamps
│   ├── data/
│   │   ├── brand.js         # Brand constants (name, tagline, palette)
│   │   ├── foods.js         # Seeded menu (single source of truth)
│   │   ├── orders.js        # Seeded orders + status definitions
│   │   └── users.js         # Seeded accounts + signup/session helpers
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Kitchen overview and order monitoring
│   │   ├── ClientDashboard.jsx  # Client landing: popular dishes + cart
│   │   ├── ClientMenuPage.jsx   # Full menu with category filtering
│   │   ├── Login.jsx            # Sign-in form
│   │   ├── MenuManagement.jsx   # Add / edit / remove dishes
│   │   ├── OrderForm.jsx        # Delivery details + order handoff to payment
│   │   ├── Payment.jsx          # Card / phone payment form (demo)
│   │   ├── Signup.jsx           # Account creation (localStorage)
│   │   └── Transaction.jsx      # Order receipt
│   ├── utils/
│   │   └── format.js      # IDR currency formatting helpers
│   ├── App.jsx            # Views, routing, auth, and shared state
│   ├── main.jsx           # Entry: React root + BrowserRouter (with basename)
│   └── index.css          # Global styles, tri-color design system
├── index.html             # HTML shell + <base href> for the Pages subfolder
├── package.json
├── vite.config.js         # Vite config (react plugin, Pages base path)
└── README.md
```

---

## Addressable URLs

React Router is used with a `basename` so every URL lives inside the
site's subfolder. The main routes:

| URL | View |
|---|---|
| `/` | Landing (client) / Admin dashboard (admin) / sign-in (guest) |
| `/menu`, `/menu/<category>` | Client menu, one addressable link per category |
| `/profile` | Profile (both roles) |
| `/signup` | Create an account |
| `/admin/orders` | Admin order monitoring |
| `/admin/menu` | Admin menu management |

Refreshing on any of these URLs works because GitHub Pages falls back to
`public/404.html` (which redirects to the app root) for unknown paths, and
the app re-derives its view from the URL.

---

## Data & Persistence

There is no database. Data sources:

| Source | Location | What it holds |
|---|---|---|
| Seeded data | `src/data/*` | Demo menu, demo orders, demo accounts |
| Signups | `localStorage` key `kuro-neko-users` | Accounts created on-device |
| Session | `localStorage` key `kuro-neko-session` | Currently signed-in username |
| Display names | `localStorage` key `kuro-neko-display-name:<username>` | Per-account chosen name |

Orders placed during a session live in React state; they are not written
to `localStorage`, so a refresh resets the order list to the seeded data.

---

## Deployment (GitHub Pages)

The site is deployed with **GitHub Actions** — Pages' "GitHub Actions"
source mode — via `.github/workflows/deploy.yml`, which runs on every push
to `main`:

1. `npm ci` + `npm run build` produces a static bundle in `dist/`
2. The bundle is uploaded as a Pages artifact and published to
   `https://Reynard-ui.github.io/webdev-kuroneko/`

Three settings keep the subfolder deployment working correctly:

- `vite.config.js` sets `base: '/webdev-kuroneko/'` so built asset paths
  are prefixed with the subfolder
- `index.html` carries `<base href="/webdev-kuroneko/">` so runtime
  relative paths (e.g. dish photos) resolve inside the subfolder
- `BrowserRouter` in `src/main.jsx` sets `basename="/webdev-kuroneko"` so
  router links and deep links never escape the subfolder

If the repo is ever renamed, the base path and basename must be updated to
match the new name.

---

## Design Notes

- Strict three-color system: charcoal `#26262b`, cream `#f5eee1`,
  vermillion `#c0392b`
- Kanji accents (黒猫, 寿, 支払) and hanko-style seals for Japanese
  restaurant identity
- Motion is restrained and respects the user's `prefers-reduced-motion`
  setting (reveals, confetti, and card animations all disable)

## Demo Notes

- KURO NEKO is designed as a front-end demonstration project, so payment and authentication are simulated.
- Data stored in localStorage is specific to the browser/device being used.
- Orders created during a session are temporary and will reset when the page is refreshed.
- The administrator interface is intended to demonstrate restaurant-side order and menu management.
=======
# KURO NEKO 黒猫

## Online Japanese Restaurant Ordering System

KURO NEKO is a web-based Japanese restaurant ordering system. Customers browse the
menu, build a cart, check out with delivery details, pay, and follow their order
through to a printable-style receipt. The kitchen side is an administrator
interface for managing menu items and monitoring customer orders.

Everything runs client-side: menu, orders, and accounts are seeded in JavaScript,
and user-created data (signups, sessions, display names) is stored in the browser's
`localStorage`. There is no backend server.

---

## Features

### Client

- Create a new account (saved on-device) and sign in / sign out
- Browse the full menu with dish photos, prices, and availability
- Filter dishes by category (sushi, ramen, sashimi, drinks, side dishes)
- Add dishes to the cart, update quantities, and remove items
- Choose delivery or pickup and fill in the order details
- Pay with a card / phone form (validated, demo only — no real payment)
- Receive a receipt confirmation for every placed order
- View order history and live order status
- Edit display name and manage the profile

### Administrator

- Sign in to the administrator account
- Open the admin dashboard with order overview
- View customer orders and update their status
  (received → preparing → out for delivery → delivered, etc.)
- Manage menu items: add new dishes, edit or remove existing ones,
  and toggle dish availability (sold out / available)

---

## User Roles

| Role | Description |
|---|---|
| Guest | Sees the landing page and can sign in or create an account. |
| Client | Browses the menu, manages the cart, places orders, and tracks order status. |
| Administrator | Manages menu items and monitors/updates customer orders. |

---

## Demo Accounts

The two seeded accounts below are hardcoded in `src/data/users.js`
(along with the demo menu and orders). New accounts created through the
signup page are stored per-device in `localStorage` and are not shared
between visitors.

| Role | Username | Password |
|---|---|---|
| Client | `client` | *(see `src/data/users.js`)* |
| Administrator | `admin` | *(see `src/data/users.js`)* |

> **Note:** the passwords are the `password` fields of the two seeded
> accounts in `src/data/users.js`. Both are for demonstration only and are
> visible to anyone who opens the site's source — change them before using
> the app in any real context.

---

## Technologies Used

| Technology | Version | Role |
|---|---|---|
| React | ^18.3 | UI components and state |
| Vite | ^5.4 | Dev server, bundling, build |
| React Router | ^7.18 | Addressable URLs (menu, profile, deep links) |
| JavaScript (ESM) | — | Application logic |
| HTML / CSS | — | Structure and the tri-color design system |
| Git & GitHub | — | Version control |
| GitHub Actions + GitHub Pages | — | Static site deployment |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Reynard-ui/webdev-kuroneko.git
cd webdev-kuroneko

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The dev server runs at `http://localhost:5173/webdev-kuroneko/`
(Vite serves the app under its configured base path).

### Build & Preview

```bash
npm run build    # produces a static bundle in dist/
npm run preview  # serves the production build locally
```

---

## Project Structure

```text
webdev-kuroneko/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions: build + deploy to Pages
├── public/
│   ├── 404.html             # Pages deep-link fallback (redirects to /)
│   ├── favicon.svg
│   └── dishes/              # Menu photos (served verbatim from the site base)
│       ├── salmon-nigiri.jpg
│       ├── ebi-temaki.jpg
│       ├── tonkotsu-ramen.jpg
│       ├── shoyu-ramen.jpg
│       ├── sashimi.jpg
│       ├── matcha-latte.jpg
│       ├── hojicha-latte.jpg
│       ├── gyoza.jpg
│       └── karaage.jpg
├── src/
│   ├── components/
│   │   ├── Cart.jsx         # Client cart (add/remove/quantity, order handoff)
│   │   ├── Cat.jsx          # Decorative cat mascot
│   │   ├── Confetti.jsx     # Receipt celebration effect
│   │   ├── FoodCard.jsx     # Single menu card
│   │   ├── FoodGrid.jsx     # Menu grid with category filtering
│   │   ├── FoodImage.jsx    # Dish photo / emoji plate with steam effect
│   │   ├── Logo.jsx         # KURO NEKO wordmark
│   │   ├── Navbar.jsx       # Role-aware navigation + cart access
│   │   ├── OrderStatus.jsx  # Order status seals and timeline
│   │   ├── OrderSummary.jsx # Itemized order breakdown
│   │   ├── Reveal.jsx       # Scroll-reveal animation wrapper
│   │   └── Seal.jsx         # Hanko-style status stamps
│   ├── data/
│   │   ├── brand.js         # Brand constants (name, tagline, palette)
│   │   ├── foods.js         # Seeded menu (single source of truth)
│   │   ├── orders.js        # Seeded orders + status definitions
│   │   └── users.js         # Seeded accounts + signup/session helpers
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Kitchen overview and order monitoring
│   │   ├── ClientDashboard.jsx  # Client landing: popular dishes + cart
│   │   ├── ClientMenuPage.jsx   # Full menu with category filtering
│   │   ├── Login.jsx            # Sign-in form
│   │   ├── MenuManagement.jsx   # Add / edit / remove dishes
│   │   ├── OrderForm.jsx        # Delivery details + order handoff to payment
│   │   ├── Payment.jsx          # Card / phone payment form (demo)
│   │   ├── Signup.jsx           # Account creation (localStorage)
│   │   └── Transaction.jsx      # Order receipt
│   ├── utils/
│   │   └── format.js      # IDR currency formatting helpers
│   ├── App.jsx            # Views, routing, auth, and shared state
│   ├── main.jsx           # Entry: React root + BrowserRouter (with basename)
│   └── index.css          # Global styles, tri-color design system
├── index.html             # HTML shell + <base href> for the Pages subfolder
├── package.json
├── vite.config.js         # Vite config (react plugin, Pages base path)
└── README.md
```

---

## Addressable URLs

React Router is used with a `basename` so every URL lives inside the
site's subfolder. The main routes:

| URL | View |
|---|---|
| `/` | Landing (client) / Admin dashboard (admin) / sign-in (guest) |
| `/menu`, `/menu/<category>` | Client menu, one addressable link per category |
| `/profile` | Profile (both roles) |
| `/signup` | Create an account |
| `/admin/orders` | Admin order monitoring |
| `/admin/menu` | Admin menu management |

Refreshing on any of these URLs works because GitHub Pages falls back to
`public/404.html` (which redirects to the app root) for unknown paths, and
the app re-derives its view from the URL.

---

## Data & Persistence

There is no database. Data sources:

| Source | Location | What it holds |
|---|---|---|
| Seeded data | `src/data/*` | Demo menu, demo orders, demo accounts |
| Signups | `localStorage` key `kuro-neko-users` | Accounts created on-device |
| Session | `localStorage` key `kuro-neko-session` | Currently signed-in username |
| Display names | `localStorage` key `kuro-neko-display-name:<username>` | Per-account chosen name |

Orders placed during a session live in React state; they are not written
to `localStorage`, so a refresh resets the order list to the seeded data.

---

## Deployment (GitHub Pages)

The site is deployed with **GitHub Actions** — Pages' "GitHub Actions"
source mode — via `.github/workflows/deploy.yml`, which runs on every push
to `main`:

1. `npm ci` + `npm run build` produces a static bundle in `dist/`
2. The bundle is uploaded as a Pages artifact and published to
   `https://Reynard-ui.github.io/webdev-kuroneko/`

Three settings keep the subfolder deployment working correctly:

- `vite.config.js` sets `base: '/webdev-kuroneko/'` so built asset paths
  are prefixed with the subfolder
- `index.html` carries `<base href="/webdev-kuroneko/">` so runtime
  relative paths (e.g. dish photos) resolve inside the subfolder
- `BrowserRouter` in `src/main.jsx` sets `basename="/webdev-kuroneko"` so
  router links and deep links never escape the subfolder

If the repo is ever renamed, the base path and basename must be updated to
match the new name.

---

## Design Notes

- Strict three-color system: charcoal `#26262b`, cream `#f5eee1`,
  vermillion `#c0392b`
- Kanji accents (黒猫, 寿, 支払) and hanko-style seals for Japanese
  restaurant identity
- Motion is restrained and respects the user's `prefers-reduced-motion`
  setting (reveals, confetti, and card animations all disable)
>>>>>>> f8a0507 (Commit by Yudhistira)
