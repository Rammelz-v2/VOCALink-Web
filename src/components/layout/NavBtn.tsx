import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";

interface NavBtnProps {
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NavBtn: React.FC<NavBtnProps> = ({ isActive, collapsed, onClick, icon, label, badge }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 10,
        padding: collapsed ? "10px 0" : "9px 12px",
        margin: "2px 8px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: Radius.md, cursor: "pointer",
        fontSize: FontSize.base,
        background: isActive
          ? "rgba(26,173,220,0.18)"
          : hovered ? C.sidebarHover : "transparent",
        color: isActive ? "#1AADDC" : hovered ? "rgba(255,255,255,0.85)" : C.sidebarText,
        fontWeight: isActive ? 600 : 400,
        transition: "all 0.15s",
        borderLeft: isActive ? `3px solid #1AADDC` : "3px solid transparent",
        overflow: "hidden", whiteSpace: "nowrap",
      }}
    >
      {icon}
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge != null && (
        <span style={{
          background: "#1AADDC", color: "#fff",
          fontSize: 10, fontWeight: 700,
          padding: "1px 7px", borderRadius: 999,
          minWidth: 18, textAlign: "center",
        }}>
          {badge}
        </span>
      )}
    </div>
  );
};

export default NavBtn;
