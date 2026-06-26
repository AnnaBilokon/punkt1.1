// ── Design tokens ─────────────────────────────────────────────────────────────
// Palette: Black · Carbon Black · Chocolate Plum · Taupe Grey · Light Blue
// Background: #E9E3DE @ 33% on white ≈ #F8F6F4

export const C = {
  // ── Raw palette ──────────────────────────────────────────────────────────
  black:       '#070707',  // near-pure black
  carbonBlack: '#28231c',  // primary text, headings
  chocPlum:    '#513b3c',  // mid-tone accent
  taupeGrey:   '#655356',  // secondary text, icons
  lightBlue:   '#c1eeff',  // PRIMARY ACTION — button fills, active states

  // ── Semantic ─────────────────────────────────────────────────────────────
  bg:           '#F8F6F4',  // page background
  bgCard:       '#ffffff',
  bgSubtle:     '#F2EEE9',  // alternate card bg
  bgChip:       '#e2f5ff',  // chip / badge fill (light blue tint)

  primary:      '#c1eeff',  // = lightBlue
  primaryDim:   '#9edcf7',  // pressed state
  primaryFaint: '#e8f8ff',  // faint tint for icon wells
  primaryBorder:'#a8d8f0',  // border on primary-tinted elements

  textPrimary:  '#28231c',  // = carbonBlack
  textSecond:   '#655356',  // = taupeGrey
  textMuted:    '#8a7a7e',  // lighter taupe for captions
  textOnPrimary:'#070707',  // text ON primary (#c1eeff) fills

  border:    '#e0dbd5',
  divider:   'rgba(40,35,28,0.08)',

  star:    '#c9a84c',
  danger:  '#c05e5e',
  success: '#5a7a52',
} as const;
