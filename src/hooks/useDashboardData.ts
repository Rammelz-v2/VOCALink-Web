import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import api from "../services/api";

export function useDashboardData() {
  const {
    sessionActive, sessionCode, participants,
    sessionLoading, profile, profileLoading,
    sessions,
  } = useSession();

  const [pendingRequests, setPendingRequests] = useState(0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    if (!sessionActive) { setPendingRequests(0); return; }
    const poll = () => {
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
    profile, today,
    sessionLoading, profileLoading,
    sessionActive, sessionCode,
    participants, pendingRequests,
    recentSessions: sessions.slice(0, 5),
  };
}
