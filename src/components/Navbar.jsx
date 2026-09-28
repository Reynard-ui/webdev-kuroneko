import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'

// KURO NEKO top navigation. A rounded charcoal pill floating at the top of
// every view. Layout, one compact row: hanko brand mark (far left) · nav
// links (middle) · CTA + account (right). Links per role:
//   client -> Home / About / Contact / Menu / Branches + "Cart" CTA
//   admin  -> Dashboard / Orders / Menu grouped in the middle (no CTA)
//
// Active item: the label enlarges and a large cream circular seal badge
// (dashed vermillion ring) rises behind it, echoing the reference's medallion.
// Hover slides a thin vermillion line in from the left. The name pill on the
// right opens a small account menu (View profile / Log out); clicking outside
// closes it.
export default function Navbar({
  user,
  view,
  onNavigate,
  onLogout,
  cartCount,
  categories = null,
  activeCat = 'All',
  onBrowseMenu,
}) {
  const isAdmin = user.role === 'administrator'
  // Category mode: the client's standalone Menu page shows the menu
  // categories in the middle of the navbar (instead of the usual
  // Home/About/Contact/Menu/Branches links), so the user can browse a
  // category right from the bar. `categories` is only passed on that page.
  const inCatMode = !isAdmin && Array.isArray(categories) && categories.length > 0

  // ----- Scroll spy (client's single-page home only) -----
  // On home the page is one long scroll: hero -> active order -> popular ->
  // about -> contact. While the user scrolls, the active nav link should
  // FOLLOW the position: "home" near the top, "about" once the About section
  // reaches the reading line, "contact" once Contact does. It's tracked
  // locally in the navbar — we do NOT change the app's `view` state (that
  // would remount the page and jump the scroll position), so clicking links
  // still works exactly as before.
  const isHomeTrio =
    !isAdmin && (view === 'home' || view === 'about' || view === 'contact')
  const [spySection, setSpySection] = useState('home')

  useEffect(() => {
    if (!isHomeTrio) return
    // Seed with the section the user navigated to, so the badge is right
    // immediately even before the auto-scroll has moved the page.
    setSpySection(view === 'about' || view === 'contact' ? view : 'home')
    let ticking = false
    function compute() {
      ticking = false
      const about = document.getElementById('client-about')
      const contact = document.getElementById('client-contact')
      // Reading line: a section counts as "current" once its top has
      // crossed ~30% down the viewport (well below the pinned navbar).
      const line = Math.min(window.innerHeight * 0.3, 260)
      let active = 'home'
      if (about && about.getBoundingClientRect().top <= line) active = 'about'
      if (contact && contact.getBoundingClientRect().top <= line) active = 'contact'
      setSpySection(active)
    }
    function onSpyScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onSpyScroll, { passive: true })
    window.addEventListener('resize', onSpyScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onSpyScroll)
      window.removeEventListener('resize', onSpyScroll)
    }
  }, [isHomeTrio, view])

  // Nav links (the CTA + account live separately on the right).
  // Admin: logo far left, then Dashboard / Orders / Menu grouped in the
  // middle, profile on the right.
  // Client: logo near the left, then Home / About / Contact / Menu /
  // Branches spread evenly, then Cart + profile on the right.
  const links = inCatMode
    ? // Menu page: the middle of the bar is the category list. "All" first,
      // then every live category, chosen directly from the bar.
      [{ key: 'All', label: 'All' }, ...categories.map((c) => ({ key: c, label: c }))]
    : isAdmin
    ? [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'orders', label: 'Orders' },
        { key: 'menu', label: 'Menu' },
      ]
    : [
        { key: 'home', label: 'Home' },
        { key: 'about', label: 'About' },
        { key: 'contact', label: 'Contact' },
        { key: 'menu', label: 'Menu' },
        { key: 'branches', label: 'Branches' },
      ]

  // The red CTA pill is client-only (cart). Admins navigate via the
  // left-side Menu / Orders links instead, so there's no admin CTA.
  const cta = { label: 'Cart', key: 'cart' }

  // Account menu (dropdown under the name pill).
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const linksRef = useRef(null)

  // Auto-hide behavior: the navbar slides away when scrolling DOWN, and
  // slides back in when scrolling UP, when you reach the very top, or
  // when you simply STOP moving — so it always follows the user: gone
  // while scrolling down, back the moment they pause.
  const [navHidden, setNavHidden] = useState(false)
  // Start from the page's real scroll position — the window keeps its scroll
  // when we navigate between views, so 0 would make the first event a
  // bogus "big upward scroll".
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0)
  // "Stopped moving" timer: when the user pauses scrolling while the bar
  // is hidden, this fires and brings it back.
  const idleTimer = useRef(null)
  // While true, "hide on scroll down" is suspended: a Home/About/Contact
  // click fires the page's programmatic auto-scroll, during which the bar
  // must STAY visible. Cleared when that scroll settles (idle timer) or
  // the moment the user scrolls manually (wheel / touch / keys).
  const autoScrollRef = useRef(false)

  useEffect(() => {
    function onScroll() {
      // Every scroll event restarts the idle clock; if it expires without
      // a new event, the user has stopped moving, so show the bar again.
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        setNavHidden(false)
        // The auto-scroll from a Home/About/Contact click has settled by
        // now (no scroll events for 1.2s) — re-arm normal hide behavior.
        autoScrollRef.current = false
      }, 1200)
      const y = window.scrollY
      // Near the top of the page the navbar is always visible.
      if (y <= 40) {
        lastY.current = y
        setNavHidden(false)
        return
      }
      // Compare against the position from the PREVIOUS event (lastY is
      // updated only after the comparison) so even tiny slow-scroll deltas
      // register as real down/up movement.
      if (y > lastY.current) {
        // Scrolling down: hide it (and close the account menu with it) —
        // unless a Home/About/Contact auto-scroll is in flight, in which
        // case the bar must stay visible.
        if (!autoScrollRef.current) {
          setNavHidden(true)
          setMenuOpen(false)
        }
      } else if (y < lastY.current) {
        // Scrolling up: bring it back.
        setNavHidden(false)
      }
      lastY.current = y
    }
    // Capture phase: also catches scrolling in nested scrollable areas
    // (e.g. pages that scroll an inner container instead of the window).
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    // If the user takes over with manual input (wheel / touch / keys)
    // mid-way through a Home/About/Contact auto-scroll, drop the "stay
    // visible" guard so the normal hide-on-scroll-down resumes immediately.
    function onManualScroll() {
      autoScrollRef.current = false
    }
    window.addEventListener('wheel', onManualScroll, { passive: true })
    window.addEventListener('touchstart', onManualScroll, { passive: true })
    window.addEventListener('keydown', onManualScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('wheel', onManualScroll)
      window.removeEventListener('touchstart', onManualScroll)
      window.removeEventListener('keydown', onManualScroll)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [])

  // Entering home / about / contact (via a nav-link click, or the hero's
  // "Be in Touch" button) fires the page's auto-scroll to that section.
  // Arm the guard so "hide on scroll down" is suspended for the whole
  // animation, and surface the bar again if it was tucked away earlier.
  // Manual wheel / touch / key input during the scroll clears it.
  useEffect(() => {
    if (!isAdmin && ['home', 'about', 'contact'].includes(view)) {
      autoScrollRef.current = true
      setNavHidden(false)
    }
  }, [isAdmin, view])

  // Close the menu when clicking anywhere outside of it.
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Per-label seal sizing: set --active-d on every link to its own width so
  // the badge behind the active label stays a true CIRCLE — a short label
  // gets a small seal, a wide one (Dashboard/Branches) a bigger one, and
  // no oval ever. A ResizeObserver keeps the diameter in sync while the
  // active label's font-size transition runs and on mobile restack.
  useEffect(() => {
    const container = linksRef.current
    if (!container) return
    const links = Array.from(container.querySelectorAll('.nav-link'))
    function measure(el) {
      el.style.setProperty('--active-d', `${Math.max(el.clientWidth, 52)}px`)
    }
    const ro = new ResizeObserver((entries) => entries.forEach((e) => measure(e.target)))
    links.forEach((el) => {
      measure(el)
      ro.observe(el)
    })
    return () => ro.disconnect()
  }, [isAdmin, view, inCatMode, categories])

  // Pick a menu option, then close the menu.
  function pick(action) {
    setMenuOpen(false)
    if (action === 'orders' && !isAdmin) onNavigate('orders')
    if (action === 'profile') onNavigate('profile')
    if (action === 'logout') onLogout()
  }

  // The highlighted link. On the single-page home it's the scroll-spy
  // section; on the Menu page it's the selected category; everywhere else
  // it's the view itself.
  const activeKey = inCatMode ? activeCat : isHomeTrio ? spySection : view
  function renderLink(l) {
    const isActive = activeKey === l.key
    // Category links (Menu page) stay on the page and just switch the filter.
    // The "Menu" link on any other page opens the standalone Menu page on "All".
    // Everything else navigates between views as before. onBrowseMenu is only
    // passed by the main navbar; the order-form navbar falls back to onNavigate.
    let handleClick
    if (inCatMode) {
      handleClick = () => (onBrowseMenu ? onBrowseMenu(l.key) : onNavigate(l.key))
    } else if (!isAdmin && l.key === 'menu') {
      handleClick = () => (onBrowseMenu ? onBrowseMenu() : onNavigate('menu'))
    } else {
      handleClick = () => onNavigate(l.key)
    }
    return (
      <a
        key={l.key}
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={handleClick}
      >
        {l.label}
      </a>
    )
  }

  return (
    <nav className={`navbar ${isAdmin ? 'navbar-admin' : ''} ${navHidden ? 'navbar-hidden' : ''}`}>
      <div className="navbar-inner">
        {/* Far left: the hanko brand mark. Clicking it goes home / dashboard. */}
        <div
          className="nav-brand"
          onClick={() => onNavigate(isAdmin ? 'dashboard' : 'home')}
          title="KURO NEKO"
        >
          <Logo size={42} />
          <div className="brand-text">
            <div className="brand-name">KURO NEKO</div>
            <div className="brand-kanji">黒猫</div>
          </div>
        </div>

        {/* Middle: role-specific nav links — evenly spaced for clients,
            grouped in the centre for admins. */}
        <div className="nav-links" ref={linksRef}>
          {links.map(renderLink)}
        </div>

        {/* Right: CTA pill (clients only — cart) + account controls.
            Admins have no CTA: Menu/Orders live in the middle links. */}
        <div className="nav-right">
          {!isAdmin && (
            <button
              type="button"
              className="nav-checkout"
              title="Cart"
              aria-label="Cart"
              onClick={() => {
                onNavigate(cta.key)
              }}
            >
              {/* Cart symbol (line icon, inherits the pill's cream color). */}
              <svg
                className="nav-cart-icon"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1.6" />
                <circle cx="19" cy="21" r="1.6" />
                <path d="M1 1h3l2.7 13.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 6H5" />
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          )}

          <div className="nav-user" ref={menuRef}>
            {/* The name + chevron toggles the account menu. */}
            <button
              type="button"
              className={`role-pill ${menuOpen ? 'active' : ''}`}
              onClick={() => {
                setMenuOpen(!menuOpen)
              }}
              aria-expanded={menuOpen}
              title="Account menu"
            >
              {user.name}
              <span className={`pill-chev ${menuOpen ? 'up' : ''}`}>▾</span>
            </button>

            {/* Account dropdown. "My orders" appears for client accounts. */}
            {menuOpen && (
              <div className="account-menu">
                {!isAdmin && (
                  <button className="account-item" onClick={() => pick('orders')}>
                    🧾 My orders
                  </button>
                )}
                <button className="account-item" onClick={() => pick('profile')}>
                  👤 View profile
                </button>
                <button className="account-item" onClick={() => pick('logout')}>
                  ↪ Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
