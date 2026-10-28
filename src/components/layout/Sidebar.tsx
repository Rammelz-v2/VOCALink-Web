import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import {} from "../ui";
import Icon from "../ui/Icon";
import type { NavPage } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

interface NavItem {
  id: NavPage;
  label: string;
  icon: "home" | "users" | "mic" | "msg" | "cc";
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",     icon: "home" },
  { id: "broadcast", label: "STT Broadcast", icon: "mic"  },
  { id: "livecc",    label: "Live CC Log",   icon: "cc"   },
];

interface SidebarProps {
  active: NavPage;
  setActive: (page: NavPage) => void;
  teacherName: string;
  teacherInitials: string;
  teacherPhoto: string | null;
  profileLoading?: boolean;
}

const HamburgerIcon: React.FC<{ color?: string }> = ({ color = "rgba(255,255,255,0.6)" }) => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0"  width="18" height="2" rx="1" fill={color} />
    <rect x="0" y="6"  width="14" height="2" rx="1" fill={color} />
    <rect x="0" y="12" width="10" height="2" rx="1" fill={color} />
  </svg>
);

const NavBtn: React.FC<{
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}> = ({ isActive, collapsed, onClick, icon, label, badge }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 10,
        padding: collapsed ? "10px 0" : "9px 12px",
        margin: "2px 8px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: Radius.md, cursor: "pointer",
        fontSize: FontSize.base,
        background: isActive
          ? "rgba(26,173,220,0.18)"
          : hovered ? C.sidebarHover : "transparent",
        color: isActive ? "#1AADDC" : hovered ? "rgba(255,255,255,0.85)" : C.sidebarText,
        fontWeight: isActive ? 600 : 400,
        transition: "all 0.15s",
        borderLeft: isActive ? `3px solid #1AADDC` : "3px solid transparent",
        overflow: "hidden", whiteSpace: "nowrap",
      }}
    >
      {icon}
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge != null && (
        <span style={{
          background: "#1AADDC", color: "#fff",
          fontSize: 10, fontWeight: 700,
          padding: "1px 7px", borderRadius: 999,
          minWidth: 18, textAlign: "center",
        }}>
          {badge}
        </span>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  active, setActive,
  teacherName, teacherInitials, teacherPhoto, profileLoading,
}) => {
  const { logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [settingsHovered, setSettingsHovered] = React.useState(false);
  const [logoutHovered,   setLogoutHovered]   = React.useState(false);
  const [themeHovered,    setThemeHovered]    = React.useState(false);
  const [collapsed,       setCollapsed]       = React.useState(false);
  const [toggleHovered,   setToggleHovered]   = React.useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const W = collapsed ? 64 : 232;

  return (
    <aside style={{
      width: W, minWidth: W,
      background: C.sidebar,
      display: "flex", flexDirection: "column",
      flexShrink: 0, height: "100vh",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      transition: "width 0.22s ease, min-width 0.22s ease",
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(26,173,220,0.22) 0%, rgba(13,208,245,0.08) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 8,
      }}>

        {/* Hamburger toggle — full-width clickable row */}
        <div
          onClick={() => setCollapsed(c => !c)}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "14px 0" : "14px 16px 10px",
            cursor: "pointer",
            gap: 10,
          }}
        >
          {/* Brand — hidden when collapsed */}
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: Radius.md, flexShrink: 0,
                background: "linear-gradient(135deg, #1AADDC, #0DD0F5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 3px 10px rgba(26,173,220,0.38)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="white"/>
                  <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="10.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#FFF", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                  VocaLink
                </div>
                <div style={{ fontSize: FontSize.xs, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                  Teacher Portal
                </div>
              </div>
            </div>
          )}

          {/* Hamburger icon */}
          <div style={{
            width: 32, height: 32, borderRadius: Radius.sm, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: toggleHovered ? "rgba(255,255,255,0.1)" : "transparent",
            transition: "background 0.15s",
          }}>
            <HamburgerIcon color={toggleHovered ? "#fff" : "rgba(255,255,255,0.55)"} />
          </div>
        </div>

        {/* Logo icon only shown under hamburger when collapsed */}
        {collapsed && (
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: Radius.md,
              background: "linear-gradient(135deg, #1AADDC, #0DD0F5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(26,173,220,0.38)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="white"/>
                <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="10.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Nav section label */}
      {!collapsed && (
        <div style={{
          padding: "4px 20px 6px",
          fontSize: FontSize.xs, fontWeight: 600,
          color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          Classroom
        </div>
      )}

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <NavBtn
              key={item.id}
              isActive={isActive}
              collapsed={collapsed}
              onClick={() => setActive(item.id)}
              icon={<Icon name={item.icon} size={15} color={isActive ? "#1AADDC" : "rgba(255,255,255,0.45)"} />}
              label={item.label}
              badge={item.badge}
            />
          );
        })}
      </div>

      {/* Bottom section */}
      <div style={{ padding: "8px 0 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Settings */}
        <div
          onClick={() => setActive("settings")}
          onMouseEnter={() => setSettingsHovered(true)}
          onMouseLeave={() => setSettingsHovered(false)}
          title={collapsed ? "Settings" : undefined}
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            margin: "2px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: Radius.md, cursor: "pointer", fontSize: FontSize.base,
            background: active === "settings" ? "rgba(26,173,220,0.18)" : settingsHovered ? C.sidebarHover : "transparent",
            color: active === "settings" ? "#1AADDC" : settingsHovered ? "rgba(255,255,255,0.85)" : C.sidebarText,
            fontWeight: active === "settings" ? 600 : 400,
            borderLeft: active === "settings" ? "3px solid #1AADDC" : "3px solid transparent",
            transition: "all 0.15s", whiteSpace: "nowrap", overflow: "hidden",
          }}
        >
          <Icon name="settings" size={15} color={active === "settings" ? "#1AADDC" : "rgba(255,255,255,0.45)"} />
          {!collapsed && <span>Settings</span>}
        </div>

        {/* Dark / light toggle */}
        <div
          onClick={toggleTheme}
          onMouseEnter={() => setThemeHovered(true)}
          onMouseLeave={() => setThemeHovered(false)}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            margin: "2px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: Radius.md, cursor: "pointer", fontSize: FontSize.base,
            background: themeHovered ? C.sidebarHover : "transparent",
            color: themeHovered ? "rgba(255,255,255,0.85)" : C.sidebarText,
            borderLeft: "3px solid transparent",
            transition: "all 0.15s", whiteSpace: "nowrap", overflow: "hidden",
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>{isDark ? "☀️" : "🌙"}</span>
          {!collapsed && (
            <span style={{ flex: 1 }}>{isDark ? "Light mode" : "Dark mode"}</span>
          )}
          {!collapsed && (
            <div style={{
              width: 32, height: 18, borderRadius: 999, flexShrink: 0,
              background: isDark ? C.teal : "rgba(255,255,255,0.2)",
              position: "relative", transition: "background 0.25s",
            }}>
              <div style={{
                position: "absolute", top: 2,
                left: isDark ? 14 : 2,
                width: 14, height: 14, borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                transition: "left 0.25s",
              }} />
            </div>
          )}
        </div>

        {/* Sign out */}
        <div
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          title={collapsed ? "Sign out" : undefined}
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            margin: "2px 8px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: Radius.md, cursor: "pointer", fontSize: FontSize.base,
            background: logoutHovered ? "rgba(226,75,74,0.12)" : "transparent",
            color: logoutHovered ? "#F87171" : C.sidebarText,
            borderLeft: "3px solid transparent",
            transition: "all 0.15s", whiteSpace: "nowrap", overflow: "hidden",
          }}
        >
          <Icon name="logout" size={15} color={logoutHovered ? "#F87171" : "rgba(255,255,255,0.45)"} />
          {!collapsed && <span>Sign out</span>}
        </div>

        {/* Teacher info */}
        {!collapsed ? (
          <div style={{
            margin: "0 8px 8px", padding: "10px 12px", borderRadius: Radius.md,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: teacherPhoto ? "transparent" : "linear-gradient(135deg, #1AADDC, #0DD0F5)",
              border: "2px solid rgba(26,173,220,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, overflow: "hidden",
            }}>
              {teacherPhoto
                ? <img src={teacherPhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{teacherInitials || "T"}</span>
              }
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              {profileLoading ? (
                <div style={{ height: 12, width: 80, borderRadius: 4, background: "rgba(255,255,255,0.12)" }} />
              ) : (
                <div style={{ fontSize: 12, fontWeight: 600, color: "#FFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {teacherName || "Teacher"}
                </div>
              )}
              <div style={{ fontSize: FontSize.xs, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>SNED Teacher</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: teacherPhoto ? "transparent" : "linear-gradient(135deg, #1AADDC, #0DD0F5)",
              border: "2px solid rgba(26,173,220,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {teacherPhoto
                ? <img src={teacherPhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{teacherInitials || "T"}</span>
              }
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
