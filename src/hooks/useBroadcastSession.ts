import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const SpeechRecognition: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export interface StudentActivity {
  id:           string;
  type:         "icon";
  time:         string;
  student_name: string;
  text:         string;
}

export interface CommRequest {
  id:           string;
  student_id:   number;
  student_name: string;
  request_type: string;   // "medication" | "bathroom" | "assistance"
  status:       string;   // "pending" | "acknowledged" | "resolved"
  note:         string | null;
  created_at:   string;
}
/**
 * All Broadcast state, effects and handlers: session lifecycle, speech
 * recognition, student-activity polling, fullscreen, and the manual
 * message composer. The page component just wires this to JSX.
 */
export function useBroadcastSession() {
  const [activeRequests, setActiveRequests] = useState<CommRequest[]>([]);
  const lastRequestIdRef = useRef(0);
  const [recording,  setRecording]  = useState(false);
  const [lastText,   setLastText]   = useState("");
  const [error,      setError]      = useState("");

  const [sessionActive,   setSessionActive]   = useState(false);
  const [sessionCode,     setSessionCode]     = useState<string | null>(null);
  const [togglingSession, setTogglingSession] = useState(false);

  const [sentLines,       setSentLines]       = useState<string[]>([]);
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([]);
  const [manualText,      setManualText]      = useState("");

  const [panelOpen,     setPanelOpen]     = useState(false);
  const [requestsPanelOpen, setRequestsPanelOpen] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [isFullscreen,  setIsFullscreen]  = useState(false);

  const lastIconIdRef    = useRef(0);
  const activityRef      = useRef<HTMLDivElement>(null);
  const chatRef          = useRef<HTMLDivElement>(null);
  const containerRef     = useRef<HTMLDivElement>(null);
  const stickRef         = useRef(true);
  const isRecordingRef   = useRef(false);
  const recognitionRef   = useRef<any>(null);
  const sessionActiveRef = useRef(sessionActive);
  useEffect(() => { sessionActiveRef.current = sessionActive; }, [sessionActive]);

  useEffect(() => {
    api.get("/sessions/teacher").then(res => {
      setSessionActive(res.data.active);
      setSessionCode(res.data.session_code || null);
    }).catch(() => {});
  }, []);

// ── add as its own useEffect, right after the studentActivity polling effect ─
useEffect(() => {
  if (!sessionActive) {
    setActiveRequests([]);
    lastRequestIdRef.current = 0;
    return;
  }
  const pollRequests = () => {
    api.get(`/requests/active/?since=0`) // always full active list, not incremental
      .then(res => {
        setActiveRequests(res.data);
      }).catch(() => {});
  };
  pollRequests();
  const iv = setInterval(pollRequests, 3000);
  return () => clearInterval(iv);
}, [sessionActive]);

const acknowledgeRequest = async (id: string) => {
  try {
    await api.patch(`/requests/${id}/`, { status: "acknowledged" });
    setActiveRequests(prev => prev.map(r => r.id === id ? { ...r, status: "acknowledged" } : r));
  } catch {
    setError("Couldn't update the request.");
  }
};

const resolveRequest = async (id: string) => {
  try {
    await api.patch(`/requests/${id}/`, { status: "resolved" });
    setActiveRequests(prev => prev.filter(r => r.id !== id));
  } catch {
    setError("Couldn't update the request.");
  }
};

  useEffect(() => {
    if (!sessionActive) {
      setStudentActivity([]);
      lastIconIdRef.current = 0;
      stickRef.current = true;
      return;
    }
    const poll = () => {
      api.get(`/sessions/logs/?since=${lastIconIdRef.current}`)
        .then(res => {
          const logs: any[] = res.data;
          if (!logs.length) return;
          const entries: StudentActivity[] = logs.map(l => ({
            id:           `icon-${l.id}`,
            type:         "icon" as const,
            time:         l.tapped_at || "",
            student_name: l.student_name || "Student",
            text:         l.message || l.icon_label,
          }));
          setStudentActivity(prev =>
            [...prev, ...entries].sort((a, b) => a.time.localeCompare(b.time))
          );
          lastIconIdRef.current = logs[logs.length - 1].id;
        }).catch(() => {});
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  // Follow new responses only if the teacher hasn't scrolled up to read.
  const onFeedScroll = () => {
    const el = activityRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };
  useEffect(() => {
    const el = activityRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [studentActivity.length]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [sentLines.length, panelOpen]);

  const stopRecording = () => {
    isRecordingRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
    setLastText("");
  };

  useEffect(() => () => stopRecording(), []);

  // ── Fullscreen API ────────────────────────────────────────────────────────
  // Keeps isFullscreen in sync even if the teacher exits with Esc or the
  // browser's own UI, not just via our button.
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {
        setError("Fullscreen isn't supported in this browser.");
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  // ── Google Web Speech API (webkitSpeechRecognition) ──────────────────────
  const startRecording = () => {
    if (!sessionActiveRef.current) { setError("Start a session first."); return; }
    if (!SpeechRecognition) { setError("Speech recognition requires Chrome or Edge."); return; }
    setError("");
    setLastText("");

    const recog = new SpeechRecognition();
    recog.continuous      = true;
    recog.interimResults  = true;
    recog.lang            = "en-US";

    recog.onresult = async (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          const text = t.trim();
          if (!text || !sessionActiveRef.current) continue;
          try {
            await api.post("/broadcast/", { text, speaker: "teacher" });
            setLastText(text);
            setSentLines(prev => [...prev.slice(-29), text]);
            setError("");
          } catch (err: any) {
            setError(err?.response?.data?.detail || "Broadcast failed.");
          }
        } else {
          interim += t;
        }
      }
      if (interim) setLastText(interim);
    };

    recog.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted")
        setError(`Speech error: ${e.error}`);
    };

    recog.onend = () => {
      if (isRecordingRef.current) recog.start();
    };

    recognitionRef.current   = recog;
    isRecordingRef.current   = true;
    setRecording(true);
    recog.start();
  };

  const toggleSession = async () => {
    setTogglingSession(true);
    try {
      const res = await api.post("/sessions/toggle");
      const nowActive = res.data.active as boolean;
      setSessionActive(nowActive);
      // Keep the ref in sync immediately (not on next render) so
      // startRecording()'s session check passes right away below.
      sessionActiveRef.current = nowActive;
      setSessionCode(res.data.session_code || null);
      if (nowActive) {
        // Google Meet-style: transcription begins the instant the session
        // goes live. The teacher can mute afterward if they don't want to
        // broadcast audio right away — muting never ends the session.
        setHintDismissed(false);
        startRecording();
      } else {
        setSentLines([]);
        setStudentActivity([]);
        lastIconIdRef.current = 0;
        if (recording) stopRecording();
      }
    } catch {}
    setTogglingSession(false);
  };

  const handleManualSend = async () => {
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    try {
      await api.post("/broadcast/", { text, speaker: "teacher" });
      setSentLines(prev => [...prev.slice(-29), text]);
    } catch {
      setError("Broadcast failed — is the session still active?");
    }
  };

  const micOff   = sessionActive && !recording;
  const showHint = micOff && !hintDismissed;

  return {
    // state
    recording, lastText, error, setError,
    sessionActive, sessionCode, togglingSession,
    sentLines, studentActivity, manualText, setManualText,
    panelOpen, setPanelOpen, hintDismissed, setHintDismissed, isFullscreen,
    requestsPanelOpen, setRequestsPanelOpen,
    activeRequests, acknowledgeRequest, resolveRequest,
    micOff, showHint,
    // refs (attach directly to DOM nodes)
    activityRef, chatRef, containerRef,
    // handlers
    onFeedScroll, toggleFullscreen, toggleSession, handleManualSend,
    startRecording, stopRecording,
  };
}
