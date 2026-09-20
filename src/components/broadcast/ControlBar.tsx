import React from "react";
import Icon from "../ui/Icon";
import { Colors as C } from "../../styles/tokens";
import { D, PATH, Glyph, btnBase } from "./theme";
import MicHintTooltip from "./MicHintTooltip";

interface ControlBarProps {
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
}

/** Bottom bar: session code (left) · mic + start/end (center) · panel toggle (right). */
const ControlBar: React.FC<ControlBarProps> = ({
  sessionActive, sessionCode, recording, micOff, showHint, onDismissHint,
  onToggleMic, togglingSession, onToggleSession, panelOpen, onTogglePanel,
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, paddingTop: 12 }}>

    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, paddingLeft: 8, fontSize: 14 }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: sessionActive ? "#22C55E" : "#5F6368",
        boxShadow: sessionActive ? "0 0 0 3px rgba(34,197,94,0.25)" : "none",
      }} />
      {sessionActive ? (
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

      {sessionActive ? (
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

    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 8 }}>
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
