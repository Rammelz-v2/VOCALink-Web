import React from "react";
import { D, PATH, Glyph, btnBase } from "./theme";
import IconButton from "./IconButton";

const QUICK_PHRASES = [
  "Listen carefully.",
  "Good job!",
  "Quiet please.",
  "Eyes on me.",
  "Raise your hand.",
  "Please wait.",
  "Open your books.",
  "Well done!",
];

interface MessagesPanelProps {
  onClose: () => void;
  chatRef: React.RefObject<HTMLDivElement | null>;
  sentLines: string[];
  manualText: string;
  setManualText: (v: string) => void;
  onSend: () => void;
  onQuickSend: (text: string) => void;
  sessionActive: boolean;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({
  onClose, chatRef, sentLines, manualText, setManualText, onSend, onQuickSend, sessionActive,
}) => (
  <aside style={{
    width: 340, maxWidth: "45%", flexShrink: 0, display: "flex", flexDirection: "column",
    background: D.surface, borderRadius: 16, overflow: "hidden",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 8px 10px 20px" }}>
      <div style={{ fontSize: 17, fontWeight: 500 }}>Messages to students</div>
      <IconButton size={40} onClick={onClose} aria-label="Close panel">
        <Glyph d={PATH.close} size={22} color={D.text} />
      </IconButton>
    </div>

    <div
      ref={chatRef}
      style={{
        flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 12px",
        display: "flex", flexDirection: "column", gap: 8,
        scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent",
      }}
    >
      {sentLines.length === 0 ? (
        <div style={{ fontSize: 14, color: D.dim, lineHeight: 1.5, padding: "4px 4px" }}>
          Everything you say or type is sent to students, and it shows up here.
        </div>
      ) : sentLines.map((line, i) => (
        <div key={i} style={{
          alignSelf: "flex-start", maxWidth: "92%", padding: "8px 12px",
          borderRadius: 12, fontSize: 14, lineHeight: 1.45, wordBreak: "break-word",
          background: "rgba(0,174,239,0.16)",
        }}>
          {line}
        </div>
      ))}
    </div>

    {/* Quick-phrase chips */}
    <div style={{
      display: "flex", gap: 6, overflowX: "auto", padding: "0 12px 8px",
      scrollbarWidth: "none",
    }}>
      {QUICK_PHRASES.map(p => (
        <button
          key={p}
          onClick={() => onQuickSend(p)}
          disabled={!sessionActive}
          title={p}
          style={{
            flexShrink: 0, padding: "5px 12px", borderRadius: 20,
            background: "rgba(0,174,239,0.12)", border: "1px solid rgba(0,174,239,0.22)",
            color: D.text, fontSize: 12, fontWeight: 500, cursor: sessionActive ? "pointer" : "not-allowed",
            opacity: sessionActive ? 1 : 0.4, whiteSpace: "nowrap",
            fontFamily: "inherit", transition: "background 0.15s",
          }}
        >
          {p}
        </button>
      ))}
    </div>

    <div
      className="bc-field"
      style={{
        display: "flex", alignItems: "center", gap: 4, margin: "0 12px 12px",
        padding: "4px 4px 4px 16px", borderRadius: 24, background: D.field,
        opacity: sessionActive ? 1 : 0.5,
      }}
    >
      <input
        value={manualText}
        onChange={e => setManualText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSend()}
        disabled={!sessionActive}
        placeholder={sessionActive ? "Type a message to students" : "Start a session to send messages"}
        aria-label="Message to students"
        style={{
          flex: 1, minWidth: 0, border: "none", outline: "none",
          background: "transparent", color: D.text, fontSize: 14,
          fontFamily: "inherit", padding: "8px 0",
        }}
      />
      <button
        className="bc-btn"
        onClick={onSend}
        disabled={!sessionActive || !manualText.trim()}
        aria-label="Send message"
        style={{
          ...btnBase, width: 36, height: 36, borderRadius: "50%", background: "transparent",
          opacity: manualText.trim() ? 1 : 0.4,
          cursor: manualText.trim() && sessionActive ? "pointer" : "not-allowed",
        }}
      >
        <Glyph d={PATH.send} size={20} color={D.focus} />
      </button>
    </div>
  </aside>
);

export default MessagesPanel;