# TanamanKu Color Palette (dipatenkan 14 Sep)

3 warna dasar + turunan opasitas. Berlaku semua platform (desktop + mobile).

## Base Colors
- **Primary Green**: `#1B5E20` — brand, buttons, CTAs, active states
- **Background**: `#FDFFFB` — canvas utama, kartu, surface putih
- **Ink**: `#123526` — teks heading, panel identitas gelap (hero, footer, ink-panel)

## Derived (opacity dari ink/primary)
- Muted text: `text-ink/70` (body), `text-ink/60` (placeholder, icon)
- Border hairline: `border-ink/15`
- Green tint: `bg-primary/10` (icon bg, chip)

## Status Colors (semantik — selalu icon + label, jangan color-only)
- **Destructive**: `#B3261E` → tint `bg-destructive/10`
- **Warning**: `#935F00` → tint `bg-warning/10`
- **Info**: `#1D5FBF` → tint `bg-info/10`
- Success memakai primary: `bg-primary`

## CSS Variables (globals.css `:root`)
```css
--primary: #1B5E20;
--background: #FDFFFB;
--foreground / --ink: #123526;
--destructive: #B3261E;
--warning: #935F00;
--info: #1D5FBF;
```

## Exceptions (tetap, jangan diutak-atik)
- OAuth brand: `#4285F4` `#34A853` `#FBBC05` `#EA4335` (Google), `#1877F2` (Facebook) — di login/register
- Artwork: `public/diseased-leaf.svg` — ilustrasi multi-warna

## Rules
- Hex literal HANYA di globals.css `:root`. TSX pakai token Tailwind (`bg-primary`, `text-ink/70`, `border-ink/15`).
- New color = dilarang. Butuh kontras? Gunakan opasitas turunan.
