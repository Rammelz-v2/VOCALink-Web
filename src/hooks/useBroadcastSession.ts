import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useSession } from "../context/SessionContext";
import type { SessionParticipant } from "../types";

export type { SessionParticipant };
export type { StudentActivity } from "../types";

const SpeechRecognition: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export interface CommRequest {
  id:           string;
  student_id:   number;
  student_name: string;
  request_type: string;
  status:       string;
  note:         string | null;
  created_at:   string;
}

export function useBroadcastSession() {
  // Session state + student activity + participant toasts come from context so they:
  //  • survive page navigation (no flash when returning to Broadcast)
  //  • run polling on every page (global notifications)
  const {
    sessionLoading,
    sessionActive,    setSessionActive,
    sessionCode,      setSessionCode,
    togglingSession,  setTogglingSession,
    studentActivity,  activityLoading,
    sentLines,        setSentLines,
    participants,
    joinToasts,       leaveToasts,
    dismissJoinToast, dismissLeaveToast,
  } = useSession();

  const [activeRequests,     setActiveRequests]     = useState<CommRequest[]>([]);
  const [recording,          setRecording]          = useState(false);
  const [lastText,           setLastText]           = useState("");
  const [error,              setError]              = useState("");
  const [manualText,         setManualText]         = useState("");
  const [panelOpen,          setPanelOpen]          = useState(false);
  const [requestsPanelOpen,  setRequestsPanelOpen]  = useState(false);
  const [hintDismissed,      setHintDismissed]      = useState(false);
  const [isFullscreen,       setIsFullscreen]       = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [participantsPanelOpen, setParticipantsPanelOpen] = useState(false);

  const seenEmergencyIdsRef = useRef<Set<string>>(new Set());
  const activityRef         = useRef<HTMLDivElement>(null);
  const chatRef             = useRef<HTMLDivElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);
  const stickRef            = useRef(true);
  const isRecordingRef      = useRef(false);
  const recognitionRef      = useRef<any>(null);

  // Keep a ref in sync so startRecording's closure always has the latest value.
  const sessionActiveRef = useRef(sessionActive);
  useEffect(() => {
    sessionActiveRef.current = sessionActive;
    // If the session was killed externally (inactivity), stop the mic.
    if (!sessionActive && isRecordingRef.current) stopRecording();
    // Reset scroll-stick when session ends.
    if (!sessionActive) stickRef.current = true;
  }, [sessionActive]);

  // ── Request polling ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) {
      setActiveRequests([]);
      return;
    }
    const poll = () => {
      api.get("/requests/active/?since=0")
        .then(res => {
          const requests: CommRequest[] = res.data;
          setActiveRequests(requests);

          const newEmergencies = requests.filter(
            r => r.request_type === "emergency" &&
                 r.status === "pending" &&
                 !seenEmergencyIdsRef.current.has(r.id)
          );
          if (newEmergencies.length > 0) {
            newEmergencies.forEach(r => seenEmergencyIdsRef.current.add(r.id));
            setShowEmergencyAlert(true);
          }
        }).catch(() => {});
    };
    poll();
    const iv = setInterval(poll, 3000);
    return () => clearInterval(iv);
  }, [sessionActive]);

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

  // ── Fullscreen ────────────────────────────────────────────────────────────
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

  // ── Speech recognition (browser Web Speech API — continuous, real-time) ─────
  const stopRecording = () => {
    isRecordingRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
    setLastText("");
  };
  useEffect(() => () => stopRecording(), []);

  const startRecording = () => {
    if (!sessionActiveRef.current) { setError("Start a session first."); return; }
    if (!SpeechRecognition) { setError("Speech recognition requires Chrome or Edge."); return; }
    setError("");
    setLastText("");

    const recog = new SpeechRecognition();
    recog.continuous     = true;
    recog.interimResults = true;
    recog.lang           = "en-US";

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
    recog.onend = () => { if (isRecordingRef.current) recog.start(); };

    recognitionRef.current = recog;
    isRecordingRef.current = true;
    setRecording(true);
    recog.start();
  };

  // ── Session toggle ────────────────────────────────────────────────────────
  const toggleSession = async () => {
    setTogglingSession(true);
    try {
      const res      = await api.post("/sessions/toggle");
      const nowActive = res.data.active as boolean;
      setSessionActive(nowActive);
      sessionActiveRef.current = nowActive;
      setSessionCode(res.data.session_code || null);
      if (nowActive) {
        setHintDismissed(false);
        startRecording();
      } else {
        if (recording) stopRecording();
      }
    } catch {}
    setTogglingSession(false);
  };

  // ── Request actions ───────────────────────────────────────────────────────
  const acknowledgeRequest = async (id: string) => {
    try {
      await api.patch(`/requests/${id}/`, { status: "acknowledged" });
      setActiveRequests(prev => prev.map(r => r.id === id ? { ...r, status: "acknowledged" } : r));
    } catch { setError("Couldn't update the request."); }
  };
  const resolveRequest = async (id: string) => {
    try {
      await api.patch(`/requests/${id}/`, { status: "resolved" });
      setActiveRequests(prev => prev.filter(r => r.id !== id));
    } catch { setError("Couldn't update the request."); }
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
    sessionLoading,
    recording, lastText, error, setError,
    sessionActive, sessionCode, togglingSession,
    sentLines, studentActivity, activityLoading, manualText, setManualText,
    panelOpen, setPanelOpen, hintDismissed, setHintDismissed, isFullscreen,
    requestsPanelOpen, setRequestsPanelOpen,
    activeRequests, acknowledgeRequest, resolveRequest,
    showEmergencyAlert, setShowEmergencyAlert,
    participants, joinToasts, dismissJoinToast, leaveToasts, dismissLeaveToast,
    participantsPanelOpen, setParticipantsPanelOpen,
    micOff, showHint,
    activityRef, chatRef, containerRef,
    onFeedScroll, toggleFullscreen, toggleSession, handleManualSend,
    startRecording, stopRecording,
  };
}
