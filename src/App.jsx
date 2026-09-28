import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import OrderForm from './pages/OrderForm.jsx'
import Transaction from './pages/Transaction.jsx'
import Payment from './pages/Payment.jsx'
import MenuManagement from './pages/MenuManagement.jsx'
import ClientMenuPage from './pages/ClientMenuPage.jsx'
import Logo from './components/Logo.jsx'
import Cat from './components/Cat.jsx'
import seedFoods from './data/foods.js'
import seedOrders from './data/orders.js'
import seedUsers, { signup, loadStoredUsers } from './data/users.js'

// Default view each role lands on after login.
const DEFAULT_VIEW = { administrator: 'dashboard', client: 'home' }

// ----- Display-name persistence (localStorage) -----
// The accounts are hardcoded; only the *display* name a user picked is
// remembered. The key is per-username so admin and client don't collide.
// All access is wrapped in try/catch: if storage is unavailable (private
// browsing, blocked storage) the app just works without persistence.
const NAME_STORAGE_KEY = 'kuro-neko-display-name:'

function readStoredName(username) {
  try {
    return localStorage.getItem(NAME_STORAGE_KEY + username) || ''
  } catch {
    return ''
  }
}

// ----- Session persistence (localStorage) -----
// Remembers which account is signed in, so a refresh / reopening the page
// keeps you logged in instead of bouncing back to the login screen.
// We store only the username and re-derive the user object from users.js,
// so the saved data stays small and always consistent with the accounts.
const SESSION_STORAGE_KEY = 'kuro-neko-session'

function storeSession(username) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, username)
  } catch {
    // ignore — a blocked storage just means no persistence
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

// Rebuild the logged-in user (including any stored display name) from the
// saved session. Returns null when there is no session or storage is blocked.
function restoreSession() {
  try {
    const username = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!username) return null
    // Seed accounts first, then accounts created via signup (localStorage).
    const seedUser =
      seedUsers.find((u) => u.username === username) ||
      loadStoredUsers().find((u) => u.username === username)
    if (!seedUser) return null
    const stored = readStoredName(username)
    return stored ? { ...seedUser, name: stored } : seedUser
  } catch {
    return null
  }
}

// ---------- App state ----------
// This is the single place where the app's live state lives:
//  - user       : the logged-in user (null = on the login screen)
//  - view       : which page is showing (role-dependent)
//  - cart       : the client's current cart ({ [foodId]: { food, qty } })
//  - orders     : the live list of orders (seed data + newly placed ones)
//  - foods      : the live menu (seed data + admin's add/remove changes)
//
// The cart and orders are ordinary React state. Later, orders could be
// fetched/saved to a backend; the UI code would stay almost the same.

// Addressable menu categories: each menu category is a real link at
// /menu/<slug>. The slug is the category name lowercased with runs of
// non-alphanumerics collapsed to a single dash ("Side Dishes" ->
// "side-dishes", "All" -> "all").
function catSlug(cat) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Addressable client deep links: these views live at their own URL so the
// browser address bar (and back/forward) track them. The client's `menu` is
// handled separately by browseMenu — it owns the whole /menu/<slug> family.
// `profile` is shared by both roles.
const DEEP_LINKS = { profile: '/profile', branches: '/branches', cart: '/cart' }

// Addressable admin deep links: the kitchen's views get their own URLs too,
// namespaced under /admin/ so they never collide with the client's /menu.
// `dashboard` is the admin's landing view and lives at the root '/';
// `profile` is shared with the client at /profile.
const ADMIN_DEEP_LINKS = { profile: '/profile', orders: '/admin/orders', menu: '/admin/menu' }

// Map a view to its addressable URL for a given role. Any view without a deep
// link (home/about/contact/orders on the client, dashboard on the admin)
// resolves to the root '/'.
function deepLinkFor(user, view) {
  if (user?.role === 'administrator') return ADMIN_DEEP_LINKS[view] || '/'
  return DEEP_LINKS[view] || '/'
}

export default function App() {
  // Router hooks live at the top so the initial view can be seeded from the
  // URL: a direct load of /menu opens the Menu page with no home-page flash.
  const navigate = useNavigate()
  const location = useLocation()
  const lastNavigated = useRef(null) // pathname of a navigation WE initiated
  const prevPath = useRef(null) // previous pathname, to detect real changes

  // Restore the logged-in account (if any) so a refresh keeps you signed in.
  const [user, setUser] = useState(() => restoreSession())
  const [view, setView] = useState(() => {
    const u = restoreSession()
    if (!u) {
      // Not logged in: /signup opens the signup page directly, anything
      // else opens the login page.
      return location.pathname === '/signup' ? 'signup' : 'home'
    }
    // Deep-link loads start on the matching page so a refresh of /profile or
    // /menu doesn't flash the home page first. The admin's /menu is still the
    // menu-management view (no URL); the root URL starts on the role's default.
    if (location.pathname === '/profile') return 'profile'
    if (u.role !== 'administrator') {
      if (/^\/menu(\/[a-z0-9-]+)?$/.test(location.pathname)) return 'menu'
      // /branches and /cart are client deep links — land on the matching view.
      const clientLink = Object.keys(DEEP_LINKS).find((k) => DEEP_LINKS[k] === location.pathname)
      if (clientLink) return clientLink
    } else {
      // /admin/orders and /admin/menu are admin deep links — land on that view.
      const adminLink = Object.keys(ADMIN_DEEP_LINKS).find((k) => ADMIN_DEEP_LINKS[k] === location.pathname)
      if (adminLink) return adminLink
    }
    return DEFAULT_VIEW[u.role] || 'home'
  })
  const [cart, setCart] = useState({})
  const [orders, setOrders] = useState(seedOrders)
  // The order the client just placed; drives the transaction/receipt page.
  // Set by handlePlaceOrder, cleared when the user navigates away.
  const [lastOrder, setLastOrder] = useState(null)
  // The order awaiting payment on the "payment" page. Filled by
  // handlePlaceOrder, cleared once payment is confirmed (handleConfirmPayment).
  const [pendingOrder, setPendingOrder] = useState(null)
  // The menu is live state (seeded from data/foods.js), so the admin's
  // add/remove changes show up for everyone immediately.
  const [foods, setFoods] = useState(seedFoods)
  // The menu categories, derived from the LIVE menu so a new category the
  // kitchen adds shows up in the Menu page's navbar automatically. Memoized
  // on `foods` so the `categories` prop the Navbar receives keeps a stable
  // reference (it's in the Navbar's effect deps) and doesn't churn on cart
  // updates.
  const menuCategories = useMemo(() => [...new Set(foods.map((f) => f.category))], [foods])

  // The active category on the standalone Menu page is read straight off the
  // URL (/menu/all, /menu/sushi, ...), so every category is its own addressable
  // link and browser back/forward steps between them. 'All' for a bare /menu or
  // no /menu segment. (Lifted out of ClientDashboard because the Menu page's
  // navbar shows the categories as links — the selection lives in App, shared
  // by the Navbar + the page.)
  const menuCat = useMemo(() => {
    const m = location.pathname.match(/^\/menu\/([a-z0-9-]+)$/)
    if (!m) return 'All'
    return menuCategories.find((c) => catSlug(c) === m[1]) || 'All'
  }, [location.pathname, menuCategories])

  // ----- Auth -----
  // On login, restore any display name the user saved before (per username)
  // and remember the session so the next refresh keeps this user signed in.
  function handleLogin(u) {
    const stored = readStoredName(u.username)
    setUser(stored ? { ...u, name: stored } : u)
    setView(DEFAULT_VIEW[u.role] || 'home')
    storeSession(u.username)
  }

  // ----- Signup -----
  // Create a client account (saved on this device via localStorage in
  // data/users.js), then go back to the login page — the account is not
  // signed in automatically, the user confirms their credentials there.
  function handleSignup(name, username, password) {
    const result = signup(name, username, password)
    if (result.success) {
      lastNavigated.current = '/'
      navigate('/')
      setView('home') // logged-out 'home' = the login page
    }
    return result
  }

  function handleLogout() {
    if (user) clearSession() // forget the session so a refresh shows login
    // Back to the root URL too, so leaving from /menu doesn't leave the
    // login screen stranded on that link.
    lastNavigated.current = '/'
    navigate('/')
    setUser(null)
    setCart({}) // clear the cart for the next visitor
    setLastOrder(null) // clear any receipt from the previous visitor
    setPendingOrder(null) // clear any in-progress payment from the previous visitor
    setView('home')
  }

  // Open the signup page (from the login page's "Create an account" link).
  // /signup is a real URL, so it can also be loaded directly or typed.
  function handleOpenSignup() {
    lastNavigated.current = '/signup'
    navigate('/signup')
    setView('signup')
  }

  // ----- Navigation -----
  // Real addressable links: the client's Menu page lives at /menu, the
  // profile page (both roles) at /profile; everything else lives at /.
  // Our own navigations tag lastNavigated so the mirror effect below only
  // reacts to browser-caused URL changes (back/forward, typed/direct loads).
  function handleNavigate(nextView) {
    // The client's "menu" means the /menu URL; the admin's 'menu' is the
    // menu-management view, which stays on the root URL.
    if (nextView === 'menu' && user?.role !== 'administrator') {
      browseMenu()
      return
    }
    // Keep the address bar in sync with the view. Every view maps to a URL:
    // client profile/branches/cart to their deep links, admin orders/menu to
    // /admin/..., and everything else to the root '/'. (The client's 'menu'
    // was already diverted to browseMenu above, which owns the /menu/<slug>
    // family.) A same-URL click is a no-op; a different one pushes directly,
    // so back/forward steps link to link with no '/' in between.
    const target = deepLinkFor(user, nextView)
    if (location.pathname !== target) {
      lastNavigated.current = target
      navigate(target)
    }
    setView(nextView)
  }

  // Go to the client Menu page, optionally opening on a specific category.
  // Each category is a real link — /menu/all, /menu/sushi, /menu/side-dishes,
  // etc. — so the URL (not local state) decides what the page shows. The home
  // "See <category>" buttons pass the category; "Order Now" and the navbar's
  // "Menu" link pass nothing (opens on All). Switching category while already
  // on the page pushes the new /menu/<slug> link, so the back button steps
  // through the categories too.
  function browseMenu(cat) {
    const url = `/menu/${cat ? catSlug(cat) : 'all'}`
    if (location.pathname === url) return
    lastNavigated.current = url
    navigate(url)
    if (view !== 'menu') setView('menu')
  }

  // Browser-driven URL changes (back/forward buttons, typing /menu or
  // /profile, a direct load) are mirrored back into the view. Navigations we
  // initiated ourselves are tagged in lastNavigated and skipped; a pathname
  // that hasn't actually changed (the first run, or a re-render) is ignored
  // via prevPath.
  useEffect(() => {
    const prev = prevPath.current
    prevPath.current = location.pathname
    if (lastNavigated.current === location.pathname) {
      lastNavigated.current = null
      return
    }
    if (prev === location.pathname) return
    // /signup is the signed-up account's own URL: it only means anything
    // while logged out (direct load, typing it in, back/forward). While
    // signed in, /signup falls through to the role's default view below.
    if (!user) {
      setView(location.pathname === '/signup' ? 'signup' : 'home')
      return
    }
    // /menu and the /menu/<slug> category family are the client's Menu page.
    if (location.pathname === '/menu' || /^\/menu\/[a-z0-9-]+$/.test(location.pathname)) setView('menu')
    else if (location.pathname === '/profile') setView('profile')
    else {
      // /branches and /cart are client deep links; /admin/orders and
      // /admin/menu are admin deep links — mirror whichever matches the role.
      const isAdmin = user.role === 'administrator'
      const map = isAdmin ? ADMIN_DEEP_LINKS : DEEP_LINKS
      const link = Object.keys(map).find((k) => map[k] === location.pathname && k !== 'profile')
      if (link) setView(link)
      else setView(DEFAULT_VIEW[user.role] || 'home')
    }
  }, [location.pathname, user])

  // Admin side only: every admin page starts from the top. The window keeps
  // its scroll position when the view remounts, so dashboard -> orders -> menu
  // would otherwise carry you into the new page partway down. ('instant'
  // overrides the page's global smooth scroll-behavior.) Client pages manage
  // their own scroll, so they keep their existing behavior.
  useEffect(() => {
    if (user?.role !== 'administrator') return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view, user?.role])

  // Defensive guard: the receipt view only makes sense while `lastOrder`
  // holds an order. If the view is the receipt but the order is gone (a
  // refresh dropped the in-memory state, or we just logged in fresh),
  // route the client back to their home view. Runs in an effect, never
  // during render, so it can't fight the URL-mirror effect above.
  useEffect(() => {
    if (view === 'transaction' && !lastOrder && user) {
      handleNavigate(DEFAULT_VIEW[user.role] || 'home')
    }
  }, [view, lastOrder, user])

  // Same guard for the payment page: view 'payment' with no pending order
  // (e.g. a refresh that dropped the in-memory state) routes the client back
  // to their home view.
  useEffect(() => {
    if (view === 'payment' && !pendingOrder && user) {
      handleNavigate(DEFAULT_VIEW[user.role] || 'home')
    }
  }, [view, pendingOrder, user])

  // ----- Profile -----
  // Update the logged-in user's display name (client or admin) and remember
  // it in localStorage so it survives logout / browser restarts. Setting the
  // name back to the account's default clears the stored entry.
  function handleUpdateName(newName) {
    if (user) {
      const seedUser = seedUsers.find((u) => u.username === user.username)
      const isDefault = seedUser ? newName === seedUser.name : false
      try {
        if (isDefault) {
          localStorage.removeItem(NAME_STORAGE_KEY + user.username)
        } else {
          localStorage.setItem(NAME_STORAGE_KEY + user.username, newName)
        }
      } catch {
        // ignore storage errors
      }
    }
    setUser((u) => ({ ...u, name: newName }))
  }

  // ----- Cart -----
  // Cart stores { foodId: { food, qty } }. The handlers below keep it in sync.
  function addToCart(food) {
    setCart((c) => {
      const qty = c[food.id] ? c[food.id].qty + 1 : 1
      return { ...c, [food.id]: { food, qty } }
    })
  }

  function increment(foodId) {
    setCart((c) => ({ ...c, [foodId]: { ...c[foodId], qty: c[foodId].qty + 1 } }))
  }

  function decrement(foodId) {
    setCart((c) => {
      const next = { ...c }
      if (next[foodId].qty <= 1) {
        // Removing the last one drops the entry.
        delete next[foodId]
      } else {
        next[foodId] = { ...next[foodId], qty: next[foodId].qty - 1 }
      }
      return next
    })
  }

  function removeItem(foodId) {
    setCart((c) => {
      const next = { ...c }
      delete next[foodId]
      return next
    })
  }

  // Derived values used across the UI.
  const cartEntries = Object.values(cart)
  const cartCount = cartEntries.reduce((sum, { qty }) => sum + qty, 0)
  const subtotal = cartEntries.reduce((sum, { food, qty }) => sum + food.price * qty, 0)
  function getQty(foodId) {
    return cart[foodId] ? cart[foodId].qty : 0
  }

  // ----- Menu management (admin only) -----
  // Add a new dish to the live menu.
  function handleAddFood(newFood) {
    setFoods((list) => [...list, newFood])
  }

  // Remove a dish from the menu. Also drop it from any open carts so the
  // client can't order something that no longer exists.
  function handleRemoveFood(foodId) {
    setFoods((list) => list.filter((f) => f.id !== foodId))
    setCart((c) => {
      if (!c[foodId]) return c
      const next = { ...c }
      delete next[foodId]
      return next
    })
  }

  // Update an existing dish (admin). Open carts also get the updated copy,
  // so totals use the latest name/price.
  function handleUpdateFood(updatedFood) {
    setFoods((list) => list.map((f) => (f.id === updatedFood.id ? updatedFood : f)))
    setCart((c) => {
      if (!c[updatedFood.id]) return c
      const next = { ...c }
      next[updatedFood.id] = { ...next[updatedFood.id], food: updatedFood }
      return next
    })
  }

  // ----- Orders -----
  // This client's orders (the seed orders belong to clientId 2).
  const myOrders = orders.filter((o) => o.clientId === user?.id)

  // Admin updates an order's status; the client sees it immediately.
  function handleStatusChange(orderId, status) {
    setOrders((list) =>
      list.map((o) => (o.id === orderId ? { ...o, status } : o)),
    )
  }

  // Client reviews their order on the order-form page: keep it as
  // `pendingOrder` and open the payment page. The order only joins the shared
  // list once payment is confirmed (handleConfirmPayment).
  function handlePlaceOrder(newOrder) {
    setPendingOrder(newOrder)
    setView('payment')
  }

  // Payment confirmed on the "payment" page: add the order to the list, clear
  // the cart, remember it as `lastOrder`, and route to the receipt page.
  function handleConfirmPayment() {
    const confirmed = pendingOrder
    setOrders((list) => [confirmed, ...list]) // newest first
    setCart({}) // clear the cart
    setLastOrder(confirmed)
    setPendingOrder(null)
    setView('transaction')
  }

  // From the "Place order" confirmation, go somewhere in the client UI.
  // Routed through handleNavigate so a "menu" target pushes the /menu URL.
  function handleCancelFromOrder(targetView) {
    handleNavigate(targetView)
  }

  // Next available order number = highest existing id + 1.
  // Simple, explainable, and keeps ids unique even after several orders.
  const nextOrderId = Math.max(1000, ...orders.map((o) => o.id)) + 1

  // Leaving the transaction page (its "View my orders" / "Order more" buttons):
  // forget the receipt and route to the requested view.
  function handleLeaveTransaction(targetView) {
    setLastOrder(null)
    handleNavigate(targetView)
  }

  // ----- Render -----
  // Not logged in yet? The signup page sits at /signup; the login page is
  // the logged-out default (view 'home' means "logged out -> login").
  if (!user) {
    return view === 'signup' ? (
      <Signup onSignup={handleSignup} onBackToLogin={() => {
        lastNavigated.current = '/'
        navigate('/')
        setView('home')
      }} />
    ) : (
      <Login onLogin={handleLogin} onSignup={handleOpenSignup} />
    )
  }

  // The order-form page (client only, reached from the cart).
  if (view === 'order-form') {
    return (
      <>
        <Navbar
          user={user}
          view={view}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          cartCount={cartCount}
        />
        <OrderForm
          cart={cart}
          subtotal={subtotal}
          user={user}
          nextOrderId={nextOrderId}
          onCancel={handleCancelFromOrder}
          onPlaceOrder={handlePlaceOrder}
        />
      </>
    )
  }

  // The payment page (client only), between the order form and the receipt.
  // The customer fills in their phone + card; confirming finalizes the
  // pending order. `pendingOrder` is always set together with view 'payment',
  // so no guard is needed here.
  if (view === 'payment' && pendingOrder) {
    return (
      <>
        <Navbar
          user={user}
          view={view}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          cartCount={cartCount}
        />
        <Payment order={pendingOrder} onConfirm={handleConfirmPayment} />
      </>
    )
  }

  // The transaction / receipt page (client only), shown right after an order
  // is placed. It renders the just-confirmed order from `lastOrder`. A
  // guard effect below corrects the (defensive) case where the view is the
  // receipt but the order is gone — e.g. a refresh that dropped it.
  if (view === 'transaction' && lastOrder) {
    return (
      <>
        <Navbar
          user={user}
          view={view}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          cartCount={cartCount}
        />
        <Transaction order={lastOrder} onNavigateView={handleLeaveTransaction} />
      </>
    )
  }

  // Choose the right view for this role, sharing the same navbar.
  const isAdmin = user.role === 'administrator'

  let content
  if (isAdmin) {
    // The admin's "Menu" tab is the menu-management page; the other
    // tabs (Dashboard, Orders) live in AdminDashboard.
    content =
      view === 'menu' ? (
        <MenuManagement
          foods={foods}
          onAddFood={handleAddFood}
          onRemoveFood={handleRemoveFood}
          onEditFood={handleUpdateFood}
        />
      ) : (
        <AdminDashboard
          view={view}
          user={user}
          orders={orders}
          onStatusChange={handleStatusChange}
          onLogout={handleLogout}
          onUpdateName={handleUpdateName}
        />
      )
  } else {
    // The client's Menu page is a standalone view (menu-page) — just the item
    // boxes, with the menu categories shown in the navbar instead of the usual
    // Home/About/Contact/Menu/Branches links. Every other client view lives in
    // ClientDashboard.
    content =
      view === 'menu' ? (
        <ClientMenuPage
          foods={foods}
          activeCat={menuCat}
          onAddToCart={addToCart}
          getQty={getQty}
        />
      ) : (
        <ClientDashboard
        view={view}
        user={user}
        foods={foods}
        cart={cart}
        subtotal={subtotal}
        onInc={increment}
        onDec={decrement}
        onRemove={removeItem}
        onAddToCart={addToCart}
        getQty={getQty}
        onGoToOrder={() => handleNavigate('order-form')}
        onBrowseMenu={() => browseMenu()}
        onBrowseCategory={(cat) => browseMenu(cat)}
        onNavigateView={handleNavigate}
        myOrders={myOrders}
        onLogout={handleLogout}
        onUpdateName={handleUpdateName}
      />
      )
  }

  return (
    <>
      <Navbar
        user={user}
        view={view}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        cartCount={cartCount}
        categories={view === 'menu' && !isAdmin ? menuCategories : null}
        activeCat={menuCat}
        onBrowseMenu={browseMenu}
      />
      {/* The key remounts the view on change, playing a soft fade + rise
          transition (like the motion patterns in the referenced sites). */}
      <div className="view-transition" key={`${user.role}-${view}`}>
        {content}
      </div>
      <footer className="footer">
        <div className="footer-grid">
          {/* Left: brand mark + short blurb */}
          <div>
            <div className="footer-brand">
              <Logo size={40} />
              KURO NEKO
            </div>
            <p className="footer-blurb">
              Vintage recipes, a watchful black cat. Fresh sushi, ramen, and
              sashimi made to order across Jakarta.
            </p>
          </div>

          {/* Center: circular decorative illustration (Kuro at night) */}
          <div className="footer-circle" aria-hidden="true">
            <Cat size={72} />
            <span
              className="seal seal-red"
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                bottom: -8,
                right: -8,
                background: 'rgba(192,57,43,0.9)',
              }}
            >
              <span className="seal-ring" style={{ borderColor: 'rgba(245,238,225,0.5)', position: 'relative', width: '100%', height: '100%' }} />
              <span className="seal-char" style={{ fontSize: 15, color: 'var(--cream)' }}>黒</span>
            </span>
          </div>

          {/* Right: newsletter (existing logic kept, restyled) */}
          <div className="footer-newsletter">
            <div className="newsletter-title">Subscribe to Newsletter</div>
            <NewsletterForm />
          </div>
        </div>
        <div className="footer-note">
          黒猫 · KURO NEKO — SUSHI · RAMEN · SASHIMI · © {new Date().getFullYear()}
        </div>
      </footer>
    </>
  )
}

// Small local newsletter form: frontend-only, shows a confirmation on submit
// (no backend yet). Kept isolated so the footer stays declarative.
function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  function submit(e) {
    e.preventDefault()
    if (email.trim()) setSent(true)
  }
  return sent ? (
    <div className="newsletter-row">
      <span style={{ fontSize: 13, color: 'var(--offwhite)' }}>Kuro adds you to the list 🐾</span>
    </div>
  ) : (
    <form className="newsletter-row" onSubmit={submit}>
      <input
        className="newsletter-input"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address for newsletter"
      />
      <button type="submit" className="newsletter-send" aria-label="Subscribe">→</button>
    </form>
  )
}
