import { useState } from 'react'
import Logo from '../components/Logo.jsx'

// KURO NEKO signup page, addressable at /signup (reached from the login
// page's "Create an account" link, or loaded directly). Creates a client
// account that is saved on this device (localStorage, see data/users.js) —
// it is NOT signed in automatically: after success the user is sent back to
// the login page where they confirm their new credentials.
//
// `onSignup(name, username, password)` returns { success } or
// { success: false, message }. `onBackToLogin` leaves /signup for the
// login page (/).
export default function Signup({ onSignup, onBackToLogin }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Every field is required.
    if (!name.trim() || !username.trim() || !password) {
      setError('Please fill in every field.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    const result = onSignup(name, username.trim(), password)
    if (!result.success) {
      // Usually: the username is already taken.
      setError(result.message || 'Could not create your account.')
      return
    }
    // Success: App navigates back to the login page.
  }

  return (
    <div className="login-wrap">
      {/* Same moving background as the login page (decorative only). */}
      <div className="login-bg" aria-hidden="true">
        <span className="login-blob login-blob-1" />
        <span className="login-blob login-blob-2" />
        <span className="login-blob login-blob-3" />
      </div>

      <div className="login-card form-card">
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ margin: '0 auto 12px', width: 56 }}>
            <Logo size={56} />
          </div>
          <h1 style={{ fontSize: 22, fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
            KURO NEKO
          </h1>
          <div className="small" style={{ color: 'var(--muted)', letterSpacing: '0.3em', fontFamily: 'var(--font-display)', margin: '4px 0 8px' }}>
            黒猫
          </div>
          <p className="muted small">Create your account — saved on this device</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="signup-name">Display name</label>
            <input
              id="signup-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beany"
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. reynard"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              autoComplete="new-password"
            />
          </div>

          {error && <div className="banner error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block">
            Create account
          </button>
        </form>

        <div className="hint" style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--vermillion)',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
            }}
          >
            ← Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
