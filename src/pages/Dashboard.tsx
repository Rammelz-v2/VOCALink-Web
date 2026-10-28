import React from "react";
import type { NavPage } from "../types";
import { useDashboardData } from "../hooks/useDashboardData";
import WelcomeBanner      from "../components/dashboard/WelcomeBanner";
import StatCard           from "../components/dashboard/StatCard";
import LiveSessionCard    from "../components/dashboard/LiveSessionCard";
import QuickActionsCard   from "../components/dashboard/QuickActionsCard";
import RecentSessionsCard from "../components/dashboard/RecentSessionsCard";

interface DashboardProps {
  setActive: (page: NavPage) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActive }) => {
  const {
    profile, today, sessionLoading, profileLoading,
    sessionActive, sessionCode,
    participants, pendingRequests, recentSessions,
  } = useDashboardData();

  const totalSessions = recentSessions.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <WelcomeBanner
        loading={profileLoading}
        today={today}
        teacherName={profile?.display_name || profile?.first_name || profile?.username || ""}
        roomSection={profile?.room_section}
        department={profile?.department}
        onStartBroadcast={() => setActive("broadcast")}
      />

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard
          value={sessionLoading ? "—" : participants.length}
          label="Active Students"
          bg="linear-gradient(135deg, #F0FDF4, #DCFCE7)"
          iconBg="linear-gradient(135deg, #16A34A, #15803D)"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          trend={sessionLoading ? undefined : sessionActive ? "In current session" : "No active session"}
        />
        <StatCard
          value={sessionLoading ? "—" : pendingRequests}
          label="Pending Requests"
          bg="linear-gradient(135deg, #FFF7ED, #FFEDD5)"
          iconBg="linear-gradient(135deg, #EA580C, #C2410C)"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          }
          trend={sessionLoading ? undefined : pendingRequests > 0 ? "Needs attention" : "All clear"}
        />
        <StatCard
          value={totalSessions}
          label="Recent Sessions"
          bg="linear-gradient(135deg, #F0F9FF, #E0F2FE)"
          iconBg="linear-gradient(135deg, #1AADDC, #0E8DB8)"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
          trend="Last 50 sessions"
        />
      </div>

      {/* Main content + sidebar */}
      <div style={{ display: "flex", gap: 20 }}>
        <LiveSessionCard
          loading={sessionLoading}
          sessionActive={sessionActive}
          sessionCode={sessionCode}
          participants={participants}
          onGoToBroadcast={() => setActive("broadcast")}
        />

        <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 16 }}>
          <QuickActionsCard
            onBroadcast={() => setActive("broadcast")}
            onLiveCC={() => setActive("livecc")}
          />
          <RecentSessionsCard
            sessions={recentSessions}
            onViewLog={() => setActive("livecc")}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
