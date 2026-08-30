# Palette Studio

A one-page interior color atelier. Type a room or a vibe — *white walls, light oak, calm* — and Palette Studio composes a six-color palette: background, surface, accent, text, muted, highlight. Each color is named and hexed. A small bedroom plate is recolored live so you can see the walls, oak-ish floor, duvet, and pillows together.

Everything runs in the browser. There is no backend, no API key, and no model call. Palettes come from HSL harmony plus a keyword-to-hue map (`blue` / `coastal` ≈ 200°, `terracotta` / `warm` ≈ 20°, `oak` / `wood` ≈ 35°, plus sage, blush, navy, sand, gold, and the rest). The same sentence always yields the same palette.

## Run locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Vite is configured with `base: '/palette-studio/'`, so the dev server lives at:

[http://localhost:5173/palette-studio/](http://localhost:5173/palette-studio/)

Other scripts:

```bash
npm test            # vitest, including generatePalette
npm run build       # typecheck + production build into dist/
npm run preview     # serve the production build (also under /palette-studio/)
```

## GitHub Pages

The site is a static `dist/` folder. Deploy it at the project-pages base path **`/palette-studio/`** so asset URLs match `vite.config.ts`.

A workflow at `.github/workflows/pages.yml` builds on every push to `main`:

1. Node 20, `npm ci`, `npm test`, `npm run build`
2. Uploads `dist` with `actions/upload-pages-artifact@v3`
3. Deploys with `actions/deploy-pages@v4` to the `github-pages` environment

Enable **GitHub Pages → Source: GitHub Actions** on the repository. The live URL will be:

`https://<user-or-org>.github.io/palette-studio/`

If the repo is not named `palette-studio`, either rename it or change `base` in `vite.config.ts` to match the Pages path.

## Palette shape

`generatePalette(description: string)` in `src/palette.ts` returns:

```ts
{
  bg:        { hex, name, hsl },
  surface:   { hex, name, hsl },
  accent:    { hex, name, hsl },
  text:      { hex, name, hsl },
  muted:     { hex, name, hsl },
  highlight: { hex, name, hsl },
}
```

Text is contrast-checked against both `bg` and `surface` (WCAG 4.5:1). Export buttons copy the palette as CSS custom properties (`--color-bg`, …) and as a Tailwind `theme.extend.colors.studio` snippet.
