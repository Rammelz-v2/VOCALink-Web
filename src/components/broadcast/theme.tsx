import React from "react";

// Height of the whole "room". Adjust to match your app header + page padding.
export const VIEW_HEIGHT = "calc(100vh - 96px)";

export const D = {
  page:    "#131314",
  stage:   "#16244A",
  glow:    "#22376E",
  surface: "#1F2022",
  btn:     "#333537",
  field:   "#303134",
  snack:   "#3C4043",
  text:    "#E8EAED",
  dim:     "#B4B9C0",
  muteBg:  "#F9DEDC",
  muteFg:  "#410E0B",
  end:     "#DC362E",
  panelOn: "#D3E3FD",
  panelFg: "#041E49",
  focus:   "#8AB4F8",
};

const AVATAR_COLORS = [
  "#8AB4F8", "#F28B82", "#81C995", "#FDD663",
  "#C58AF9", "#78D9EC", "#FCAD70", "#FF8BCB",
];

export const colorFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const CSS = `
.bc-btn{transition:filter .15s}
.bc-btn:hover:not(:disabled){filter:brightness(1.18)}
.bc-btn:focus-visible{outline:2px solid ${D.focus};outline-offset:2px}
.bc-field:focus-within{outline:2px solid ${D.focus}}
@media (prefers-reduced-motion: reduce){.bc-btn{transition:none}}
`;

// Material-style glyph paths (so this file doesn't depend on extra Icon names)
export const PATH = {
  close:          "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  chat:           "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z",
  send:           "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
  play:           "M8 5v14l11-7z",
  endCall:        "M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z",
  fullscreen:     "M7 14H5v5h5v-2H7v-3zM5 10h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
  fullscreenExit: "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z",
};

export const btnBase: React.CSSProperties = {
  border: "none", padding: 0, cursor: "pointer", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit",
};

export const Glyph: React.FC<{ d: string; size?: number; color?: string }> = ({
  d, size = 24, color = "currentColor",
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true">
    <path d={d} />
  </svg>
);
