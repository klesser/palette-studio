import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import Bedroom from './Bedroom'
import {
  generatePalette,
  PALETTE_ROLES,
  toCssVariables,
  toTailwindTheme,
  type Palette,
  type PaletteRole,
} from './palette'

type Preset = {
  label: string
  prompt: string
}

const PRESETS: Preset[] = [
  { label: 'White walls + light oak, calm.', prompt: 'White walls + light oak, calm.' },
  { label: 'Moody charcoal + linen.', prompt: 'Moody charcoal + linen.' },
  { label: 'Coastal blue + sand.', prompt: 'Coastal blue + sand.' },
  { label: 'Warm terracotta + cream.', prompt: 'Warm terracotta + cream.' },
]

const ROLE_LABEL: Record<PaletteRole, string> = {
  bg: 'Background',
  surface: 'Surface',
  accent: 'Accent',
  text: 'Text',
  muted: 'Muted',
  highlight: 'Highlight',
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

export default function App() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt)
  const [palette, setPalette] = useState<Palette>(() => generatePalette(PRESETS[0].prompt))
  const [activePreset, setActivePreset] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const fieldId = useId()

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function showToast(message: string) {
    setToast(message)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  function compose(nextPrompt: string, presetIndex: number | null) {
    const trimmed = nextPrompt.trim() || PRESETS[0].prompt
    setPalette(generatePalette(trimmed))
    setActivePreset(presetIndex ?? -1)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    compose(prompt, PRESETS.findIndex((p) => p.prompt === prompt.trim()))
  }

  async function copyHex(hex: string, name: string) {
    const ok = await writeClipboard(hex)
    showToast(ok ? `Copied ${name} ${hex}` : 'Copy failed')
  }

  async function copyCss() {
    const ok = await writeClipboard(toCssVariables(palette))
    showToast(ok ? 'Copied CSS variables' : 'Copy failed')
  }

  async function copyTailwind() {
    const ok = await writeClipboard(toTailwindTheme(palette))
    showToast(ok ? 'Copied Tailwind theme' : 'Copy failed')
  }

  return (
    <div className="page">
      <div className="running-head" aria-hidden="true">
        <span>Palette Studio</span>
        <span>Interior color · client-side</span>
      </div>

      <header className="masthead">
        <p className="kicker">An interior atelier</p>
        <h1>
          Palette <em>Studio</em>
        </h1>
        <p className="lede">
          Describe a room. A six-color interior palette is composed from hue, material, and
          mood — named, hexed, and painted onto a quiet bedroom. No accounts. No models.
          Color theory, on the page.
        </p>
      </header>

      <div className="studio">
        <section className="composer" aria-labelledby="compose-heading">
          <div className="section-head">
            <h2 id="compose-heading">Compose</h2>
            <p>Walls, oak, linen, light. A sentence is enough.</p>
          </div>

          <div className="presets" role="list" aria-label="Presets">
            {PRESETS.map((preset, index) => (
              <button
                key={preset.prompt}
                type="button"
                role="listitem"
                className={index === activePreset ? 'preset is-active' : 'preset'}
                onClick={() => {
                  setPrompt(preset.prompt)
                  compose(preset.prompt, index)
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <form className="prompt-form" onSubmit={onSubmit}>
            <label htmlFor={fieldId}>Describe a room or vibe</label>
            <textarea
              id={fieldId}
              name="description"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  compose(prompt, PRESETS.findIndex((p) => p.prompt === prompt.trim()))
                }
              }}
              placeholder="White walls, light oak, sage linen, a little gold…"
              spellCheck
            />
            <div className="form-row">
              <p className="hint">Cmd or Ctrl + Enter to compose</p>
              <button type="submit" className="compose">
                Compose palette
              </button>
            </div>
          </form>
        </section>

        <Bedroom palette={palette} caption={prompt.trim() || PRESETS[0].prompt} />
      </div>

      <section className="swatches" aria-labelledby="swatch-heading">
        <div className="section-head">
          <h2 id="swatch-heading">The six</h2>
          <p>Click a chip to copy its hex.</p>
        </div>
        <ol className="chip-row">
          {PALETTE_ROLES.map((role) => {
            const color = palette[role]
            return (
              <li key={role}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => copyHex(color.hex, color.name)}
                  title={`Copy ${color.hex}`}
                >
                  <span className="chip-fill" style={{ background: color.hex }} />
                  <span className="chip-meta">
                    <span className="chip-role">{ROLE_LABEL[role]}</span>
                    <span className="chip-name">{color.name}</span>
                    <span className="chip-hex">{color.hex}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="export" aria-labelledby="export-heading">
        <div className="section-head">
          <h2 id="export-heading">Take it with you</h2>
          <p>CSS custom properties, or a Tailwind theme snippet.</p>
        </div>
        <div className="export-actions">
          <button type="button" className="ghost" onClick={copyCss}>
            Copy CSS variables
          </button>
          <button type="button" className="ghost" onClick={copyTailwind}>
            Copy Tailwind theme
          </button>
        </div>
      </section>

      <footer className="colophon">
        <p>
          Palette Studio is a static page. Palettes are composed from HSL harmony and a
          keyword-to-hue map — never from a network call.
        </p>
      </footer>

      <div className={toast ? 'toast is-on' : 'toast'} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}
