import { useEffect, useRef, useState } from "react";
import api from "../services/api";

export interface SessionMeta {
  id: number;
  session_code: string;
  started_at: string;
  is_active: boolean;
}

export interface LogEntry {
  id: string;
  type: "cc" | "aac" | "event";
  sort_key: string;
  time: string;
  speaker: string;
  text: string;
  icon_id?: string;
  event_kind?: "join" | "leave" | "start" | "end";
}

export interface SessionLog {
  session_id: number;
  session_code: string;
  started_at: string;
  is_active: boolean;
  entries: LogEntry[];
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function useLiveCCSessions() {
  const [sessions,        setSessions]        = useState<SessionMeta[]>([]);
  const [selectedId,      setSelectedId]      = useState<number | null>(null);
  const [sessionLog,      setSessionLog]      = useState<SessionLog | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [syntheticEvents, setSyntheticEvents] = useState<LogEntry[]>([]);

  const seenParticipantIdsRef    = useRef<Set<number>>(new Set());
  const activeParticipantsMapRef = useRef<Map<number, string>>(new Map());
  const startInjectedForRef      = useRef<number | null>(null);
  const endInjectedForRef        = useRef<number | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions/all/");
      const list: SessionMeta[] = res.data || [];
      setSessions(list);
      if (list.length > 0 && selectedId === null) {
        const active = list.find(s => s.is_active);
        setSelectedId((active ?? list[0]).id);
      }
    } catch {}
  };

  const fetchLog = async (id: number) => {
    try {
      const res = await api.get(`/sessions/${id}/log/`);
      setSessionLog(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    setSyntheticEvents([]);
    seenParticipantIdsRef.current.clear();
    activeParticipantsMapRef.current.clear();
    startInjectedForRef.current = null;
    endInjectedForRef.current   = null;
    fetchLog(selectedId);
    const iv = setInterval(() => fetchLog(selectedId), 3000);
    return () => clearInterval(iv);
  }, [selectedId]);

  // Inject session start / end events
  useEffect(() => {
    if (!sessionLog) return;
    const sid = sessionLog.session_id;

    // Session started — inject once per selected session
    if (startInjectedForRef.current !== sid) {
      startInjectedForRef.current = sid;
      setSyntheticEvents(prev => [...prev, {
        id:         `event-start-${sid}`,
        type:       "event",
        sort_key:   sessionLog.started_at,
        time:       fmt(sessionLog.started_at),
        speaker:    "System",
        text:       `Session started · Code: ${sessionLog.session_code}`,
        event_kind: "start",
      }]);
    }

    // Session ended — inject once when it goes inactive
    if (!sessionLog.is_active && endInjectedForRef.current !== sid) {
      endInjectedForRef.current = sid;
      const allKeys = sessionLog.entries.map(e => e.sort_key);
      const lastKey = allKeys.length > 0 ? allKeys[allKeys.length - 1] : sessionLog.started_at;
      const endKey  = new Date(new Date(lastKey).getTime() + 500).toISOString();
      setSyntheticEvents(prev => [...prev, {
        id:         `event-end-${sid}`,
        type:       "event",
        sort_key:   endKey,
        time:       fmt(endKey),
        speaker:    "System",
        text:       "Session ended",
        event_kind: "end",
      }]);
    }
  }, [sessionLog?.session_id, sessionLog?.is_active, sessionLog?.started_at]);

  // Participant polling — only for the active session
  useEffect(() => {
    if (!sessionLog?.is_active) return;

    const poll = async () => {
      try {
        const res  = await api.get("/sessions/active/participants/");
        const list: { id: number; name: string; joined_at: string }[] = res.data;
        const now     = new Date().toISOString();
        const nowFmt  = fmt(now);
        const newIdSet = new Set(list.map(p => p.id));

        // Departures
        activeParticipantsMapRef.current.forEach((name, id) => {
          if (!newIdSet.has(id)) {
            seenParticipantIdsRef.current.delete(id);
            setSyntheticEvents(prev => [...prev, {
              id:         `event-leave-${id}-${now}`,
              type:       "event",
              sort_key:   now,
              time:       nowFmt,
              speaker:    "System",
              text:       `${name} left the session`,
              event_kind: "leave",
            }]);
          }
        });

        activeParticipantsMapRef.current = new Map(list.map(p => [p.id, p.name]));

        // Arrivals
        list.forEach(p => {
          if (!seenParticipantIdsRef.current.has(p.id)) {
            seenParticipantIdsRef.current.add(p.id);
            const joinKey = p.joined_at ?? now;
            setSyntheticEvents(prev => [...prev, {
              id:         `event-join-${p.id}-${joinKey}`,
              type:       "event",
              sort_key:   joinKey,
              time:       fmt(joinKey),
              speaker:    "System",
              text:       `${p.name} joined the session`,
              event_kind: "join",
            }]);
          }
        });
      } catch {}
    };

    poll();
    const iv = setInterval(poll, 3000);
    return () => clearInterval(iv);
  }, [sessionLog?.is_active]);

  const selectSession = (id: number) => {
    setSelectedId(id);
    setSessionLog(null);
    setLoading(true);
    setSyntheticEvents([]);
    seenParticipantIdsRef.current.clear();
    activeParticipantsMapRef.current.clear();
    startInjectedForRef.current = null;
    endInjectedForRef.current   = null;
  };

  const refresh = () => {
    if (selectedId !== null) fetchLog(selectedId);
  };

  const mergedEntries: LogEntry[] = sessionLog
    ? [...sessionLog.entries, ...syntheticEvents]
        .sort((a, b) => a.sort_key.localeCompare(b.sort_key))
    : [];

  return { sessions, selectedId, selectSession, sessionLog, loading, refresh, mergedEntries };
}
