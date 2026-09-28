// Hardcoded user accounts (simulated authentication).
// Later this can be replaced by a real backend login (JWT/Firebase).
//
// Each user has an `id` so orders can reference a client by id.
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Kitchen Manager',
    role: 'administrator',
  },
  {
    id: 2,
    username: 'client',
    password: 'client123',
    name: 'Beany',
    role: 'client',
  },
]

// ----- Saved accounts (signups, localStorage) -----
// Accounts created on the /signup page are saved in localStorage so they
// stay available on this device across refreshes. The key holds a JSON
// array of { id, username, password, name, role }. All access is
// try/catch-guarded: if storage is blocked (private browsing, etc.) signups
// simply don't persist and the seed accounts above still work.
const STORED_USERS_KEY = 'kuro-neko-users'

export function loadStoredUsers() {
  try {
    const raw = localStorage.getItem(STORED_USERS_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveStoredUsers(list) {
  try {
    localStorage.setItem(STORED_USERS_KEY, JSON.stringify(list))
  } catch {
    // ignore — a blocked storage just means no persistence
  }
}

// True when the username is already taken by a seed or saved account.
export function isUsernameTaken(username) {
  const u = username.trim()
  return (
    users.some((x) => x.username === u) ||
    loadStoredUsers().some((x) => x.username === u)
  )
}

// Create a new client account, saved on this device.
// Returns { success, message } on failure, { success, user } on success.
export function signup(name, username, password) {
  const u = username.trim()
  if (isUsernameTaken(u)) {
    return { success: false, message: 'That username is already taken.' }
  }
  const stored = loadStoredUsers()
  // id = highest across seed + saved accounts, so order lookups by
  // clientId (App filters `myOrders` on user.id) never collide.
  const newId =
    Math.max(0, ...users.map((x) => x.id), ...stored.map((x) => x.id)) + 1
  const user = { id: newId, username: u, password, name: name.trim(), role: 'client' }
  stored.push(user)
  saveStoredUsers(stored)
  return { success: true, user }
}

// Login helper: find a user matching username + password. Seed accounts
// first, then accounts created via signup (localStorage). Returns the user
// object, or null when the credentials are wrong.
export function login(username, password) {
  const seed = users.find(
    (u) => u.username === username && u.password === password,
  )
  if (seed) return seed
  return (
    loadStoredUsers().find(
      (u) => u.username === username && u.password === password,
    ) || null
  )
}

export default users
