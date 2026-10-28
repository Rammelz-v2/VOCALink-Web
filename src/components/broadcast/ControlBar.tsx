import React from "react";
import Icon from "../ui/Icon";
import { Colors as C } from "../../styles/tokens";
import { D, PATH, Glyph, btnBase } from "./theme";
import MicHintTooltip from "./MicHintTooltip";

interface ControlBarProps {
  sessionLoading: boolean;
  sessionActive: boolean;
  sessionCode: string | null;
  recording: boolean;
  micOff: boolean;
  showHint: boolean;
  onDismissHint: () => void;
  onToggleMic: () => void;
  togglingSession: boolean;
  onToggleSession: () => void;
  panelOpen: boolean;
  onTogglePanel: () => void;
  requestsPanelOpen: boolean;
  onToggleRequestsPanel: () => void;
  requestCount: number;
  participantsPanelOpen: boolean;
  onToggleParticipantsPanel: () => void;
  participantCount: number;
}

/** Bottom bar: session code (left) · mic + start/end (center) · panel toggle (right). */
const ControlBar: React.FC<ControlBarProps> = ({
  sessionLoading, sessionActive, sessionCode, recording, micOff, showHint, onDismissHint,
  onToggleMic, togglingSession, onToggleSession, panelOpen, onTogglePanel,
  requestsPanelOpen, onToggleRequestsPanel, requestCount,
  participantsPanelOpen, onToggleParticipantsPanel, participantCount,
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, paddingTop: 12 }}>

    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, paddingLeft: 8, fontSize: 14 }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: sessionActive ? "#22C55E" : "#5F6368",
        boxShadow: sessionActive ? "0 0 0 3px rgba(34,197,94,0.25)" : "none",
      }} />
      {sessionLoading ? null : sessionActive ? (
        <span title="Session code" style={{ fontFamily: "monospace", fontWeight: 600, letterSpacing: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sessionCode}
        </span>
      ) : (
        <span style={{ color: D.dim }}>No active session</span>
      )}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: D.surface, borderRadius: 32 }}>
      <div style={{ position: "relative" }}>
        {showHint && <MicHintTooltip onDismiss={onDismissHint} />}
        <button
          className="bc-btn"
          onClick={onToggleMic}
          disabled={!sessionActive}
          aria-label={recording ? "Mute microphone" : "Unmute microphone"}
          aria-pressed={micOff}
          title={recording ? "Mute" : "Unmute"}
          style={{
            ...btnBase, width: 56, height: 48, borderRadius: 24,
            background: micOff ? D.muteBg : D.btn,
            opacity: sessionActive ? 1 : 0.4,
            cursor: sessionActive ? "pointer" : "not-allowed",
          }}
        >
          <Icon name={recording ? "mic" : "mic-off"} size={22} color={micOff ? D.muteFg : D.text} />
        </button>
      </div>

      {sessionLoading ? (
        <button disabled style={{ ...btnBase, gap: 8, height: 48, padding: "0 22px", borderRadius: 24, background: D.surface, color: D.dim, fontSize: 14, fontWeight: 600, cursor: "not-allowed", opacity: 0.5 }}>
          Loading…
        </button>
      ) : sessionActive ? (
        <button
          className="bc-btn"
          onClick={onToggleSession}
          disabled={togglingSession}
          aria-label="End session"
          title="End session"
          style={{
            ...btnBase, width: 64, height: 48, borderRadius: 24,
            background: D.end, opacity: togglingSession ? 0.6 : 1,
            cursor: togglingSession ? "not-allowed" : "pointer",
          }}
        >
          <Glyph d={PATH.endCall} size={26} color="#fff" />
        </button>
      ) : (
        <button
          className="bc-btn"
          onClick={onToggleSession}
          disabled={togglingSession}
          style={{
            ...btnBase, gap: 8, height: 48, padding: "0 22px", borderRadius: 24,
            background: C.teal, color: "#fff", fontSize: 14, fontWeight: 600,
            opacity: togglingSession ? 0.6 : 1,
            cursor: togglingSession ? "not-allowed" : "pointer",
          }}
        >
          <Glyph d={PATH.play} size={20} color="#fff" />
          {togglingSession ? "Starting…" : "Start session"}
        </button>
      )}
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, paddingRight: 8 }}>
      {/* Participants */}
      <button
        className="bc-btn"
        onClick={onToggleParticipantsPanel}
        aria-label="Session participants"
        aria-pressed={participantsPanelOpen}
        title="Session participants"
        style={{
          ...btnBase, width: 48, height: 48, borderRadius: "50%", position: "relative",
          background: participantsPanelOpen ? "#4ADE8022" : D.surface,
          border: participantsPanelOpen ? "1px solid #4ADE8055" : "1px solid transparent",
        }}
      >
        <Glyph
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          size={22}
          color={participantsPanelOpen ? "#4ADE80" : D.text}
        />
        {participantCount > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2, minWidth: 18, height: 18,
            borderRadius: 9, background: "#4ADE80", color: "#0D0D0D",
            fontSize: 11, fontWeight: 700, lineHeight: "18px", textAlign: "center",
            padding: "0 4px",
          }}>
            {participantCount}
          </span>
        )}
      </button>

      {/* Requests */}
      <button
        className="bc-btn"
        onClick={onToggleRequestsPanel}
        aria-label="Student requests"
        aria-pressed={requestsPanelOpen}
        title="Student requests"
        style={{
          ...btnBase, width: 48, height: 48, borderRadius: "50%", position: "relative",
          background: requestsPanelOpen ? D.panelOn : D.surface,
        }}
      >
        <Glyph
          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
          size={22}
          color={requestsPanelOpen ? D.panelFg : D.text}
        />
        {requestCount > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2, minWidth: 18, height: 18,
            borderRadius: 9, background: D.end, color: "#fff",
            fontSize: 11, fontWeight: 700, lineHeight: "18px", textAlign: "center",
            padding: "0 4px",
          }}>
            {requestCount}
          </span>
        )}
      </button>

      {/* Messages */}
      <button
        className="bc-btn"
        onClick={onTogglePanel}
        aria-label="Messages to students"
        aria-pressed={panelOpen}
        title="Messages to students"
        style={{ ...btnBase, width: 48, height: 48, borderRadius: "50%", background: panelOpen ? D.panelOn : D.surface }}
      >
        <Glyph d={PATH.chat} size={22} color={panelOpen ? D.panelFg : D.text} />
      </button>
    </div>
  </div>
);

export default ControlBar;