import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../services/api";
import type { SessionParticipant, SessionMeta, StudentActivity } from "../types";

interface SessionContextValue {
  sessions:           SessionMeta[];
  sessionsLoading:    boolean;
  setSessions:        React.Dispatch<React.SetStateAction<SessionMeta[]>>;
  sessionLoading:     boolean;
  sessionActive:      boolean;
  sessionCode:        string | null;
  togglingSession:    boolean;
  participants:       SessionParticipant[];
  pendingRequests:    number;
  joinToasts:         SessionParticipant[];
  leaveToasts:        SessionParticipant[];
  requestToasts:      { id: number; student_name: string; request_type: string; note?: string | null }[];
  dismissRequestToast:(id: number) => void;
  profile:            any | null;
  profileLoading:     boolean;
  teacherPhoto:       string | null;
  setSessionActive:   React.Dispatch<React.SetStateAction<boolean>>;
  setSessionCode:     React.Dispatch<React.SetStateAction<string | null>>;
  setTogglingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setProfile:         React.Dispatch<React.SetStateAction<any>>;
  setTeacherPhoto:    React.Dispatch<React.SetStateAction<string | null>>;
  studentActivity:     StudentActivity[];
  activityLoading:     boolean;
  setStudentActivity:  React.Dispatch<React.SetStateAction<StudentActivity[]>>;
  sentLines:           string[];
  setSentLines:        React.Dispatch<React.SetStateAction<string[]>>;
  dismissJoinToast:   (id: number) => void;
  dismissLeaveToast:  (id: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const useSession = (): SessionContextValue => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be inside <SessionProvider>");
  return ctx;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionLoading,   setSessionLoading]   = useState(true);
  const [sessionActive,    setSessionActive]    = useState(false);
  const [sessionCode,      setSessionCode]      = useState<string | null>(null);
  const [togglingSession,  setTogglingSession]  = useState(false);
  const [participants,     setParticipants]     = useState<SessionParticipant[]>([]);
  const [joinToasts,       setJoinToasts]       = useState<SessionParticipant[]>([]);
  const [leaveToasts,      setLeaveToasts]      = useState<SessionParticipant[]>([]);
  const [profile,          setProfile]          = useState<any>(null);
  const [profileLoading,   setProfileLoading]   = useState(true);
  const [teacherPhoto,     setTeacherPhoto]     = useState<string | null>(null);
  const [sessions,         setSessions]         = useState<SessionMeta[]>([]);
  const [sessionsLoading,  setSessionsLoading]  = useState(true);
  const [pendingRequests,  setPendingRequests]  = useState(0);
  const [requestToasts,    setRequestToasts]    = useState<{ id: number; student_name: string; request_type: string; note?: string | null }[]>([]);
  const [studentActivity,  setStudentActivity]  = useState<StudentActivity[]>([]);
  const [activityLoading,  setActivityLoading]  = useState(false);
  const [sentLines,        setSentLines]        = useState<string[]>([]);

  // These refs live at provider level — survive every page navigation.
  const seenIdsRef        = useRef<Set<number>>(new Set());
  const activeMapRef      = useRef<Map<number, SessionParticipant>>(new Map());
  const seenRequestIdsRef = useRef<Set<number>>(new Set());
  const lastIconIdRef     = useRef(0);

  // One-time fetch: get session state and profile together when the dashboard loads.
  useEffect(() => {
    api.get("/sessions/teacher")
      .then(res => {
        setSessionActive(!!res.data.active);
        setSessionCode(res.data.session_code || null);
      })
      .catch(() => {})
      .finally(() => setSessionLoading(false));

    api.get("/users/me/")
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));

    api.get("/sessions/all/")
      .then(res => setSessions(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  // Re-fetch sessions list when a session starts or ends
  useEffect(() => {
    if (sessionLoading) return;
    api.get("/sessions/all/")
      .then(res => setSessions(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [sessionActive]);

  // Poll pending requests while session is active — shared by Topbar bell + Dashboard.
  // Also fires toasts for requests that are new since the last poll.
  useEffect(() => {
    if (!sessionActive) {
      setPendingRequests(0);
      seenRequestIdsRef.current.clear();
      return;
    }
    const poll = () => {
      api.get("/requests/active/?since=0").then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        const pending = list.filter((r: any) => r.status === "pending");
        setPendingRequests(pending.length);

        const newOnes = pending.filter((r: any) => !seenRequestIdsRef.current.has(r.id));
        if (newOnes.length) {
          newOnes.forEach((r: any) => seenRequestIdsRef.current.add(r.id));
          setRequestToasts(prev => [
            ...prev,
            ...newOnes.map((r: any) => ({
              id: r.id,
              student_name: r.student_name,
              request_type: r.request_type,
              note: r.note ?? null,
            })),
          ]);
        }
      }).catch(() => {});
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  // Poll while a session is active so we catch backend inactivity auto-end.
  useEffect(() => {
    if (!sessionActive) return;
    const iv = setInterval(() => {
      api.get("/sessions/teacher")
        .then(res => {
          if (!res.data.active) {
            setSessionActive(false);
            setSessionCode(null);
          }
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  // Student activity (AAC icon taps) — global so the feed survives page navigation.
  useEffect(() => {
    if (!sessionActive) {
      setStudentActivity([]);
      setActivityLoading(false);
      setSentLines([]);
      lastIconIdRef.current = 0;
      return;
    }
    setActivityLoading(true);
    const poll = () => {
      api.get(`/sessions/logs/?since=${lastIconIdRef.current}`)
        .then(res => {
          setActivityLoading(false);
          const logs: any[] = res.data;
          if (!logs.length) return;
          const entries: StudentActivity[] = logs.map(l => ({
            id:           `icon-${l.id}`,
            type:         "icon" as const,
            time:         l.tapped_at || "",
            student_name: l.student_name || "Student",
            text:         l.message || l.icon_label,
          }));
          setStudentActivity(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newEntries = entries.filter(e => !existingIds.has(e.id));
            if (!newEntries.length) return prev;
            return [...prev, ...newEntries].sort((a, b) => a.time.localeCompare(b.time));
          });
          lastIconIdRef.current = logs[logs.length - 1].id;
        }).catch(() => { setActivityLoading(false); });
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  // Participant polling — runs on every page as long as a session is active.
  useEffect(() => {
    if (!sessionActive) {
      setParticipants([]);
      seenIdsRef.current.clear();
      activeMapRef.current.clear();
      return;
    }

    const poll = () => {
      api.get("/sessions/active/participants/")
        .then(res => {
          const list: SessionParticipant[] = res.data ?? [];
          const newIdSet = new Set(list.map(p => p.id));

          // Departures
          const departed: SessionParticipant[] = [];
          activeMapRef.current.forEach((p, id) => {
            if (!newIdSet.has(id)) departed.push(p);
          });
          if (departed.length) {
            departed.forEach(p => seenIdsRef.current.delete(p.id));
            setLeaveToasts(prev => [...prev, ...departed]);
          }

          activeMapRef.current = new Map(list.map(p => [p.id, p]));
          setParticipants(list);

          // Arrivals
          const newcomers = list.filter(p => !seenIdsRef.current.has(p.id));
          if (newcomers.length) {
            newcomers.forEach(p => seenIdsRef.current.add(p.id));
            setJoinToasts(prev => [...prev, ...newcomers]);
          }
        })
        .catch(() => {});
    };

    poll();
    const iv = setInterval(poll, 3000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  const dismissJoinToast     = (id: number) => setJoinToasts(prev     => prev.filter(t => t.id !== id));
  const dismissLeaveToast    = (id: number) => setLeaveToasts(prev    => prev.filter(t => t.id !== id));
  const dismissRequestToast  = (id: number) => setRequestToasts(prev  => prev.filter(t => t.id !== id));

  return (
    <SessionContext.Provider value={{
      sessions, sessionsLoading, setSessions,
      sessionLoading, sessionActive, sessionCode, togglingSession,
      participants, pendingRequests, joinToasts, leaveToasts,
      requestToasts, dismissRequestToast,
      studentActivity, activityLoading, setStudentActivity,
      sentLines, setSentLines,
      profile, profileLoading, teacherPhoto,
      setSessionActive, setSessionCode, setTogglingSession,
      setProfile, setTeacherPhoto,
      dismissJoinToast, dismissLeaveToast,
    }}>
      {children}
    </SessionContext.Provider>
  );
};
