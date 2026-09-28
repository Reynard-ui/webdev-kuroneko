// Kuro, the black cat mascot. Two renders:
//   default (filled)  -> small solid brand mark used in the hero / story
//   line={true}       -> line-art (stroke-only) mark, for empty states and
//                        easter-egg moments, used sparingly
// `size` is the rendered width in px. No image assets — pure inline SVG.
export default function Cat({ size = 80, className = '', tail = true, line = false }) {
  // Filled: charcoal body + cream face. Line: thin ink strokes only.
  const body = line ? 'none' : '#26262b'
  const stroke = line ? '#26262b' : 'none'
  const sw = line ? 2.4 : 0
  const faceColor = line ? '#c0392b' : '#f5eee1'
  const faceFill = line ? 'none' : faceColor
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`cat ${className}`.trim()}
      aria-hidden="true"
    >
      {/* tail (optional) */}
      {tail && (
        <path
          d="M78 62c10-2 14-14 6-22-4-4-4-9-2-13"
          fill={line ? 'none' : '#26262b'}
          stroke={line ? '#26262b' : 'none'}
          strokeWidth={line ? 2.4 : 7}
          strokeLinecap="round"
        />
      )}
      {/* body */}
      <ellipse cx="50" cy="62" rx="30" ry="26" fill={body} stroke={stroke} strokeWidth={sw} />
      {/* head */}
      <circle cx="50" cy="34" r="22" fill={body} stroke={stroke} strokeWidth={sw} />
      {/* ears */}
      <path d="M32 20 L30 2 L45 15 Z" fill={body} stroke={stroke} strokeWidth={sw} />
      <path d="M68 20 L70 2 L55 15 Z" fill={body} stroke={stroke} strokeWidth={sw} />
      {!line && (
        <>
          <path d="M35 15 L34 8 L42 14 Z" fill="rgba(245, 238, 225, 0.32)" />
          <path d="M65 15 L66 8 L58 14 Z" fill="rgba(245, 238, 225, 0.32)" />
        </>
      )}
      {/* face */}
      <circle cx="41" cy="32" r="4.5" fill={faceFill} stroke={line ? faceColor : 'none'} strokeWidth={line ? 1.6 : 0} />
      <circle cx="59" cy="32" r="4.5" fill={faceFill} stroke={line ? faceColor : 'none'} strokeWidth={line ? 1.6 : 0} />
      {line ? (
        <g stroke="#26262b" strokeWidth="1.6" fill="none">
          <path d="M47 40 Q50 43 53 40" strokeLinecap="round" />
          <path d="M50 42 L50 46 M46 47 Q50 44 54 47" strokeLinecap="round" />
        </g>
      ) : (
        <>
          <circle cx="41" cy="32" r="2.2" fill="#26262b" />
          <circle cx="59" cy="32" r="2.2" fill="#26262b" />
          <path d="M47 40 Q50 43 53 40" stroke="#f5eee1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M50 42 L50 46 M46 47 Q50 44 54 47" stroke="#f5eee1" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* whiskers */}
      <g
        stroke={line ? '#26262b' : '#f5eee1'}
        strokeWidth={line ? 1.2 : 1}
        opacity={line ? 0.9 : 0.7}
        fill="none"
        strokeLinecap="round"
      >
        <path d="M30 38 L20 36" />
        <path d="M30 42 L20 44" />
        <path d="M70 38 L80 36" />
        <path d="M70 42 L80 44" />
      </g>
      {/* paws */}
      {!line && (
        <>
          <ellipse cx="38" cy="86" rx="8" ry="6" fill="rgba(38, 38, 43, 0.85)" />
          <ellipse cx="62" cy="86" rx="8" ry="6" fill="rgba(38, 38, 43, 0.85)" />
        </>
      )}
    </svg>
  )
}
