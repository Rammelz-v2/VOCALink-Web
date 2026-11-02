import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import {} from "../ui";
import Icon from "../ui/Icon";
import type { NavPage } from "../../types";

const PAGE_TITLES: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard",     subtitle: "Overview of your classroom activity" },
  broadcast: { title: "STT Broadcast", subtitle: "Broadcast live captions to students" },
  livecc:    { title: "Live CC Log",   subtitle: "Full session transcript"              },
  settings:  { title: "Settings",      subtitle: "Manage your profile and preferences" },
};

interface TopbarProps {
  page: NavPage;
  pendingCount?: number;
  onBellClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ page, pendingCount = 0, onBellClick }) => {
  const { title, subtitle } = PAGE_TITLES[page];
  const [bellOpen, setBellOpen] = React.useState(false);

  const handleBellClick = () => {
    setBellOpen(o => !o);
    onBellClick?.();
  };

  // Close dropdown when clicking outside
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  return (
    <header style={{
      background: C.white,
      borderBottom: `1px solid ${C.gray2}`,
      display: "flex", alignItems: "center",
      padding: "0 28px", gap: 16, flexShrink: 0,
      height: 64,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: FontSize.lg, fontWeight: 700,
          color: C.text, letterSpacing: "-0.5px",
          lineHeight: 1.2, margin: 0,
        }}>
          {title}
        </h1>
        <div style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 3, lineHeight: 1 }}>
          {subtitle}
        </div>
      </div>

      {/* Notification bell */}
      <div ref={ref} style={{ position: "relative" }}>
        <div
          onClick={handleBellClick}
          style={{
            cursor: "pointer",
            width: 36, height: 36, borderRadius: Radius.md,
            background: bellOpen ? C.gray2 : C.gray,
            border: `1px solid ${C.gray2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
            position: "relative",
          }}
          onMouseEnter={e => { if (!bellOpen) (e.currentTarget as HTMLDivElement).style.background = C.gray2; }}
          onMouseLeave={e => { if (!bellOpen) (e.currentTarget as HTMLDivElement).style.background = C.gray; }}
        >
          <Icon name="bell" size={16} color={C.text2} />
          {pendingCount > 0 && (
            <div style={{
              position: "absolute", top: 6, right: 6,
              width: 7, height: 7, borderRadius: "50%",
              background: C.redDark, border: `2px solid ${C.white}`,
            }} />
          )}
        </div>

        {/* Dropdown panel */}
        {bellOpen && (
          <div style={{
            position: "absolute", top: 42, right: 0,
            width: 260, borderRadius: Radius.lg,
            background: C.white, border: `1px solid ${C.gray2}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden", zIndex: 1000,
          }}>
            <div style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${C.gray2}`,
              fontSize: FontSize.sm, fontWeight: 700, color: C.text,
              background: C.gray,
            }}>
              Notifications
            </div>
            <div style={{ padding: "14px 16px" }}>
              {pendingCount > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: Radius.md, flexShrink: 0,
                    background: "linear-gradient(135deg, #EA580C, #C2410C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: FontSize.sm, fontWeight: 600, color: C.text }}>
                      {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 2 }}>
                      Check your Dashboard to review
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 0", textAlign: "center" }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <span style={{ fontSize: FontSize.sm, color: C.text3, fontWeight: 500 }}>
                    No pending requests
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
