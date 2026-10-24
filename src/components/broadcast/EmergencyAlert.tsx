import React, { useEffect, useRef, useState } from "react";
import { btnBase } from "./theme";
import type { CommRequest } from "../../hooks/useBroadcastSession";

interface EmergencyAlertProps {
  requests: CommRequest[];
  onAcknowledge: (id: string) => void;
  onDismiss: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ requests, onAcknowledge, onDismiss }) => {
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Group requests by student so one student with 4 taps = one card, not 4
  const groups: [string, CommRequest[]][] = Object.entries(
    requests.reduce<Record<string, CommRequest[]>>((acc, r) => {
      (acc[r.student_name] ??= []).push(r);
      return acc;
    }, {})
  );

  const toggleExpand = (name: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const playAlarm = (ctx: AudioContext) => {
    // Whoop-whoop siren pattern: alternating high/low square waves
    const pattern: Array<{ freq: number; t: number; dur: number }> = [
      { freq: 960, t: 0.00, dur: 0.14 },
      { freq: 720, t: 0.16, dur: 0.14 },
      { freq: 960, t: 0.32, dur: 0.14 },
      { freq: 720, t: 0.48, dur: 0.14 },
      { freq: 960, t: 0.64, dur: 0.14 },
      { freq: 720, t: 0.80, dur: 0.14 },
    ];
    pattern.forEach(({ freq, t, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.connect(gain);
      gain.connect(ctx.destination);
      const s = ctx.currentTime + t;
      osc.frequency.setValueAtTime(freq, s);
      gain.gain.setValueAtTime(0.28, s);
      gain.gain.exponentialRampToValueAtTime(0.001, s + dur);
      osc.start(s);
      osc.stop(s + dur + 0.01);
    });
  };

  useEffect(() => {
    // ── Audio alarm (repeats every 2.5 s) ──────────────────────────────────
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      // Resume in case browser suspended the context before user interaction
      ctx.resume().then(() => {
        playAlarm(ctx);
        alarmTimerRef.current = setInterval(() => playAlarm(ctx), 2500);
      });
    } catch {}

    // ── Browser / OS notification (shows even when tab is not focused) ──────
    const studentNames = [...new Set(requests.map(r => r.student_name))].join(", ");
    const sendOSNotification = () => {
      try {
        new Notification("🚨 EMERGENCY", {
          body: `${studentNames} needs immediate help — respond now!`,
          tag: "vocalink-emergency",
          requireInteraction: true,
        });
      } catch {}
    };
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        sendOSNotification();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(p => {
          if (p === "granted") sendOSNotification();
        });
      }
    }

    // ── Flash the browser tab title ─────────────────────────────────────────
    const originalTitle = document.title;
    let titleFlip = false;
    const titleTimer = setInterval(() => {
      document.title = (titleFlip = !titleFlip)
        ? "🚨 EMERGENCY — Respond now!"
        : originalTitle;
    }, 700);

    // ── Vibration (mobile/tablet devices) ──────────────────────────────────
    try { navigator.vibrate?.([400, 150, 400, 150, 400]); } catch {}

    return () => {
      if (alarmTimerRef.current) clearInterval(alarmTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
      clearInterval(titleTimer);
      document.title = originalTitle;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="em-title"
      aria-live="assertive"
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
    >
      <style>{`
        @keyframes em-bg-flash {
          0%, 100% { background: rgba(0, 0, 0, 0.88); }
          50%       { background: rgba(160, 0, 0, 0.78); }
        }
        @keyframes em-fadein {
          from { opacity: 0; transform: scale(0.86) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes em-glow {
          0%, 100% { box-shadow: 0 0  0  0  rgba(255,23,68,0.85), 0 12px 64px rgba(220,54,46,0.30); }
          50%       { box-shadow: 0 0  0 22px rgba(255,23,68,0),   0 12px 80px rgba(220,54,46,0.55); }
        }
        @keyframes em-header-flash {
          0%, 100% { background: linear-gradient(130deg, #C62828, #B71C1C); }
          50%       { background: linear-gradient(130deg, #FF1744, #D32F2F); }
        }
        @keyframes em-title-blink {
          0%, 100% { opacity: 1; }
          45%, 55% { opacity: 0.55; }
        }
        @keyframes em-icon-shake {
          0%,  10%, 100% { transform: rotate(0deg)   scale(1);    }
          20%            { transform: rotate(-14deg)  scale(1.15); }
          30%            { transform: rotate(14deg)   scale(1.15); }
          40%            { transform: rotate(-10deg)  scale(1.1);  }
          50%            { transform: rotate(10deg)   scale(1.1);  }
          60%            { transform: rotate(-6deg)   scale(1.05); }
          70%            { transform: rotate(6deg)    scale(1.05); }
          80%            { transform: rotate(0deg)    scale(1);    }
        }
        @keyframes em-card-shake {
          /* Shakes for the first 8% of the cycle, still for the rest */
          0%   { transform: translateX(0); }
          1%   { transform: translateX(-8px); }
          2%   { transform: translateX(8px);  }
          3%   { transform: translateX(-8px); }
          4%   { transform: translateX(8px);  }
          5%   { transform: translateX(-5px); }
          6%   { transform: translateX(5px);  }
          8%, 100% { transform: translateX(0); }
        }
        @keyframes em-btn-pulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(255,23,68,0.45); transform: scale(1);    }
          50%       { box-shadow: 0 2px 24px rgba(255,23,68,0.80); transform: scale(1.04); }
        }
      `}</style>

      {/* ── Flashing backdrop ─────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "em-bg-flash 1.1s ease-in-out infinite",
      }}>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div style={{
          position: "relative",
          width: "min(600px, 94vw)",
          borderRadius: 24,
          overflow: "hidden",
          border: "3px solid #FF1744",
          background: "#180B0A",
          animation: [
            "em-fadein 0.25s cubic-bezier(.4,0,.2,1) both",
            "em-glow 1.1s ease-in-out infinite",
            "em-card-shake 8s ease-in-out infinite",
          ].join(", "),
        }}>

          {/* ── Header ──────────────────────────────────────────── */}
          <div style={{
            padding: "24px 28px",
            display: "flex", alignItems: "center", gap: 20,
            animation: "em-header-flash 1.1s ease-in-out infinite",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              animation: "em-icon-shake 2s ease-in-out infinite",
            }}>
              <svg viewBox="0 0 24 24" width={38} height={38} fill="#fff" aria-hidden="true">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </div>

            <div style={{ minWidth: 0 }}>
              <div id="em-title" style={{
                fontSize: 28, fontWeight: 900, color: "#fff",
                letterSpacing: "1.5px", lineHeight: 1,
                textTransform: "uppercase",
                animation: "em-title-blink 1.1s ease-in-out infinite",
              }}>
                🚨 EMERGENCY
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.90)", marginTop: 7, lineHeight: 1.4 }}>
                {(() => {
                  const names = [...new Set(requests.map(r => r.student_name))];
                  return names.length === 1
                    ? `${names[0]} needs immediate help — respond now!`
                    : `${names.length} students need immediate help — respond now!`;
                })()}
              </div>
            </div>
          </div>

          {/* ── Student cards (grouped) ─────────────────────────── */}
          <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {groups.map(([studentName, reqs]) => {
              const isMulti  = reqs.length > 1;
              const isOpen   = expanded.has(studentName);
              const firstNote = reqs[0].note;

              return (
                <div key={studentName} style={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,23,68,0.40)",
                  overflow: "hidden",
                }}>

                  {/* ── Collapsed header row ── */}
                  <div
                    onClick={isMulti ? () => toggleExpand(studentName) : undefined}
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 14,
                      background: "rgba(255,23,68,0.14)",
                      padding: "14px 18px",
                      cursor: isMulti ? "pointer" : "default",
                    }}
                  >
                    {/* Left: name + badge / note */}
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
                          <span style={{
                            flexShrink: 0, fontSize: 14,
                            color: "rgba(255,255,255,0.50)",
                          }}>
                            {isOpen ? "▲" : "▼"}
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

                    {/* Right: acknowledge button */}
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

                  {/* ── Expanded sub-rows ── */}
                  {isMulti && isOpen && (
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
            })}
          </div>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div style={{
            padding: "0 24px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", lineHeight: 1.5 }}>
              Alarm repeats until acknowledged
            </div>
            <button
              className="bc-btn"
              onClick={onDismiss}
              style={{
                ...btnBase,
                height: 32, padding: "0 14px", borderRadius: 16,
                background: "rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.50)",
                fontSize: 12,
              }}
            >
              Dismiss for now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;
