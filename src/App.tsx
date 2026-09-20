import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import "./styles/auth.css";
import { Colors as C } from "./styles/tokens";

import Sidebar        from "./components/layout/Sidebar";
import Topbar         from "./components/layout/Topbar";
import Dashboard      from "./pages/Dashboard";
import Students       from "./pages/Students";
import Broadcast      from "./pages/Broadcast";
import LiveCC         from "./pages/LiveCC";
import Settings       from "./pages/Settings";
import Login          from "./pages/auth/Login";
import Signup         from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

import { useAuth }       from "./context/AuthContext";
import type { NavPage } from "./types";
import api from "./services/api";

const DashboardLayout: React.FC = () => {
  const [active, setActive]               = useState<NavPage>("dashboard");
  const [teacherName,     setTeacherName]     = useState("");
  const [teacherInitials, setTeacherInitials] = useState("");
  const [teacherPhoto,    setTeacherPhoto]    = useState<string | null>(null);
  const [onlineCount,     setOnlineCount]     = useState(0);

  useEffect(() => {
    api.get("/users/me/").then(res => {
      const data = res.data;
      const name = data.display_name || data.first_name || data.username || "Teacher";
      setTeacherName(name);
      setTeacherInitials(name.substring(0, 2).toUpperCase());
    }).catch(() => {});

    // Poll online count every 30s
    const pollOnline = () => {
      api.get("/teacher/students/").then(res => {
        const students = Array.isArray(res.data) ? res.data : [];
        setOnlineCount(students.filter((s: any) => s.is_online).length);
      }).catch(() => {});
    };
    pollOnline();
    const interval = setInterval(pollOnline, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard setActive={setActive} />;
      case "students":  return <Students />;
      case "broadcast": return <Broadcast />;
      case "livecc":    return <LiveCC />;
      case "settings":  return (
        <Settings
          teacherName={teacherName}
          teacherPhoto={teacherPhoto}
          onNameChange={(name, initials) => { setTeacherName(name); setTeacherInitials(initials); }}
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
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar page={active}/>
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, background: "#F0F5F9" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

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
