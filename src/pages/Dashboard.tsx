import React, { useEffect, useState } from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../styles/tokens";
import { Avatar, Button } from "../components/ui";
import type { NavPage, Student } from "../types";
import api from "../services/api";

const AVATAR_PALETTE = [
  { bg: "#E0F6FD", color: "#0E8DB8" },
  { bg: "#FEF3C7", color: "#B45309" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#D1FAE5", color: "#065F46" },
];

function avatarColor(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

function displayName(s: { first_name: string; last_name: string; username: string }) {
  return (s.first_name || s.last_name) ? `${s.first_name} ${s.last_name}`.trim() : s.username;
}

interface DashboardProps {
  setActive: (page: NavPage) => void;
}

const StatCard: React.FC<{
  value: number | string;
  label: string;
  bg: string;
  iconBg: string;
  icon: React.ReactNode;
  trend?: string;
}> = ({ value, label, bg, iconBg, icon, trend }) => (
  <div style={{
    flex: 1, borderRadius: Radius.lg, padding: "20px 22px",
    background: bg, border: `1px solid rgba(0,0,0,0.06)`,
    boxShadow: Shadow.md, position: "relative", overflow: "hidden",
  }}>
    {/* Decorative circle */}
    <div style={{
      position: "absolute", right: -20, top: -20,
      width: 100, height: 100, borderRadius: "50%",
      background: "rgba(255,255,255,0.15)",
    }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-1.5px", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: FontSize.sm, color: "#475569", marginTop: 6, fontWeight: 500 }}>
          {label}
        </div>
        {trend && (
          <div style={{ fontSize: FontSize.xs, color: "#22C55E", marginTop: 4, fontWeight: 600 }}>
            {trend}
          </div>
        )}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: Radius.md,
        background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub: string;
  gradient: string;
  onClick: () => void;
}> = ({ icon, label, sub, gradient, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: Radius.md, cursor: "pointer",
        border: `1px solid ${hovered ? C.tealBorder : C.gray2}`,
        background: hovered ? C.tealLight : C.white,
        transition: "all 0.15s", boxShadow: hovered ? Shadow.md : "none",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: Radius.sm,
        background: gradient, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: FontSize.base, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontSize: FontSize.xs, color: C.text3 }}>{sub}</div>
      </div>
      <div style={{ marginLeft: "auto", color: C.text3, fontSize: 16 }}>›</div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ setActive }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [profile, setProfile]   = useState<any>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    api.get("/users/me/").then(res => setProfile(res.data)).catch(() => {});

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get("/teacher/students/");
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        const formatted: Student[] = data.map((s) => {
          const av = avatarColor(s.id);
          return {
            id: s.id, name: displayName(s),
            status: "idle" as const,
            bg: av.bg, color: av.color,
          };
        });
        setStudents(formatted);
      } catch {
        setError("Could not load students.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Welcome banner */}
      <div style={{
        borderRadius: Radius.xl,
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0E8DB8 100%)",
        padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: Shadow.lg, position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", right: 80, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(26,173,220,0.12)" }} />
        <div style={{ position: "absolute", right: -20, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(13,208,245,0.08)" }} />

        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: FontSize.xs, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            {today}
          </div>
          <div style={{ fontSize: FontSize.xl, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            Good morning, {profile?.first_name || profile?.display_name || "Teacher"} 👋
          </div>
          <div style={{ fontSize: FontSize.base, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
            {profile?.room_section || "Your classroom"} · {profile?.department || "SNED"}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => setActive("broadcast")}
          style={{ zIndex: 1, flexShrink: 0, boxShadow: "0 4px 16px rgba(26,173,220,0.4)" }}
        >
          🎙 Start Broadcast
        </Button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard
          value={students.length} label="Total Students"
          bg="linear-gradient(135deg, #F0F9FF, #E0F2FE)"
          iconBg="linear-gradient(135deg, #1AADDC, #0E8DB8)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>

      <div style={{ display: "flex", gap: 20 }}>

        {/* Student list */}
        <div style={{
          flex: 1, background: C.white, borderRadius: Radius.lg,
          border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
        }}>
          {/* Card header */}
          <div style={{
            padding: "16px 20px", borderBottom: `1px solid ${C.gray2}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
          }}>
            <div>
              <div style={{ fontSize: FontSize.md, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>
                Active Students
              </div>
              <div style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 2 }}>
                {loading ? "Loading..." : `${students.length} students in your class`}
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActive("broadcast")}>
              📡 Broadcast
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: 16, padding: "10px 14px", borderRadius: Radius.md, background: "#FEF2F2", border: "1px solid #FCA5A5", color: C.red, fontSize: FontSize.sm }}>
              ⚠ {error}
            </div>
          )}

          {/* Empty */}
          {!loading && students.length === 0 && !error && (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: FontSize.md, fontWeight: 600, color: C.text2 }}>No students yet</div>
              <div style={{ fontSize: FontSize.sm, color: C.text3, marginTop: 4 }}>Go to Students to add some</div>
              <Button variant="primary" size="sm" style={{ marginTop: 16 }} onClick={() => setActive("students")}>
                Add Students
              </Button>
            </div>
          )}

          {/* Student rows */}
          <div style={{ padding: "8px 0" }}>
            {students.map((s, i) => (
              <div
                key={s.id}
                onClick={() => { setActive("students"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 20px", cursor: "pointer",
                  borderBottom: i < students.length - 1 ? `1px solid ${C.gray}` : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar name={s.name} bg={s.bg} color={s.color} size={40} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: FontSize.base, fontWeight: 600, color: C.text }}>{s.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick actions */}
          <div style={{
            background: C.white, borderRadius: Radius.lg,
            border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 16px", borderBottom: `1px solid ${C.gray2}`,
              fontSize: FontSize.md, fontWeight: 700, color: C.text,
              background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
            }}>
              Quick Actions
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              <QuickAction
                onClick={() => setActive("broadcast")}
                gradient="linear-gradient(135deg, #1AADDC, #0E8DB8)"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>}
                label="STT Broadcast"
                sub="Speak to all students"
              />
              <QuickAction
                onClick={() => setActive("livecc")}
                gradient="linear-gradient(135deg, #0EA5E9, #0284C7)"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                label="Live CC Log"
                sub="Full session transcript"
              />
            </div>
          </div>

          {/* Session info */}
          <div style={{
            background: C.white, borderRadius: Radius.lg,
            border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 16px", borderBottom: `1px solid ${C.gray2}`,
              fontSize: FontSize.md, fontWeight: 700, color: C.text,
              background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
            }}>
              Session Info
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "Subject",  val: profile?.department   || "—", icon: "📚" },
                { key: "Section",  val: profile?.room_section || "—", icon: "🏫" },
                { key: "Date",     val: today.split(",")[0] + "," + today.split(",")[1], icon: "📅" },
                { key: "Period",   val: "8:00 – 10:00 AM",               icon: "⏰" },
              ].map(({ key, val, icon }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: FontSize.xs, color: C.text3, fontWeight: 500 }}>{key}</div>
                    <div style={{ fontSize: FontSize.sm, fontWeight: 600, color: C.text, marginTop: 1 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;