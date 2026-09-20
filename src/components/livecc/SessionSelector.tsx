import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import type { SessionMeta } from "../../hooks/useLiveCCSessions";

interface SessionSelectorProps {
  sessions: SessionMeta[];
  selectedId: number | null;
  onChange: (id: number) => void;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({ sessions, selectedId, onChange }) => {
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
            {s.started_at ? s.started_at.slice(0, 10) + " " + s.started_at.slice(11, 16) : ""}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SessionSelector;
