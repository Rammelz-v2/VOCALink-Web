import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import type { SessionMeta } from "../../hooks/useLiveCCSessions";

interface SessionSelectorProps {
  sessions: SessionMeta[];
  selectedId: number | null;
  onChange: (id: number) => void;
  loading?: boolean;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({ sessions, selectedId, onChange, loading }) => {
  if (loading) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 12, width: 80, borderRadius: 4, marginBottom: 6, background: C.gray2 }} />
        <div style={{
          height: 36, borderRadius: Radius.md, background: C.gray,
          backgroundImage: "linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: "10px 14px", borderRadius: Radius.md, background: C.gray, fontSize: FontSize.sm, color: C.text3, marginBottom: 16 }}>
        No sessions yet. Start a class from the Broadcast page.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: FontSize.xs, fontWeight: 600, color: C.text3, display: "block", marginBottom: 6 }}>
        Select Session
      </label>
      <select
        value={selectedId ?? ""}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: "100%", padding: "8px 12px", borderRadius: Radius.md,
          border: `1px solid ${C.gray2}`, background: C.white,
          fontSize: FontSize.sm, color: C.text, cursor: "pointer",
          outline: "none", fontFamily: "inherit",
        }}
      >
        {sessions.map(s => (
          <option key={s.id} value={s.id}>
            {s.session_code}
            {s.is_active ? " ● Live" : ""}
            {"  —  "}
            {s.started_at
              ? new Date(s.started_at.endsWith("Z") ? s.started_at : s.started_at + "Z")
                  .toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SessionSelector;
