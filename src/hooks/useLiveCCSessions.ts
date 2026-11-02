import { useEffect, useRef, useState } from "react";
import { useSession } from "../context/SessionContext";
import api from "../services/api";
import type { SessionMeta } from "../types";

export type { SessionMeta };

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
  session_id:   number;
  session_code: string;
  started_at:   string;
  ended_at:     string | null;
  is_active:    boolean;
  ended_reason: "manual" | "inactivity" | null;
  entries:      LogEntry[];
}

// Backend stores UTC without 'Z'; append it so JS parses as UTC → local time.
const utc = (iso: string) =>
  iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";

// Always produce a consistent local-time display string from any ISO sort_key.
const fmt = (iso: string) => {
  if (!iso) return "";
  try {
    return new Date(utc(iso)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

export function useLiveCCSessions() {
  const { sessions, sessionsLoading } = useSession();

  const [selectedId,      setSelectedId]      = useState<number | null>(null);
  const [sessionLog,      setSessionLog]      = useState<SessionLog | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [syntheticEvents, setSyntheticEvents] = useState<LogEntry[]>([]);

  const startInjectedForRef = useRef<number | null>(null);
  const endInjectedForRef   = useRef<number | null>(null);

  // Auto-select the first/active session once sessions are loaded
  useEffect(() => {
    if (sessionsLoading || sessions.length === 0 || selectedId !== null) return;
    const active = sessions.find(s => s.is_active);
    setSelectedId((active ?? sessions[0]).id);
  }, [sessionsLoading, sessions]);

  const fetchLog = async (id: number) => {
    try {
      const res = await api.get(`/sessions/${id}/log/`);
      setSessionLog(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    setSyntheticEvents([]);
    startInjectedForRef.current = null;
    endInjectedForRef.current   = null;
    fetchLog(selectedId);
    const iv = setInterval(() => fetchLog(selectedId), 3000);
    return () => clearInterval(iv);
  }, [selectedId]);

  // Inject session start / end events (these aren't in the entries array from backend)
  useEffect(() => {
    if (!sessionLog) return;
    const sid = sessionLog.session_id;

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

    if (!sessionLog.is_active && endInjectedForRef.current !== sid) {
      endInjectedForRef.current = sid;
      const allKeys = sessionLog.entries.map(e => e.sort_key).filter(Boolean);
      const fallback = allKeys.length > 0 ? allKeys[allKeys.length - 1] : sessionLog.started_at;
      const endKey  = sessionLog.ended_at
        ? utc(sessionLog.ended_at)
        : new Date(new Date(utc(fallback)).getTime() + 500).toISOString();
      const endText = sessionLog.ended_reason === "inactivity"
        ? "Session ended due to inactivity (10 min idle)"
        : "Session ended";
      setSyntheticEvents(prev => [...prev, {
        id:         `event-end-${sid}`,
        type:       "event",
        sort_key:   endKey,
        time:       fmt(endKey),
        speaker:    "System",
        text:       endText,
        event_kind: "end",
      }]);
    }
  }, [sessionLog?.session_id, sessionLog?.is_active, sessionLog?.started_at]);

  const selectSession = (id: number) => {
    setSelectedId(id);
    setSessionLog(null);
    setLoading(true);
    setSyntheticEvents([]);
    startInjectedForRef.current = null;
    endInjectedForRef.current   = null;
  };

  const refresh = () => {
    if (selectedId !== null) fetchLog(selectedId);
  };

  // Join/leave events come from the backend (session_participants persisted to DB).
  // Times are re-normalized here so all entries — backend and synthetic — use the
  // same local-timezone format regardless of how the backend stored them.
  const mergedEntries: LogEntry[] = sessionLog
    ? [...sessionLog.entries, ...syntheticEvents]
        .filter((entry, idx, arr) => arr.findIndex(e => e.id === entry.id) === idx)
        .sort((a, b) => utc(a.sort_key || "").localeCompare(utc(b.sort_key || "")))
        .map(e => ({ ...e, time: fmt(e.sort_key) }))
    : [];

  return {
    sessions, selectedId, selectSession,
    sessionLog, loading, sessionsLoading,
    refresh, mergedEntries,
  };
}
