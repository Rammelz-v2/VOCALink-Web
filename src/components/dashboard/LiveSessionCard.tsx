import React, { useState } from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../../styles/tokens";
import { colorFor } from "../broadcast/theme";
import type { SessionParticipant } from "../../types";

interface LiveSessionCardProps {
  loading: boolean;
  sessionActive: boolean;
  sessionCode: string | null;
  participants: SessionParticipant[];
  onGoToBroadcast: () => void;
}

const shimmer: React.CSSProperties = {
  background: "linear-gradient(90deg, #E2E8F0 25%, #EEF2FF 50%, #E2E8F0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: 8,
};

const LiveSessionCard: React.FC<LiveSessionCardProps> = ({
  loading, sessionActive, sessionCode, participants, onGoToBroadcast,
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!sessionCode) return;
    navigator.clipboard.writeText(sessionCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      flex: 1, background: C.white, borderRadius: Radius.lg,
      border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${C.gray2}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: C.gray,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: loading ? "#CBD5E1" : sessionActive ? "#22C55E" : "#94A3B8",
            boxShadow: (!loading && sessionActive) ? "0 0 0 3px rgba(34,197,94,0.2)" : "none",
          }} />
          {loading ? (
            <div style={{ ...shimmer, width: 110, height: 16 }} />
          ) : (
            <span style={{ fontSize: FontSize.md, fontWeight: 700, color: C.text }}>
              {sessionActive ? "Session Live" : "No Active Session"}
            </span>
          )}
        </div>
        {!loading && sessionActive && (
          <span style={{
            fontSize: FontSize.xs, fontWeight: 600, color: "#16A34A",
            background: "#DCFCE7", padding: "3px 10px", borderRadius: 999,
          }}>
            LIVE
          </span>
        )}
      </div>

      <div style={{ padding: "24px 20px" }}>
        {loading ? (
          /* Skeleton content */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...shimmer, width: "70%", height: 20 }} />
            <div style={{ ...shimmer, width: "100%", height: 72, borderRadius: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ ...shimmer, width: 80, height: 32, borderRadius: 999 }} />
              <div style={{ ...shimmer, width: 80, height: 32, borderRadius: 999 }} />
            </div>
            <div style={{ ...shimmer, width: "100%", height: 40, borderRadius: 8 }} />
          </div>
        ) : sessionActive && sessionCode ? (
          <>
            {/* Session code display */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: FontSize.xs, color: C.text3, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                Share this code with your students
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  flex: 1, background: "linear-gradient(135deg, #0F172A, #1E293B)",
                  borderRadius: Radius.md, padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontSize: 36, fontWeight: 900, color: "#FFFFFF",
                    letterSpacing: "0.22em", fontFamily: "monospace",
                  }}>
                    {sessionCode}
                  </span>
                </div>
                <button
                  onClick={copyCode}
                  style={{
                    padding: "12px 18px", borderRadius: Radius.md, border: `1px solid ${C.gray2}`,
                    background: copied ? "#DCFCE7" : C.white, cursor: "pointer",
                    fontSize: FontSize.sm, fontWeight: 600,
                    color: copied ? "#16A34A" : C.text2,
                    transition: "all 0.15s", flexShrink: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {copied
                      ? <polyline points="20 6 9 17 4 12" />
                      : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
                    }
                  </svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Participants */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: FontSize.xs, color: C.text3, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                {participants.length} student{participants.length !== 1 ? "s" : ""} joined
              </div>
              {participants.length === 0 ? (
                <div style={{ fontSize: FontSize.sm, color: C.text3, fontStyle: "italic" }}>
                  Waiting for students to join...
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {participants.slice(0, 8).map(p => {
                    const initials = p.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                    const color = colorFor(p.name);
                    return (
                      <div key={p.id} title={p.name} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: C.gray, border: `1px solid ${C.gray2}`,
                        borderRadius: 999, padding: "4px 10px 4px 4px",
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: color, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "#0D0D0D", flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontSize: FontSize.xs, fontWeight: 500, color: C.text2 }}>
                          {p.name.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                  {participants.length > 8 && (
                    <div style={{
                      background: C.gray, border: `1px solid ${C.gray2}`,
                      borderRadius: 999, padding: "4px 12px",
                      fontSize: FontSize.xs, fontWeight: 600, color: C.text2,
                      display: "flex", alignItems: "center",
                    }}>
                      +{participants.length - 8} more
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onGoToBroadcast}
              style={{
                width: "100%", padding: "11px 0", borderRadius: Radius.md,
                background: "linear-gradient(135deg, #1AADDC, #0E8DB8)",
                border: "none", cursor: "pointer",
                fontSize: FontSize.sm, fontWeight: 700, color: "#FFFFFF",
                boxShadow: "0 3px 10px rgba(26,173,220,0.35)",
                transition: "filter 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ""}
            >
              Go to Live Room →
            </button>
          </>
        ) : (
          /* No active session state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 16, textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: C.blueLight,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E8DB8" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: FontSize.md, fontWeight: 700, color: C.text }}>
                No session running
              </div>
              <div style={{ fontSize: FontSize.sm, color: C.text3, marginTop: 4 }}>
                Start a broadcast to generate a session code that students can use to join.
              </div>
            </div>
            <button
              onClick={onGoToBroadcast}
              style={{
                padding: "10px 24px", borderRadius: Radius.md,
                background: "linear-gradient(135deg, #1AADDC, #0E8DB8)",
                border: "none", cursor: "pointer",
                fontSize: FontSize.sm, fontWeight: 700, color: "#FFFFFF",
                boxShadow: "0 3px 10px rgba(26,173,220,0.35)",
              }}
            >
              Start Broadcast
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionCard;
