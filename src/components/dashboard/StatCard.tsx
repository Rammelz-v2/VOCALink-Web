import React from "react";
import { Radius, Shadow, FontSize } from "../../styles/tokens";

interface StatCardProps {
  value: number | string;
  label: string;
  bg: string;
  iconBg: string;
  icon: React.ReactNode;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, bg, iconBg, icon, trend }) => (
  <div style={{
    flex: 1, borderRadius: Radius.lg, padding: "20px 22px",
    background: bg, border: `1px solid rgba(0,0,0,0.06)`,
    boxShadow: Shadow.md, position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", right: -20, top: -20,
      width: 100, height: 100, borderRadius: "50%",
      background: "rgba(255,255,255,0.15)",
    }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-1.5px", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: FontSize.sm, color: "#475569", marginTop: 6, fontWeight: 500 }}>
          {label}
        </div>
        {trend && (
          <div style={{ fontSize: FontSize.xs, color: "#22C55E", marginTop: 4, fontWeight: 600 }}>
            {trend}
          </div>
        )}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: Radius.md,
        background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
