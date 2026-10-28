import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

export interface DashboardParticipant {
  id: number;
  name: string;
}

export interface DashboardSession {
  id: number;
  session_code: string;
  started_at: string;
  is_active: boolean;
}

export function useDashboardData() {
  const [profile,          setProfile]          = useState<any>(null);
  const [sessionActive,    setSessionActive]    = useState(false);
  const [sessionCode,      setSessionCode]      = useState<string | null>(null);
  const [participants,     setParticipants]     = useState<DashboardParticipant[]>([]);
  const [pendingRequests,  setPendingRequests]  = useState(0);
  const [recentSessions,   setRecentSessions]   = useState<DashboardSession[]>([]);
  const [loading,          setLoading]          = useState(true);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const refresh = useCallback(() => {
    api.get("/sessions/teacher").then(res => {
      setSessionActive(res.data.active);
      setSessionCode(res.data.session_code || null);
    }).catch(() => {});

    api.get("/sessions/all/").then(res => {
      setRecentSessions(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/users/me/").then(res => setProfile(res.data)).catch(() => {});
    refresh();
    setLoading(false);
  }, [refresh]);

  // Poll participants and pending requests while session is active
  useEffect(() => {
    if (!sessionActive) {
      setParticipants([]);
      setPendingRequests(0);
      return;
    }
    const poll = () => {
      api.get("/sessions/active/participants/").then(res => {
        setParticipants(Array.isArray(res.data) ? res.data : []);
      }).catch(() => {});
      api.get("/requests/active/?since=0").then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPendingRequests(list.filter((r: any) => r.status === "pending").length);
      }).catch(() => {});
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  return {
    profile, today, loading,
    sessionActive, sessionCode,
    participants, pendingRequests,
    recentSessions, refresh,
  };
}
