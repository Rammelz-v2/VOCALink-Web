import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Badge } from "../ui";
import type { SessionLog } from "../../hooks/useLiveCCSessions";

const SessionMetaBar: React.FC<{ sessionLog: SessionLog }> = ({ sessionLog }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    padding: "8px 12px", borderRadius: Radius.md,
    background: sessionLog.is_active ? "rgba(34,197,94,0.06)" : C.gray,
    border: `1px solid ${sessionLog.is_active ? "rgba(34,197,94,0.25)" : C.gray2}`,
    marginBottom: 14, fontSize: FontSize.sm,
  }}>
    <Badge color={sessionLog.is_active ? "teal" : "gray"}>
      {sessionLog.is_active ? "● Live" : "Ended"}
    </Badge>
    <span style={{ fontWeight: 700, color: C.text }}>
      Code: <span style={{ color: sessionLog.is_active ? "#15803D" : C.text2, fontFamily: "monospace", fontSize: 15 }}>{sessionLog.session_code}</span>
    </span>
    <span style={{ color: C.text3 }}>
      Started: {sessionLog.started_at?.slice(0, 16).replace("T", " ")}
    </span>
    <span style={{ color: C.text3, marginLeft: "auto" }}>
      {sessionLog.entries.length} {sessionLog.entries.length === 1 ? "entry" : "entries"}
    </span>
  </div>
);

export default SessionMetaBar;
