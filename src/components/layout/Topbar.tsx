import React from "react";
import { Colors as C, FontSize } from "../../styles/tokens";
import {} from "../ui";
import Icon from "../ui/Icon";
import type { NavPage } from "../../types";

const PAGE_TITLES: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard",     subtitle: "Overview of your classroom activity"  },
  students:  { title: "Students",      subtitle: "Manage your class roster"              },
  broadcast: { title: "STT Broadcast", subtitle: "Broadcast live captions to students"  },
  livecc:    { title: "Live CC Log",   subtitle: "Full session transcript"               },
  settings:  { title: "Settings",      subtitle: "Manage your profile and preferences"  },
};

interface TopbarProps {
  page: NavPage;
}

const Topbar: React.FC<TopbarProps> = ({ page }) => {
  const { title, subtitle } = PAGE_TITLES[page];

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
          lineHeight: 1.1,
        }}>
          {title}
        </h1>
        <div style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 2 }}>
          {subtitle}
        </div>
      </div>

      {/* Notification bell */}
      <div style={{
        position: "relative", cursor: "pointer",
        width: 36, height: 36, borderRadius: 10,
        background: C.gray, border: `1px solid ${C.gray2}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = C.gray2}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = C.gray}
      >
        <Icon name="bell" size={16} color={C.text2} />
        <div style={{
          position: "absolute", top: 6, right: 6,
          width: 7, height: 7, borderRadius: "50%",
          background: C.redDark, border: `2px solid ${C.white}`,
        }} />
      </div>
    </header>
  );
};

export default Topbar;