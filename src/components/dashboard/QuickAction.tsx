import React from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../../styles/tokens";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  gradient: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, sub, gradient, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: Radius.md, cursor: "pointer",
        border: `1px solid ${hovered ? C.tealBorder : C.gray2}`,
        background: hovered ? C.tealLight : C.white,
        transition: "all 0.15s", boxShadow: hovered ? Shadow.md : "none",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: Radius.sm,
        background: gradient, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: FontSize.base, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontSize: FontSize.xs, color: C.text3 }}>{sub}</div>
      </div>
      <div style={{ marginLeft: "auto", color: C.text3, fontSize: 16 }}>›</div>
    </div>
  );
};

export default QuickAction;
