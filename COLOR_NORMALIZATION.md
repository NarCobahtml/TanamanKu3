# Color Normalization Strategy

Target: 3 base colors + derived system
- `#1B5E20` — primary green
- `#FDFFFB` — background white
- `#123526` — ink (text/dark)

## Mapping Rules

### Primary Green Family → `#1B5E20`
Replace ALL green variants:
- Dark greens: #1B5E3F, #12651F, #075B17, #00450D, #17491A, #2A6B2C, #2E7238, #246C2D, #1C6B25, #2F6E3D, #25552F, #1F4527, #1B7A43
- Mid greens: #66BB6A, #4CAF50, #3E9144, #76BD70, #4D9C21, #4F991F
- Light green tints: #C8E6C9, #E8F5E9, #ABF4AC, #A2EFA7, #7ED8A4, #DFF3D9, #DCEFD5, #E7EFE9, #E6EFE9

**Exceptions:**
- `diseased-leaf.svg` artwork (80BD2E, D9ED9B, B5D83C, D4D45A, EEF2AD, F7F6C3, A9D65A, 745116, 403B18) → KEEP as illustration
- Google green (#34A853) in OAuth buttons → KEEP brand identity

### Ink/Black Family → `#123526`
Replace ALL:
- #171B17, #171917, #181D18, #1A1A1A, #212121, #23292A, #27302A, #000000, #000, #424242

### White/Background Family → `#FDFFFB`
Replace ALL:
- #FFFFFF, #FFF, #F5F5F0, #F6FBF3, #F2F5F2, #F2F7F3, #F5F3EF, #F1F5ED, #E0EED4

### Gray Text (muted) → Tailwind `text-ink/70` or `text-ink/60`
Delete inline grays, use utility:
- #757575, #999999, #666666, #666, #616161, #9E9E9E, #6B7280, #9CA3AF, #59625D, #4D574D, #41493E, #414B41, #717A6D, #888, #888888

### Gray Borders → Tailwind `border-ink/15`
Delete inline, use utility:
- #E8E8E8, #E0E0E0, #D0D0D0, #E5E8E4, #C0C9BB, #DFE4DC, #CED4CE, #D3DDD0, #E5E7EB, #A9C3B2

### Status Colors (accessibility semantic)
Normalize to ONE per category:
- **Destructive (red)**: #B3261E only (replace D32F2F, BA1A1A, E53935, 93000A)
- **Warning (orange)**: #935F00 only (replace F57C00, E8C46A, 745116, 403B18)
- **Info (blue)**: #1D5FBF only (replace 4285F4 EXCEPT OAuth)
- Tints: use `/10` opacity → `bg-destructive/10`

**Exceptions:**
- OAuth brand colors (login/register): #4285F4 (Google), #34A853 (Google), #FBBC05 (Google), #EA4335 (Google), #1877F2 (Facebook) → KEEP
- Red tints in siram SVG icons (93000A siram-status-bad.svg) → use #B3261E

### CSS Variables (globals.css)
Update `:root`:
```css
--background: #FDFFFB;
--foreground: #123526;
--primary: #1B5E20;
--primary-foreground: #FDFFFB;
--ink: #123526;
--muted-foreground: /* use ink with opacity */
--border: /* use ink/15 */
```

Remove unused vars: --brand, --brand-dark, --mint, --ink-soft, --line

## Files to Change

### Must change:
- `src/app/globals.css` — update CSS vars, remove inline hex in utilities
- All `src/components/*.tsx` — inline `className="..."` with hex
- All `src/app/**/page.tsx` — inline hex colors
- `public/figma-assets/icons-siram/*.svg` — UI icons only (siram-status-*, legend-*)

### Keep unchanged:
- `public/diseased-leaf.svg` — artwork illustration
- `src/app/login/page.tsx` OAuth section — Google/FB brand colors
- `src/app/register/page.tsx` OAuth section — Google/FB brand colors
- Brief/doc MD files — references only

### Strategy per file type:
1. **CSS**: replace hex → CSS var or Tailwind utility
2. **TSX**: replace inline `bg-[#HEX]` → `bg-primary` or `text-ink/70`
3. **SVG (UI icons)**: replace fill/stroke hex → currentColor or mapped color
4. **SVG (artwork)**: SKIP

## Verification
After changes:
```bash
# Count remaining non-standard colors (exclude OAuth + diseased-leaf.svg)
rg '#[0-9A-Fa-f]{6}' src/ --type tsx --type ts --type css \
  | grep -vE '(4285F4|34A853|FBBC05|EA4335|1877F2|1B5E20|FDFFFB|123526|B3261E|935F00|1D5FBF)'
```

Should be minimal/zero.
