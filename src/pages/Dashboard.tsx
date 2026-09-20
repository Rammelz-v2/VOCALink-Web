import React from "react";
import type { NavPage } from "../types";
import { useDashboardData } from "../hooks/useDashboardData";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatCard from "../components/dashboard/StatCard";
import StudentListCard from "../components/dashboard/StudentListCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import SessionInfoCard from "../components/dashboard/SessionInfoCard";

interface DashboardProps {
  setActive: (page: NavPage) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActive }) => {
  const { students, loading, error, profile, today } = useDashboardData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <WelcomeBanner
        today={today}
        teacherName={profile?.first_name || profile?.display_name || "Teacher"}
        roomSection={profile?.room_section}
        department={profile?.department}
        onStartBroadcast={() => setActive("broadcast")}
      />

      <div style={{ display: "flex", gap: 16 }}>
        <StatCard
          value={students.length}
          label="Total Students"
          bg="linear-gradient(135deg, #F0F9FF, #E0F2FE)"
          iconBg="linear-gradient(135deg, #1AADDC, #0E8DB8)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <StudentListCard
          students={students}
          loading={loading}
          error={error}
          onBroadcast={() => setActive("broadcast")}
          onAddStudents={() => setActive("students")}
          onSelectStudent={() => setActive("students")}
        />

        <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 16 }}>
          <QuickActionsCard
            onBroadcast={() => setActive("broadcast")}
            onLiveCC={() => setActive("livecc")}
          />
          <SessionInfoCard department={profile?.department} roomSection={profile?.room_section} today={today} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
