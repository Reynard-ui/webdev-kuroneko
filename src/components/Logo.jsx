// KURO NEKO brand mark: a vermillion hanko seal — a square stamp with a thin
// inner keyline, the kanji 黒 ("black"), and a tiny cat silhouette. Used in
// the navbar, login card, and footer. `size` is the logo's pixel size.
export default function Logo({ size = 42, className = '' }) {
  return (
    <span className={`brand-logo-seal ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none">
        {/* hanko body */}
        <rect x="4" y="4" width="40" height="40" rx="8" fill="var(--vermillion)" />
        <rect x="8.5" y="8.5" width="31" height="31" rx="4.5" stroke="rgba(245,238,225,0.55)" strokeWidth="1.4" />
        {/* kanji black */}
        <text
          x="24"
          y="21"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="var(--cream)"
          style={{ fontFamily: "'Noto Serif JP','Hiragino Mincho ProN',serif" }}
        >
          黒
        </text>
        {/* little cat silhouette */}
        <g fill="var(--cream)">
          {/* ears */}
          <path d="M15 30 l3.2 -4.4 l2.6 2.6 z" />
          <path d="M33 30 l-3.2 -4.4 l-2.6 2.6 z" />
          {/* head */}
          <circle cx="24" cy="32.5" r="5.2" />
        </g>
        <text
          x="24"
          y="40.5"
          textAnchor="middle"
          fontSize="4.6"
          fontWeight="700"
          letterSpacing="1.2"
          fill="rgba(245,238,225,0.9)"
          style={{ fontFamily: "'Noto Sans JP',sans-serif" }}
        >
          KURO NEKO
        </text>
      </svg>
    </span>
  )
}
