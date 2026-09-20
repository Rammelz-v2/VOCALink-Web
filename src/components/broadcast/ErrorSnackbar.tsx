import React from "react";
import { D, PATH, Glyph } from "./theme";
import IconButton from "./IconButton";

const ErrorSnackbar: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div role="alert" style={{
    position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
    zIndex: 3, maxWidth: "70%", display: "flex", alignItems: "center", gap: 8,
    padding: "8px 8px 8px 16px", borderRadius: 8, fontSize: 14,
    background: D.snack, boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  }}>
    <span>{message}</span>
    <IconButton size={28} onClick={onDismiss} aria-label="Dismiss">
      <Glyph d={PATH.close} size={18} color={D.text} />
    </IconButton>
  </div>
);

export default ErrorSnackbar;
