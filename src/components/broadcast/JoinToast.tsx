import React, { useEffect } from "react";
import type { SessionParticipant } from "../../types";
import { colorFor } from "./theme";

const AUTO_DISMISS_MS = 6000;

interface JoinToastProps {
  participant: SessionParticipant;
  type?: "join" | "leave";
  onDismiss: () => void;
}

const JoinToast: React.FC<JoinToastProps> = ({ participant: p, type = "join", onDismiss }) => {
  const isLeave    = type === "leave";
  const accentColor = isLeave ? "#F87171" : "#4ADE80";
  const color      = colorFor(p.name);

  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      ctx.resume().then(() => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(isLeave ? 659 : 523, ctx.currentTime);
        osc.frequency.setValueAtTime(isLeave ? 440 : 659, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      });
    } catch {}

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = p.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      pointerEvents: "all",
      width: 300,
      borderRadius: 14,
      overflow: "hidden",
      background: isLeave ? "#2A1E1E" : "#1E2A1E",
      border: `1px solid ${accentColor}33`,
      boxShadow: "0 6px 28px rgba(0,0,0,0.55)",
      animation: "jt-in 0.28s cubic-bezier(.4,0,.2,1) both",
    }}>
      <style>{`
        @keyframes jt-in {
          from { opacity: 0; transform: translateX(64px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes jt-bar {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      <div style={{ height: 3, background: accentColor, flexShrink: 0 }} />

      <div style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#0D0D0D",
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#E8EAED",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {p.name}
          </div>
          <div style={{ fontSize: 12, color: accentColor, fontWeight: 500, marginTop: 1 }}>
            {isLeave ? "Left the session" : "Joined the session"}
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "#6B7280", fontSize: 17, lineHeight: 1,
            padding: 0, flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      <div style={{
        height: 2, background: accentColor,
        transformOrigin: "left center",
        animation: `jt-bar ${AUTO_DISMISS_MS}ms linear both`,
      }} />
    </div>
  );
};

export default JoinToast;
