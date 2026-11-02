import React from "react";
import { btnBase } from "./theme";
import type { CommRequest } from "../../hooks/useBroadcastSession";

interface EmergencyStudentGroupProps {
  studentName: string;
  reqs: CommRequest[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAcknowledge: (id: string) => void;
}

const EmergencyStudentGroup: React.FC<EmergencyStudentGroupProps> = ({
  studentName, reqs, isExpanded, onToggleExpand, onAcknowledge,
}) => {
  const isMulti   = reqs.length > 1;
  const firstNote = reqs[0].note;

  return (
    <div style={{
      borderRadius: 14,
      border: "1px solid rgba(255,23,68,0.40)",
      overflow: "hidden",
    }}>
      <div
        onClick={isMulti ? onToggleExpand : undefined}
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 14,
          background: "rgba(255,23,68,0.14)",
          padding: "14px 18px",
          cursor: isMulti ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 20, fontWeight: 800, color: "#F8F9FA",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {studentName}
          </div>

          {isMulti ? (
            <>
              <span style={{
                flexShrink: 0,
                background: "rgba(255,23,68,0.40)",
                border: "1px solid rgba(255,23,68,0.65)",
                borderRadius: 12, padding: "2px 9px",
                fontSize: 12, fontWeight: 700, color: "#FECDD3",
              }}>
                {reqs.length}×
              </span>
              <span style={{ flexShrink: 0, fontSize: 14, color: "rgba(255,255,255,0.50)" }}>
                {isExpanded ? "▲" : "▼"}
              </span>
            </>
          ) : (
            firstNote && (
              <div style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center",
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.24)",
                borderRadius: 20, padding: "3px 11px",
                fontSize: 14, fontWeight: 600, color: "#FECDD3",
              }}>
                {firstNote}
              </div>
            )
          )}
        </div>

        <button
          className="bc-btn"
          onClick={e => { e.stopPropagation(); reqs.forEach(r => onAcknowledge(r.id)); }}
          style={{
            ...btnBase,
            height: 44, padding: "0 20px", borderRadius: 22,
            background: "#FF1744", color: "#fff",
            fontSize: 14, fontWeight: 800, flexShrink: 0,
            letterSpacing: "0.3px",
            animation: "em-btn-pulse 1.1s ease-in-out infinite",
          }}
        >
          {isMulti ? "✓ Ack All" : "✓ Acknowledge"}
        </button>
      </div>

      {isMulti && isExpanded && (
        <div style={{
          background: "rgba(0,0,0,0.22)",
          borderTop: "1px solid rgba(255,23,68,0.18)",
          display: "flex", flexDirection: "column",
        }}>
          {reqs.map((r, i) => (
            <div key={r.id} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 12,
              padding: "9px 18px 9px 32px",
              borderBottom: i < reqs.length - 1
                ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {r.note ? (
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    background: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 20, padding: "3px 10px",
                    fontSize: 13, fontWeight: 600, color: "#FECDD3",
                  }}>
                    {r.note}
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                    Emergency
                  </span>
                )}
              </div>
              <button
                className="bc-btn"
                onClick={() => onAcknowledge(r.id)}
                style={{
                  ...btnBase,
                  height: 30, padding: "0 13px", borderRadius: 15,
                  background: "rgba(255,23,68,0.30)",
                  border: "1px solid rgba(255,23,68,0.55)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyStudentGroup;
