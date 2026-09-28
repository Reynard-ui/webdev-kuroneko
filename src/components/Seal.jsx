// A reusable circular Japanese hanko seal (retro-print look): a vermillion
// ring with a kanji/char in the center. Used for decorative stamps, category
// markers, and status badges. Purely presentational.
export default function Seal({ char = '印', size = 44, className = '', tone = 'red' }) {
  const tones = {
    red: { ring: 'var(--vermillion)', fill: 'rgba(192,57,43,0.10)', text: 'var(--vermillion)' },
    ink: { ring: 'var(--ink)', fill: 'rgba(245,238,225,0.06)', text: 'var(--ink)' },
  }
  const t = tones[tone] || tones.red
  return (
    <span
      className={`seal seal-${tone} ${className}`.trim()}
      style={{
        width: size,
        height: size,
        background: t.fill,
        color: t.text,
      }}
      aria-hidden="true"
    >
      <span className="seal-ring" style={{ borderColor: t.ring }} />
      <span className="seal-char">{char}</span>
    </span>
  )
}
