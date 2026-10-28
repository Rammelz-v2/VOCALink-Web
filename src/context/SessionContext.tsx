import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../services/api";
import type { SessionParticipant, SessionMeta } from "../types";

interface SessionContextValue {
  sessions:           SessionMeta[];
  sessionsLoading:    boolean;
  setSessions:        React.Dispatch<React.SetStateAction<SessionMeta[]>>;
  sessionLoading:     boolean;
  sessionActive:      boolean;
  sessionCode:        string | null;
  togglingSession:    boolean;
  participants:       SessionParticipant[];
  joinToasts:         SessionParticipant[];
  leaveToasts:        SessionParticipant[];
  profile:            any | null;
  profileLoading:     boolean;
  teacherPhoto:       string | null;
  setSessionActive:   React.Dispatch<React.SetStateAction<boolean>>;
  setSessionCode:     React.Dispatch<React.SetStateAction<string | null>>;
  setTogglingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setProfile:         React.Dispatch<React.SetStateAction<any>>;
  setTeacherPhoto:    React.Dispatch<React.SetStateAction<string | null>>;
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

  // These refs live at provider level — survive every page navigation.
  const seenIdsRef    = useRef<Set<number>>(new Set());
  const activeMapRef  = useRef<Map<number, SessionParticipant>>(new Map());

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

  const dismissJoinToast  = (id: number) => setJoinToasts(prev  => prev.filter(t => t.id !== id));
  const dismissLeaveToast = (id: number) => setLeaveToasts(prev => prev.filter(t => t.id !== id));

  return (
    <SessionContext.Provider value={{
      sessions, sessionsLoading, setSessions,
      sessionLoading, sessionActive, sessionCode, togglingSession,
      participants, joinToasts, leaveToasts,
      profile, profileLoading, teacherPhoto,
      setSessionActive, setSessionCode, setTogglingSession,
      setProfile, setTeacherPhoto,
      dismissJoinToast, dismissLeaveToast,
    }}>
      {children}
    </SessionContext.Provider>
  );
};
