import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import "./styles/auth.css";
import { Colors as C } from "./styles/tokens";

import Sidebar        from "./components/layout/Sidebar";
import Topbar         from "./components/layout/Topbar";
import Dashboard      from "./pages/Dashboard";
import Broadcast      from "./pages/Broadcast";
import LiveCC         from "./pages/LiveCC";
import Settings       from "./pages/Settings";
import Login          from "./pages/auth/Login";
import Signup         from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import JoinToastStack from "./components/broadcast/JoinToastStack";

import { useAuth }    from "./context/AuthContext";
import { SessionProvider, useSession } from "./context/SessionContext";
import type { NavPage } from "./types";

const DashboardInner: React.FC = () => {
  const [active, setActive] = useState<NavPage>("dashboard");

  const {
    joinToasts, leaveToasts, dismissJoinToast, dismissLeaveToast,
    profile, profileLoading, teacherPhoto, setTeacherPhoto, setProfile,
  } = useSession();

  const teacherName     = profile?.display_name || profile?.first_name || profile?.username || "";
  const teacherInitials = teacherName ? teacherName.substring(0, 2).toUpperCase() : "";

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard setActive={setActive} />;
      case "broadcast": return <Broadcast />;
      case "livecc":    return <LiveCC />;
      case "settings":  return (
        <Settings
          teacherName={teacherName}
          teacherPhoto={teacherPhoto}
          onNameChange={(name) => setProfile((p: any) => p ? { ...p, display_name: name } : p)}
          onPhotoChange={setTeacherPhoto}
        />
      );
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh", background: C.bg, overflow: "hidden" }}>
      <Sidebar
        active={active}
        setActive={setActive}
        teacherName={teacherName}
        teacherInitials={teacherInitials}
        teacherPhoto={teacherPhoto}
        profileLoading={profileLoading}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar page={active} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, background: C.bg }}>
          {renderPage()}
        </main>
      </div>

      {/* Global join/leave toasts — visible on every page, never reset on navigation */}
      <JoinToastStack
        toasts={joinToasts}
        leaveToasts={leaveToasts}
        onDismiss={dismissJoinToast}
        onDismissLeave={dismissLeaveToast}
      />
    </div>
  );
};

const DashboardLayout: React.FC = () => (
  <SessionProvider>
    <DashboardInner />
  </SessionProvider>
);

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"           element={!user ? <Login />          : <Navigate to="/dashboard" />} />
      <Route path="/signup"          element={!user ? <Signup />         : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard/*"     element={user  ? <DashboardLayout /> : <Navigate to="/login" />} />
      <Route path="*"                element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default App;