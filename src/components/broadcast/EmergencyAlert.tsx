import React, { useState } from "react";
import { btnBase } from "./theme";
import type { CommRequest } from "../../hooks/useBroadcastSession";
import { useEmergencyAlarm }    from "../../hooks/useEmergencyAlarm";
import EmergencyStudentGroup    from "./EmergencyStudentGroup";

interface EmergencyAlertProps {
  requests: CommRequest[];
  onAcknowledge: (id: string) => void;
  onDismiss: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ requests, onAcknowledge, onDismiss }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEmergencyAlarm(requests);

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

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "em-bg-flash 1.1s ease-in-out infinite",
      }}>
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

          {/* Header */}
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

          {/* Student groups */}
          <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {groups.map(([studentName, reqs]) => (
              <EmergencyStudentGroup
                key={studentName}
                studentName={studentName}
                reqs={reqs}
                isExpanded={expanded.has(studentName)}
                onToggleExpand={() => toggleExpand(studentName)}
                onAcknowledge={onAcknowledge}
              />
            ))}
          </div>

          {/* Footer */}
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
