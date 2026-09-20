import React from "react";
import { D } from "./theme";

const CaptionOverlay: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: "absolute", left: "50%", bottom: 20, transform: "translateX(-50%)",
    width: "min(720px, calc(100% - 48px))", boxSizing: "border-box",
    padding: "10px 16px", borderRadius: 12, zIndex: 2,
    background: "rgba(19,19,20,0.88)",
  }}>
    <div style={{ fontSize: 12, color: D.dim, marginBottom: 2 }}>You</div>
    <div style={{ fontSize: 18, lineHeight: 1.4 }}>{text}</div>
  </div>
);

export default CaptionOverlay;
