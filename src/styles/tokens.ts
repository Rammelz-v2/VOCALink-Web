export const Colors = {
  // ── Brand ──────────────────────────────────
  teal:           "#1AADDC",
  tealDark:       "#0E8DB8",
  tealMid:        "#0DD0F5",
  tealLight:      "var(--c-teal-light)",
  tealBorder:     "#93D9EE",
  tealGradient:   "linear-gradient(135deg, #1AADDC 0%, #0E8DB8 100%)",

  // ── Sidebar (always dark — no CSS var needed) ──
  sidebar:        "#0F172A",
  sidebarHover:   "rgba(255,255,255,0.06)",
  sidebarActive:  "rgba(26,173,220,0.15)",
  sidebarBorder:  "rgba(255,255,255,0.08)",
  sidebarText:    "rgba(255,255,255,0.55)",
  sidebarTextAct: "#FFFFFF",

  // ── Purple ─────────────────────────────────
  purple:         "#534AB7",
  purpleMid:      "#AFA9EC",
  purpleLight:    "var(--c-purple-light)",

  // ── Semantic ───────────────────────────────
  amber:          "#BA7517",
  amberLight:     "var(--c-amber-light)",
  red:            "#A32D2D",
  redDark:        "#E24B4A",
  redLight:       "var(--c-red-light)",
  blue:           "#0C447C",
  blueLight:      "var(--c-blue-light)",
  green:          "#0F7144",
  greenLight:     "var(--c-green-light)",

  // ── Neutral (theme-aware) ──────────────────
  gray:           "var(--c-gray)",
  gray2:          "var(--c-gray2)",
  gray3:          "var(--c-gray3)",
  text:           "var(--c-text)",
  text2:          "var(--c-text2)",
  text3:          "var(--c-text3)",
  white:          "var(--c-surface)",
  bg:             "var(--c-bg)",
};

export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 999,
};

export const FontSize = {
  xs:   11,
  sm:   12,
  base: 13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  28,
};

export const Shadow = {
  sm:  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md:  "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  lg:  "0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)",
  xl:  "0 16px 40px rgba(0,0,0,0.12)",
  teal:"0 4px 16px rgba(26,173,220,0.30)",
};
