import type { Palette } from './palette'

type BedroomProps = {
  palette: Palette
  caption: string
}

export default function Bedroom({ palette, caption }: BedroomProps) {
  const { bg, surface, accent, text, muted, highlight } = palette
  const plank = surface.hsl.l > 50 ? 0.14 : 0.22

  return (
    <figure className="plate">
      <div className="plate-frame">
        <svg
          viewBox="0 0 480 360"
          role="img"
          aria-label={`Bedroom preview. Walls ${bg.name}, floor ${surface.name}, bedding ${highlight.name}, pillows ${accent.name}.`}
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent.hex} stopOpacity="0.35" />
              <stop offset="100%" stopColor={highlight.hex} stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="duvetFold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={highlight.hex} />
              <stop offset="100%" stopColor={muted.hex} stopOpacity="0.35" />
            </linearGradient>
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={highlight.hex} stopOpacity="0.9" />
              <stop offset="100%" stopColor={highlight.hex} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Walls */}
          <rect x="0" y="0" width="480" height="248" fill={bg.hex} />
          {/* Soft corner shadow on the right wall plane */}
          <path d="M392 0 H480 V248 H392 Z" fill={text.hex} opacity="0.04" />

          {/* Floor */}
          <rect x="0" y="248" width="480" height="112" fill={surface.hex} />
          {Array.from({ length: 9 }, (_, i) => {
            const y = 252 + i * 12
            return (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="480"
                y2={y}
                stroke={text.hex}
                strokeWidth="1"
                opacity={plank}
              />
            )
          })}

          {/* Baseboard */}
          <rect x="0" y="244" width="480" height="8" fill={surface.hex} />
          <line x1="0" y1="244" x2="480" y2="244" stroke={text.hex} strokeWidth="1.2" opacity="0.25" />

          {/* Window */}
          <g>
            <rect x="36" y="42" width="108" height="132" fill={text.hex} opacity="0.18" />
            <rect x="42" y="48" width="96" height="120" fill="url(#sky)" />
            <line x1="90" y1="48" x2="90" y2="168" stroke={text.hex} strokeWidth="3" opacity="0.35" />
            <line x1="42" y1="108" x2="138" y2="108" stroke={text.hex} strokeWidth="3" opacity="0.35" />
            <rect
              x="42"
              y="48"
              width="96"
              height="120"
              fill="none"
              stroke={text.hex}
              strokeWidth="3"
              opacity="0.45"
            />
            {/* Curtain */}
            <path
              d="M138 42 C150 70, 146 110, 152 168 L138 168 Z"
              fill={accent.hex}
              opacity="0.85"
            />
            <path
              d="M36 42 C28 64, 30 120, 24 168 L36 168 Z"
              fill={muted.hex}
              opacity="0.55"
            />
          </g>

          {/* Rug */}
          <ellipse cx="268" cy="292" rx="148" ry="28" fill={muted.hex} opacity="0.35" />

          {/* Nightstand + lamp */}
          <rect x="86" y="218" width="52" height="40" rx="2" fill={surface.hex} />
          <rect x="86" y="218" width="52" height="7" fill={text.hex} opacity="0.14" />
          <circle cx="112" cy="196" r="26" fill="url(#lampGlow)" />
          <path d="M96 198 L128 198 L122 186 L102 186 Z" fill={highlight.hex} />
          <rect x="109" y="198" width="6" height="20" fill={text.hex} opacity="0.4" />

          {/* Headboard — wood panel, not a grey slab */}
          <rect x="168" y="156" width="222" height="64" rx="2" fill={surface.hex} />
          <rect x="168" y="156" width="222" height="64" rx="2" fill={text.hex} opacity="0.16" />
          <rect
            x="168"
            y="156"
            width="222"
            height="64"
            rx="2"
            fill="none"
            stroke={text.hex}
            strokeWidth="1.2"
            opacity="0.22"
          />

          {/* Bed frame */}
          <rect x="146" y="214" width="266" height="58" rx="4" fill={surface.hex} />
          <rect x="146" y="258" width="266" height="10" fill={text.hex} opacity="0.12" />

          {/* Duvet */}
          <path
            d="M156 208 H402 C408 208, 412 214, 412 220 V262 H156 V220 C156 214, 160 208, 166 208 Z"
            fill={highlight.hex}
          />
          <path d="M156 208 H402 V228 H156 Z" fill="url(#duvetFold)" opacity="0.55" />
          <path
            d="M176 228 C220 236, 260 222, 300 232 C340 242, 372 226, 400 234"
            fill="none"
            stroke={text.hex}
            strokeWidth="1.2"
            opacity="0.18"
          />

          {/* Pillows */}
          <rect x="178" y="176" width="86" height="46" rx="10" fill={accent.hex} />
          <rect x="268" y="180" width="82" height="42" rx="10" fill={muted.hex} />
          <rect
            x="178"
            y="176"
            width="86"
            height="46"
            rx="10"
            fill="none"
            stroke={text.hex}
            strokeWidth="1.2"
            opacity="0.2"
          />
          <rect
            x="268"
            y="180"
            width="82"
            height="42"
            rx="10"
            fill="none"
            stroke={text.hex}
            strokeWidth="1.2"
            opacity="0.2"
          />

          {/* Small plant */}
          <rect x="400" y="228" width="22" height="18" fill={surface.hex} />
          <path d="M411 228 C402 210, 396 198, 404 186 C412 198, 408 210, 411 228 Z" fill={accent.hex} />
          <path d="M411 228 C420 208, 430 196, 422 184 C414 198, 416 212, 411 228 Z" fill={muted.hex} />

          {/* Architectural plate crop marks */}
          <g stroke={text.hex} strokeWidth="1" opacity="0.28" fill="none">
            <path d="M12 28 H12 V12 H28" />
            <path d="M452 12 H468 V28" />
            <path d="M12 332 V348 H28" />
            <path d="M452 348 H468 V332" />
          </g>
        </svg>
      </div>
      <figcaption>
        <span className="plate-index">Plate 01</span>
        <span className="plate-caption">{caption || 'An unnamed room'}</span>
      </figcaption>
    </figure>
  )
}
