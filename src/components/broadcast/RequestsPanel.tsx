import React from "react";
import { D, PATH, Glyph, btnBase } from "./theme";
import IconButton from "./IconButton";
import type { CommRequest } from "../../hooks/useBroadcastSession";

interface RequestsPanelProps {
  onClose: () => void;
  requests: CommRequest[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const LABELS: Record<string, string> = {
  medication: "Needs medication",
  bathroom:   "Needs the bathroom",
  assistance: "Needs assistance",
};

const RequestsPanel: React.FC<RequestsPanelProps> = ({
  onClose, requests, onAcknowledge, onResolve,
}) => (
  <aside style={{
    width: 340, maxWidth: "45%", flexShrink: 0, display: "flex", flexDirection: "column",
    background: D.surface, borderRadius: 16, overflow: "hidden",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 8px 10px 20px" }}>
      <div style={{ fontSize: 17, fontWeight: 500 }}>
        Requests {requests.length > 0 && `(${requests.length})`}
      </div>
      <IconButton size={40} onClick={onClose} aria-label="Close panel">
        <Glyph d={PATH.close} size={22} color={D.text} />
      </IconButton>
    </div>

    <div style={{
      flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 12px",
      display: "flex", flexDirection: "column", gap: 8,
      scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent",
    }}>
      {requests.length === 0 ? (
        <div style={{ fontSize: 14, color: D.dim, lineHeight: 1.5, padding: "4px 4px" }}>
          No active requests. Medication, bathroom, and assistance taps will show up here.
        </div>
      ) : requests.map(r => (
        <div key={r.id} style={{
          padding: "10px 12px", borderRadius: 12,
          background: r.status === "pending" ? "rgba(220,54,46,0.14)" : "rgba(138,180,248,0.12)",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {r.student_name}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {LABELS[r.request_type] || r.request_type}
          </div>
          {r.note && (
            <div style={{ fontSize: 13, color: D.dim }}>{r.note}</div>
          )}
          <div style={{ fontSize: 12, color: D.dim }}>
            {r.status === "pending" ? "Waiting" : "Acknowledged"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {r.status === "pending" && (
              <button
                className="bc-btn"
                onClick={() => onAcknowledge(r.id)}
                style={{
                  ...btnBase, flex: 1, height: 32, borderRadius: 16,
                  background: D.btn, color: D.text, fontSize: 13,
                }}
              >
                Acknowledge
              </button>
            )}
            <button
              className="bc-btn"
              onClick={() => onResolve(r.id)}
              style={{
                ...btnBase, flex: 1, height: 32, borderRadius: 16,
                background: D.panelOn, color: D.panelFg, fontSize: 13,
              }}
            >
              Resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  </aside>
);

export default RequestsPanel;