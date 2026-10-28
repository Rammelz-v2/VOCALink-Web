import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Badge } from "../ui";
import type { LogEntry } from "../../hooks/useLiveCCSessions";

const EVENT_CONFIG: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  join:  { bg: "#DCFCE7", border: "#86EFAC", color: "#166534", icon: "🟢" },
  leave: { bg: "#FEE2E2", border: "#FCA5A5", color: "#991B1B", icon: "🔴" },
  start: { bg: "#E0F2FE", border: "#7DD3FC", color: "#0369A1", icon: "🎙️" },
  end:   { bg: "#F1F5F9", border: "#CBD5E1", color: "#475569", icon: "🔒" },
};

const LogEntryRow: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  if (entry.type === "event") {
    const cfg = EVENT_CONFIG[entry.event_kind ?? "start"];
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 12px", borderRadius: Radius.md,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
      }}>
        <div style={{ fontSize: 11, color: C.text3, whiteSpace: "nowrap", minWidth: 42, fontVariantNumeric: "tabular-nums" }}>
          {entry.time}
        </div>
        <span style={{ fontSize: 14 }}>{cfg.icon}</span>
        <span style={{ fontSize: FontSize.sm, color: cfg.color, fontWeight: 500, fontStyle: "italic" }}>
          {entry.text}
        </span>
      </div>
    );
  }

  const bgColor      = entry.type === "cc" ? C.tealLight  : C.gray;
  const borderColor  = entry.type === "cc" ? C.tealBorder : C.gray2;
  const speakerColor = entry.type === "cc" ? C.teal       : C.text2;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "10px 12px", borderRadius: Radius.md,
      background: bgColor, border: `1px solid ${borderColor}`,
    }}>
      <div style={{ fontSize: 11, color: C.text3, whiteSpace: "nowrap", paddingTop: 2, minWidth: 42, fontVariantNumeric: "tabular-nums" }}>
        {entry.time}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: FontSize.sm, fontWeight: 600, color: speakerColor, marginBottom: 3 }}>
          {entry.type === "aac" && <span style={{ marginRight: 4 }}>🗣</span>}
          {entry.speaker}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: C.text }}>
          {entry.text}
        </div>
      </div>
      {entry.type === "cc"  && <Badge color="teal">CC</Badge>}
      {entry.type === "aac" && <Badge color="purple">AAC</Badge>}
    </div>
  );
};

export default LogEntryRow;
