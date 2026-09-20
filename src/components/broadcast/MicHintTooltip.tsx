import React from "react";
import { D, PATH, Glyph } from "./theme";
import IconButton from "./IconButton";

const MicHintTooltip: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <div role="status" style={{
    position: "absolute", bottom: "calc(100% + 18px)", left: "50%",
    transform: "translateX(-50%)", width: 272, zIndex: 5,
    display: "flex", alignItems: "flex-start", gap: 8,
    padding: "14px 10px 14px 18px", borderRadius: 8,
    background: D.snack, fontSize: 14, lineHeight: 1.45,
    boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
  }}>
    <span style={{ flex: 1 }}>
      Your mic is off. Click the mic to send live captions to students.
    </span>
    <IconButton size={28} onClick={onDismiss} aria-label="Dismiss">
      <Glyph d={PATH.close} size={18} color={D.text} />
    </IconButton>
    <div style={{
      position: "absolute", top: "100%", left: "50%", marginLeft: -8,
      borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
      borderTop: `8px solid ${D.snack}`,
    }} />
  </div>
);

export default MicHintTooltip;
