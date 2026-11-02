import React from "react";
import { Radius } from "../../styles/tokens";

interface LogoutConfirmProps {
  collapsed: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirm: React.FC<LogoutConfirmProps> = ({ collapsed, onConfirm, onCancel }) => (
  <div style={{
    margin: "2px 8px 8px",
    padding: "11px 12px",
    borderRadius: Radius.md,
    background: "rgba(220,38,38,0.10)",
    border: "1px solid rgba(220,38,38,0.28)",
  }}>
    {!collapsed && (
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: "rgba(255,255,255,0.65)",
        marginBottom: 9, textAlign: "center",
      }}>
        Sign out of VocaLink?
      </div>
    )}
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      <button
        onClick={onCancel}
        style={{
          flex: collapsed ? undefined : 1,
          padding: "6px 8px",
          borderRadius: Radius.sm,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "transparent",
          color: "rgba(255,255,255,0.55)",
          fontSize: 11, fontWeight: 600, cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {collapsed ? "✕" : "Cancel"}
      </button>
      <button
        onClick={onConfirm}
        style={{
          flex: collapsed ? undefined : 1,
          padding: "6px 8px",
          borderRadius: Radius.sm,
          border: "none",
          background: "#DC2626",
          color: "#fff",
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {collapsed ? "✓" : "Sign out"}
      </button>
    </div>
  </div>
);

export default LogoutConfirm;
