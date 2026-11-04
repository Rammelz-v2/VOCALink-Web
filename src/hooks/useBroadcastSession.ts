import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useSession } from "../context/SessionContext";
import type { SessionParticipant } from "../types";

export type { SessionParticipant };
export type { StudentActivity } from "../types";

const SpeechRecognition: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// Ignore final results whose confidence is below this threshold.
// Confidence of 0 means the browser didn't report it → pass through.
const CONFIDENCE_THRESHOLD = 0.45;

// Max number of failed broadcasts to queue for retry.
const MAX_RETRY_QUEUE = 8;

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

  const [activeRequests,        setActiveRequests]        = useState<CommRequest[]>([]);
  const [recording,             setRecording]             = useState(false);
  const [lastText,              setLastText]              = useState("");
  const [error,                 setError]                 = useState("");
  const [manualText,            setManualText]            = useState("");
  const [panelOpen,             setPanelOpen]             = useState(false);
  const [requestsPanelOpen,     setRequestsPanelOpen]     = useState(false);
  const [hintDismissed,         setHintDismissed]         = useState(false);
  const [isFullscreen,          setIsFullscreen]          = useState(false);
  const [showEmergencyAlert,    setShowEmergencyAlert]    = useState(false);
  const [participantsPanelOpen, setParticipantsPanelOpen] = useState(false);

  // ── mic level ─────────────────────────────────────────────────────────────
  const [micLevel, setMicLevel]  = useState(0); // 0–1 volume

  const retryQueueRef       = useRef<string[]>([]);
  const retryingRef         = useRef(false);
  const audioCtxRef         = useRef<AudioContext | null>(null);
  const analyserRef         = useRef<AnalyserNode | null>(null);
  const streamRef           = useRef<MediaStream | null>(null);
  const micLevelIntervalRef = useRef<number>(0);

  // ── Retry queue: re-send failed broadcasts every 5 s ─────────────────────
  useEffect(() => {
    if (!sessionActive) { retryQueueRef.current = []; return; }
    const iv = setInterval(async () => {
      if (!retryQueueRef.current.length || retryingRef.current) return;
      retryingRef.current = true;
      const text = retryQueueRef.current[0];
      try {
        await api.post("/broadcast/", { text, speaker: "teacher" });
        retryQueueRef.current.shift();
        setSentLines(prev => [...prev.slice(-29), text]);
        if (!retryQueueRef.current.length) setError("");
      } catch {}
      retryingRef.current = false;
    }, 5000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  const seenEmergencyIdsRef = useRef<Set<string>>(new Set());
  const activityRef         = useRef<HTMLDivElement>(null);
  const chatRef             = useRef<HTMLDivElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);
  const stickRef            = useRef(true);
  const isRecordingRef      = useRef(false);
  const recognitionRef      = useRef<any>(null);

  const sessionActiveRef = useRef(sessionActive);
  useEffect(() => {
    sessionActiveRef.current = sessionActive;
    if (!sessionActive && isRecordingRef.current) stopRecording();
    if (!sessionActive) stickRef.current = true;
  }, [sessionActive]);

  // ── Request polling ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) { setActiveRequests([]); return; }
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

  // ── Mic level teardown helper ─────────────────────────────────────────────
  const stopMicLevel = () => {
    window.clearInterval(micLevelIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current  = null;
    analyserRef.current  = null;
    streamRef.current    = null;
    setMicLevel(0);
  };

  // ── Speech recognition ────────────────────────────────────────────────────
  const stopRecording = () => {
    isRecordingRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setRecording(false);
    setLastText("");
    stopMicLevel();
    retryQueueRef.current = []; // abandon queued retries when mic stops
  };
  useEffect(() => () => stopRecording(), []);

  const startRecording = async () => {
    if (isRecordingRef.current) return;
    if (!sessionActiveRef.current) { setError("Start a session first."); return; }
    if (!SpeechRecognition)        { setError("Speech recognition requires Chrome or Edge."); return; }

    setError(""); setLastText("");
    isRecordingRef.current = true;
    setRecording(true);

    // Mic level visualiser — best-effort; never blocks STT if getUserMedia fails
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx      = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.55;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current  = ctx;
      analyserRef.current  = analyser;
      streamRef.current    = stream;
      const data = new Uint8Array(analyser.frequencyBinCount);
      micLevelIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setMicLevel(Math.min(1, avg / 48));
      }, 100);
    } catch {}

    const createAndStart = () => {
      if (!isRecordingRef.current) return;

      const recog = new SpeechRecognition();
      recog.continuous     = true;
      recog.interimResults = true;

      recog.onresult = async (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            const conf = r[0].confidence;
            // Filter low-confidence results (conf === 0 means browser didn't report → pass through)
            if (conf > 0 && conf < CONFIDENCE_THRESHOLD) continue;
            const text = r[0].transcript.trim();
            if (!text || !sessionActiveRef.current) continue;
            try {
              await api.post("/broadcast/", { text, speaker: "teacher" });
              setLastText(text);
              setSentLines(prev => [...prev.slice(-29), text]);
              if (!retryQueueRef.current.length) setError("");
            } catch {
              if (retryQueueRef.current.length < MAX_RETRY_QUEUE) {
                retryQueueRef.current.push(text);
                setError("Connection blip — retrying transcript…");
              }
            }
          } else {
            interim += r[0].transcript;
          }
        }
        if (interim) setLastText(interim);
      };

      recog.onerror = (e: any) => {
        if (e.error !== "no-speech" && e.error !== "aborted")
          setError(`Mic error: ${e.error}`);
      };

      // Small delay before restart prevents tight-loop crashes on some browsers
      recog.onend = () => {
        if (isRecordingRef.current) setTimeout(createAndStart, 250);
      };

      recognitionRef.current = recog;
      recog.start();
    };

    createAndStart();
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
  const handleQuickSend = async (text: string) => {
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
    micLevel,
    activityRef, chatRef, containerRef,
    onFeedScroll, toggleFullscreen, toggleSession, handleManualSend, handleQuickSend,
    startRecording, stopRecording,
  };
}
