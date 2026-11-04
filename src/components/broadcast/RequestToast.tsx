import React, { useEffect } from "react";

const AUTO_DISMISS_MS = 6000;

const REQUEST_LABELS: Record<string, { emoji: string; label: string }> = {
  // Known emergency / medical types
  medication: { emoji: "💊", label: "Needs medication"  },
  bathroom:   { emoji: "🚻", label: "Needs the bathroom" },
  assistance: { emoji: "🙋", label: "Needs assistance"  },
  // Classroom request types (one per icon)
  help:       { emoji: "✋", label: "Needs help"             },
  water:      { emoji: "💧", label: "Wants water"            },
  food:       { emoji: "🍎", label: "Wants food"             },
  pencil:     { emoji: "✏️", label: "Needs a pencil"         },
  tissue:     { emoji: "🤧", label: "Needs a tissue"         },
  break:      { emoji: "⏸️", label: "Wants a break"         },
  rest:       { emoji: "😴", label: "Needs to rest"          },
  cold:       { emoji: "🥶", label: "Feeling cold"           },
  hot:        { emoji: "🥵", label: "Feeling too hot"        },
  too_loud:   { emoji: "🔇", label: "It's too loud"          },
  chair:      { emoji: "🪑", label: "Needs to fix their seat"},
  outside:    { emoji: "🌳", label: "Wants to go outside"   },
  bag:        { emoji: "🎒", label: "Needs their bag"        },
};

interface RequestToastProps {
  toast: { id: number; student_name: string; request_type: string; note?: string | null };
  onDismiss: () => void;
}

const RequestToast: React.FC<RequestToastProps> = ({ toast, onDismiss }) => {
  const accent = "#F59E0B";
  const { emoji, label } = REQUEST_LABELS[toast.request_type] ?? { emoji: "📢", label: toast.request_type };
  const displayLabel = toast.note || label;
  const initials = toast.student_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

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
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.7);
      });
    } catch {}
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      pointerEvents: "all",
      width: 300,
      borderRadius: 14,
      overflow: "hidden",
      background: "#201A00",
      border: `1px solid ${accent}44`,
      boxShadow: "0 6px 28px rgba(0,0,0,0.55)",
      animation: "jt-in 0.28s cubic-bezier(.4,0,.2,1) both",
    }}>
      <div style={{ height: 3, background: accent }} />
      <div style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "#92400E",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#FDE68A",
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#E8EAED",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {toast.student_name}
          </div>
          <div style={{ fontSize: 12, color: accent, fontWeight: 500, marginTop: 1 }}>
            {emoji} {displayLabel}
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
        height: 2, background: accent,
        transformOrigin: "left center",
        animation: `jt-bar ${AUTO_DISMISS_MS}ms linear both`,
      }} />
    </div>
  );
};

export default RequestToast;
