import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Badge } from "../ui";
import type { LogEntry } from "../../hooks/useLiveCCSessions";

const LogEntryRow: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const bgColor      = entry.type === "cc" ? C.tealLight  : C.gray;
  const borderColor  = entry.type === "cc" ? C.tealBorder : C.gray2;
  const speakerColor = entry.type === "cc" ? C.teal       : C.text2;
  const textColor    = entry.type === "cc" ? "#085041"    : C.text;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "10px 12px", borderRadius: Radius.md,
      background: bgColor, border: `1px solid ${borderColor}`,
    }}>
      <div style={{
        fontSize: 11, color: C.text3, whiteSpace: "nowrap",
        paddingTop: 2, minWidth: 42, fontVariantNumeric: "tabular-nums",
      }}>
        {entry.time}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: FontSize.sm, fontWeight: 600, color: speakerColor, marginBottom: 3 }}>
          {entry.type === "aac" && <span style={{ marginRight: 4 }}>🗣</span>}
          {entry.speaker}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: textColor }}>
          {entry.text}
        </div>
      </div>

      {entry.type === "cc"  && <Badge color="teal">CC</Badge>}
      {entry.type === "aac" && <Badge color="purple">AAC</Badge>}
    </div>
  );
};

export default LogEntryRow;
