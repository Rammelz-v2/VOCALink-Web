import React, { useEffect } from "react";
import { btnBase } from "./theme";
import type { CommRequest } from "../../hooks/useBroadcastSession";

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  medication: { label: "Needs medication",   color: "#F59E0B", icon: "💊" },
  bathroom:   { label: "Needs the bathroom", color: "#3B82F6", icon: "🚻" },
  assistance: { label: "Needs assistance",   color: "#A78BFA", icon: "🙋" },
};

const AUTO_DISMISS_MS = 9000;

// ── Individual toast ─────────────────────────────────────────────────────────

interface ToastProps {
  request: CommRequest;
  onAcknowledge: () => void;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ request: r, onAcknowledge, onDismiss }) => {
  const cfg = TYPE_CONFIG[r.request_type] ?? {
    label: r.request_type, color: "#6B7280", icon: "📢",
  };

  useEffect(() => {
    // Soft two-note chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      ctx.resume().then(() => {
        const play = (freq: number, t: number) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.55);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.55);
        };
        play(660, 0);
        play(880, 0.22);
      });
    } catch {}

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      pointerEvents: "all",
      width: 320,
      borderRadius: 14,
      overflow: "hidden",
      background: "#24262A",
      border: "1px solid rgba(255,255,255,0.09)",
      boxShadow: "0 6px 28px rgba(0,0,0,0.55)",
      display: "flex",
      flexDirection: "column",
      animation: "rt-in 0.28s cubic-bezier(.4,0,.2,1) both",
    }}>
      <style>{`
        @keyframes rt-in {
          from { opacity: 0; transform: translateX(72px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes rt-bar {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {/* Accent top strip */}
      <div style={{ height: 4, background: cfg.color, flexShrink: 0 }} />

      {/* Body */}
      <div style={{
        padding: "12px 12px 10px 14px",
        display: "flex", gap: 11, alignItems: "flex-start",
      }}>
        {/* Icon */}
        <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: "#E8EAED",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {r.student_name}
          </div>
          <div style={{ fontSize: 13, color: cfg.color, fontWeight: 500, marginTop: 2 }}>
            {cfg.label}
          </div>
          {r.note && (
            <div style={{ fontSize: 12, color: "#8A9099", marginTop: 3 }}>{r.note}</div>
          )}
        </div>

        {/* Dismiss × */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            ...btnBase,
            width: 22, height: 22, borderRadius: "50%",
            background: "transparent",
            color: "#6B7280",
            fontSize: 17, lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Acknowledge button */}
      <div style={{ padding: "0 12px 11px" }}>
        <button
          className="bc-btn"
          onClick={onAcknowledge}
          style={{
            ...btnBase,
            width: "100%", height: 30, borderRadius: 8,
            background: cfg.color + "1F",
            color: cfg.color,
            fontSize: 12, fontWeight: 700,
            border: `1px solid ${cfg.color}44`,
            letterSpacing: "0.2px",
          }}
        >
          Acknowledge
        </button>
      </div>

      {/* Auto-dismiss progress bar (shrinks to zero over AUTO_DISMISS_MS) */}
      <div style={{
        height: 3,
        background: cfg.color,
        transformOrigin: "left center",
        animation: `rt-bar ${AUTO_DISMISS_MS}ms linear both`,
        flexShrink: 0,
      }} />
    </div>
  );
};

// ── Stack ────────────────────────────────────────────────────────────────────

interface RequestToastStackProps {
  toasts: CommRequest[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

const RequestToastStack: React.FC<RequestToastStackProps> = ({ toasts, onAcknowledge, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      right: 24,
      zIndex: 9000,
      display: "flex",
      flexDirection: "column-reverse",
      gap: 10,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <Toast
          key={t.id}
          request={t}
          onAcknowledge={() => { onAcknowledge(t.id); onDismiss(t.id); }}
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
};

export default RequestToastStack;
