import { useEffect, useState } from "react";
import api from "../services/api";

export interface SessionMeta {
  id: number;
  session_code: string;
  started_at: string;
  is_active: boolean;
}

export interface LogEntry {
  id: string;
  type: "cc" | "aac";
  sort_key: string;
  time: string;
  speaker: string;
  text: string;
  icon_id?: string;
}

export interface SessionLog {
  session_id: number;
  session_code: string;
  started_at: string;
  is_active: boolean;
  entries: LogEntry[];
}

/**
 * Loads the list of sessions, keeps the selected session's log polled
 * every 3s, and exposes everything LiveCC needs to render.
 */
export function useLiveCCSessions() {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sessionLog, setSessionLog] = useState<SessionLog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions/all/");
      const list: SessionMeta[] = res.data || [];
      setSessions(list);
      // Auto-select: prefer the currently active session, else the most recent
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

  // Poll every 3s while a session is selected
  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    fetchLog(selectedId);
    const iv = setInterval(() => fetchLog(selectedId), 3000);
    return () => clearInterval(iv);
  }, [selectedId]);

  const selectSession = (id: number) => {
    setSelectedId(id);
    setSessionLog(null);
    setLoading(true);
  };

  const refresh = () => {
    if (selectedId !== null) fetchLog(selectedId);
  };

  return { sessions, selectedId, selectSession, sessionLog, loading, refresh };
}
