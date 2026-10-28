import React from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../../styles/tokens";
import type { DashboardSession } from "../../hooks/useDashboardData";

interface RecentSessionsCardProps {
  sessions: DashboardSession[];
  onViewLog: () => void;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso.slice(0, 10);
  }
}

const RecentSessionsCard: React.FC<RecentSessionsCardProps> = ({ sessions, onViewLog }) => (
  <div style={{
    background: C.white, borderRadius: Radius.lg,
    border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
  }}>
    <div style={{
      padding: "14px 16px", borderBottom: `1px solid ${C.gray2}`,
      fontSize: FontSize.md, fontWeight: 700, color: C.text,
      background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span>Recent Sessions</span>
      <span
        onClick={onViewLog}
        style={{ fontSize: FontSize.xs, color: "#1AADDC", cursor: "pointer", fontWeight: 600 }}
      >
        View all
      </span>
    </div>
    <div style={{ padding: "8px 0" }}>
      {sessions.length === 0 ? (
        <div style={{ padding: "12px 16px", fontSize: FontSize.sm, color: C.text3, fontStyle: "italic" }}>
          No sessions yet
        </div>
      ) : (
        sessions.map(s => (
          <div key={s.id} style={{
            padding: "9px 16px",
            display: "flex", alignItems: "center", gap: 10,
            borderBottom: `1px solid ${C.gray2}`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: s.is_active ? "#22C55E" : "#CBD5E1",
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: FontSize.sm, fontWeight: 700, color: C.text, fontFamily: "monospace", letterSpacing: "0.08em" }}>
                {s.session_code}
              </div>
              <div style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 1 }}>
                {fmtDate(s.started_at)}
              </div>
            </div>
            {s.is_active && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#16A34A",
                background: "#DCFCE7", padding: "2px 7px", borderRadius: 999,
              }}>
                LIVE
              </span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

export default RecentSessionsCard;
