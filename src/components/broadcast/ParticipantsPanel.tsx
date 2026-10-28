import React from "react";
import { D, PATH, Glyph, colorFor } from "./theme";
import IconButton from "./IconButton";
import type { SessionParticipant } from "../../hooks/useBroadcastSession";

interface ParticipantsPanelProps {
  onClose: () => void;
  participants: SessionParticipant[];
}

const fmtTime = (iso: string) => {
  try {
    return new Date(iso + "Z").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ onClose, participants }) => (
  <aside style={{
    width: 300, maxWidth: "40%", flexShrink: 0, display: "flex", flexDirection: "column",
    background: D.surface, borderRadius: 16, overflow: "hidden",
  }}>
    {/* Header */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 8px 10px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: D.text }}>
          Students
        </div>
        <div style={{
          background: "#4ADE8022", color: "#4ADE80",
          fontSize: 12, fontWeight: 700,
          padding: "2px 9px", borderRadius: 999,
          border: "1px solid #4ADE8044",
        }}>
          {participants.length} joined
        </div>
      </div>
      <IconButton size={40} onClick={onClose} aria-label="Close panel">
        <Glyph d={PATH.close} size={22} color={D.text} />
      </IconButton>
    </div>

    {/* List */}
    <div style={{
      flex: 1, minHeight: 0, overflowY: "auto",
      padding: "8px 12px 12px",
      display: "flex", flexDirection: "column", gap: 6,
      scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent",
    }}>
      {participants.length === 0 ? (
        <div style={{ fontSize: 14, color: D.dim, padding: "8px 4px", lineHeight: 1.6 }}>
          No students have joined yet. They'll appear here as soon as they enter the session code.
        </div>
      ) : participants.map((p, i) => {
        const color    = colorFor(p.name);
        const initials = p.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
        return (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 10,
            background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
          }}>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#0D0D0D",
            }}>
              {initials}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: D.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: "#4ADE80", marginTop: 1 }}>
                Joined {fmtTime(p.joined_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </aside>
);

export default ParticipantsPanel;
