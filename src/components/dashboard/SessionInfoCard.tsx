import React from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../../styles/tokens";

interface SessionInfoCardProps {
  department?: string;
  roomSection?: string;
  today: string;
}

const SessionInfoCard: React.FC<SessionInfoCardProps> = ({ department, roomSection, today }) => {
  const [weekday, monthDay] = today.split(",");
  const rows = [
    { key: "Subject", val: department || "—", icon: "📚" },
    { key: "Section", val: roomSection || "—", icon: "🏫" },
    { key: "Date", val: `${weekday},${monthDay}`, icon: "📅" },
    { key: "Period", val: "8:00 – 10:00 AM", icon: "⏰" },
  ];

  return (
    <div style={{
      background: C.white, borderRadius: Radius.lg,
      border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 16px", borderBottom: `1px solid ${C.gray2}`,
        fontSize: FontSize.md, fontWeight: 700, color: C.text,
        background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
      }}>
        Session Info
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map(({ key, val, icon }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: FontSize.xs, color: C.text3, fontWeight: 500 }}>{key}</div>
              <div style={{ fontSize: FontSize.sm, fontWeight: 600, color: C.text, marginTop: 1 }}>{val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionInfoCard;
