import { useState } from 'react'
import { login } from '../data/users.js'
import Logo from '../components/Logo.jsx'

// Simulated login page. Checks credentials against the hardcoded user list.
// Handles: empty fields, wrong credentials, and successful login.
// Purely decorative moving background (aria-hidden): three drifting warm
// light blobs plus dishes that slowly rise off the bottom of the screen.
// No video and no assets — just CSS animations over inline data.
// `delay` is applied negatively so the risers are spread out on first paint.
const RISING = [
  { e: '🍚', left: '6%',  size: 26, dur: 26, delay: 0 },
  { e: '🍜', left: '15%', size: 38, dur: 32, delay: 4 },
  { e: '🥟', left: '26%', size: 30, dur: 24, delay: 9 },
  { e: '🍢', left: '37%', size: 34, dur: 30, delay: 2 },
  { e: '🍤', left: '47%', size: 28, dur: 27, delay: 13 },
  { e: '🍡', left: '57%', size: 32, dur: 33, delay: 6 },
  { e: '🍛', left: '68%', size: 40, dur: 29, delay: 1 },
  { e: '🍙', left: '79%', size: 28, dur: 25, delay: 11 },
  { e: '🍘', left: '89%', size: 34, dur: 31, delay: 8 },
]

export default function Login({ onLogin, onSignup }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validation: both fields are required.
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    // Check against the hardcoded users.
    const user = login(username.trim(), password)
    if (!user) {
      setError('Invalid username or password.')
      return
    }

    // Success: little chime, then hand the matched user up to App.
    onLogin(user)
  }

  return (
    <div className="login-wrap">
      {/* Moving background: drifting warm blobs + dishes/steam rising. */}
      <div className="login-bg" aria-hidden="true">
        <span className="login-blob login-blob-1" />
        <span className="login-blob login-blob-2" />
        <span className="login-blob login-blob-3" />
        {RISING.map((r) => (
          <span
            key={r.left}
            className="login-riser"
            style={{
              left: r.left,
              fontSize: r.size,
              animationDuration: `${r.dur}s`,
              animationDelay: `-${r.delay}s`,
            }}
          >
            {r.e}
          </span>
        ))}
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
          <p className="muted small">Sign in to order or manage the kitchen</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. client"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="banner error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
        </form>

        <div className="hint" style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            onClick={onSignup}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--vermillion)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
            }}
          >
            No account yet? Create one →
          </button>
        </div>
      </div>
    </div>
  )
}
