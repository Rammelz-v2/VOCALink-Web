import React, { useState, useRef, useEffect } from "react";
import { Colors as C } from "../styles/tokens";
import Icon from "../components/ui/Icon";
import api from "../services/api";

const SpeechRecognition: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface StudentActivity {
  id:           string;
  type:         "icon";
  time:         string;
  student_name: string;
  text:         string;
}

// ── Layout / theme ───────────────────────────────────────────────────────────
// Height of the whole "room". Adjust to match your app header + page padding.
const VIEW_HEIGHT = "calc(100vh - 96px)";

const D = {
  page:    "#131314",
  stage:   "#16244A",
  glow:    "#22376E",
  surface: "#1F2022",
  btn:     "#333537",
  field:   "#303134",
  snack:   "#3C4043",
  text:    "#E8EAED",
  dim:     "#B4B9C0",
  muteBg:  "#F9DEDC",
  muteFg:  "#410E0B",
  end:     "#DC362E",
  panelOn: "#D3E3FD",
  panelFg: "#041E49",
  focus:   "#8AB4F8",
};

const AVATAR_COLORS = [
  "#8AB4F8", "#F28B82", "#81C995", "#FDD663",
  "#C58AF9", "#78D9EC", "#FCAD70", "#FF8BCB",
];
const colorFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const CSS = `
.bc-btn{transition:filter .15s}
.bc-btn:hover:not(:disabled){filter:brightness(1.18)}
.bc-btn:focus-visible{outline:2px solid ${D.focus};outline-offset:2px}
.bc-field:focus-within{outline:2px solid ${D.focus}}
@media (prefers-reduced-motion: reduce){.bc-btn{transition:none}}
`;

// Material-style glyph paths (so this file doesn't depend on extra Icon names)
const PATH = {
  close:          "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  chat:           "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z",
  send:           "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
  play:           "M8 5v14l11-7z",
  endCall:        "M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z",
  fullscreen:     "M7 14H5v5h5v-2H7v-3zM5 10h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
  fullscreenExit: "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z",
};

const Glyph: React.FC<{ d: string; size?: number; color?: string }> = ({
  d, size = 24, color = "currentColor",
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true">
    <path d={d} />
  </svg>
);

const btnBase: React.CSSProperties = {
  border: "none", padding: 0, cursor: "pointer", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit",
};

const Broadcast: React.FC = () => {
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

  const stopRecording = () => {
    isRecordingRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
    setLastText("");
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

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex", flexDirection: "column",
        height: isFullscreen ? "100vh" : VIEW_HEIGHT,
        minHeight: 520,
        padding: 12, boxSizing: "border-box",
        background: D.page, color: D.text,
        borderRadius: isFullscreen ? 0 : 20,
      }}
    >
      <style>{CSS}</style>

      {/* ── Main area: stage (+ optional side panel) ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>

        {/* Stage — student responses */}
        <section style={{
          flex: 1, minWidth: 0, position: "relative", overflow: "hidden",
          borderRadius: 16,
          background: `radial-gradient(ellipse at 50% 45%, ${D.glow} 0%, ${D.stage} 70%)`,
        }}>

          {!sessionActive ? (
            <div style={{
              position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, padding: "0 32px", textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 500 }}>
                Start a session to see student responses
              </div>
              <div style={{ fontSize: 15, color: D.dim }}>
                Students respond with AAC icons. Their taps show up here as they happen.
              </div>
            </div>
          ) : studentActivity.length === 0 ? (
            <div style={{
              position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, padding: "0 32px", textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 500 }}>Waiting for students…</div>
              <div style={{ fontSize: 15, color: D.dim }}>
                Responses appear here the moment a student taps an icon.
              </div>
            </div>
          ) : (
            <div
              ref={activityRef}
              onScroll={onFeedScroll}
              style={{
                position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
                overflowY: "auto", padding: "32px 32px 120px",
                scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent",
              }}
            >
              <div style={{
                maxWidth: 880, margin: "0 auto", minHeight: "100%",
                display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 28,
              }}>
                {studentActivity.map((item, idx) => {
                  const isLatest = idx === studentActivity.length - 1;
                  const color = colorFor(item.student_name);
                  return (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 16,
                      opacity: isLatest ? 1 : 0.72, transition: "opacity 0.3s",
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                        background: color, color: "#202124",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 600,
                      }}>
                        {item.student_name.trim().charAt(0).toUpperCase() || "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color }}>
                            {item.student_name}
                          </span>
                          <span style={{ fontSize: 12, color: D.dim }}>
                            {item.time.slice(11, 16)}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 30, fontWeight: 500, lineHeight: 1.3,
                          wordBreak: "break-word",
                        }}>
                          {item.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top-right controls: mic state badge + fullscreen toggle */}
          <div style={{
            position: "absolute", top: 16, right: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {sessionActive && (
              <div
                title={recording ? "Mic on" : "Mic off"}
                style={{
                  width: 36, height: 36,
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: recording ? "rgba(255,255,255,0.14)" : "rgba(10,20,60,0.75)",
                }}
              >
                <Icon name={recording ? "mic" : "mic-off"} size={18} color={D.text} />
              </div>
            )}
            <button
              className="bc-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
              aria-pressed={isFullscreen}
              title={isFullscreen ? "Exit full screen" : "Full screen"}
              style={{
                ...btnBase, width: 36, height: 36, borderRadius: "50%",
                background: "rgba(10,20,60,0.75)",
              }}
            >
              <Glyph d={isFullscreen ? PATH.fullscreenExit : PATH.fullscreen} size={18} color={D.text} />
            </button>
          </div>

          {/* Error snackbar */}
          {error && (
            <div role="alert" style={{
              position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
              zIndex: 3, maxWidth: "70%", display: "flex", alignItems: "center", gap: 8,
              padding: "8px 8px 8px 16px", borderRadius: 8, fontSize: 14,
              background: D.snack, boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}>
              <span>{error}</span>
              <button
                className="bc-btn"
                onClick={() => setError("")}
                aria-label="Dismiss"
                style={{ ...btnBase, width: 28, height: 28, borderRadius: "50%", background: "transparent" }}
              >
                <Glyph d={PATH.close} size={18} color={D.text} />
              </button>
            </div>
          )}

          {/* Teacher's live caption (like Meet captions) */}
          {recording && lastText && (
            <div style={{
              position: "absolute", left: "50%", bottom: 20, transform: "translateX(-50%)",
              width: "min(720px, calc(100% - 48px))", boxSizing: "border-box",
              padding: "10px 16px", borderRadius: 12, zIndex: 2,
              background: "rgba(19,19,20,0.88)",
            }}>
              <div style={{ fontSize: 12, color: D.dim, marginBottom: 2 }}>You</div>
              <div style={{ fontSize: 18, lineHeight: 1.4 }}>{lastText}</div>
            </div>
          )}
        </section>

        {/* Side panel — messages to students */}
        {panelOpen && (
          <aside style={{
            width: 340, maxWidth: "45%", flexShrink: 0, display: "flex", flexDirection: "column",
            background: D.surface, borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 8px 10px 20px",
            }}>
              <div style={{ fontSize: 17, fontWeight: 500 }}>Messages to students</div>
              <button
                className="bc-btn"
                onClick={() => setPanelOpen(false)}
                aria-label="Close panel"
                style={{ ...btnBase, width: 40, height: 40, borderRadius: "50%", background: "transparent" }}
              >
                <Glyph d={PATH.close} size={22} color={D.text} />
              </button>
            </div>

            <div
              ref={chatRef}
              style={{
                flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 12px",
                display: "flex", flexDirection: "column", gap: 8,
                scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent",
              }}
            >
              {sentLines.length === 0 ? (
                <div style={{ fontSize: 14, color: D.dim, lineHeight: 1.5, padding: "4px 4px" }}>
                  Everything you say or type is sent to students, and it shows up here.
                </div>
              ) : sentLines.map((line, i) => (
                <div key={i} style={{
                  alignSelf: "flex-start", maxWidth: "92%", padding: "8px 12px",
                  borderRadius: 12, fontSize: 14, lineHeight: 1.45, wordBreak: "break-word",
                  background: "rgba(0,174,239,0.16)",
                }}>
                  {line}
                </div>
              ))}
            </div>

            <div
              className="bc-field"
              style={{
                display: "flex", alignItems: "center", gap: 4, margin: 12,
                padding: "4px 4px 4px 16px", borderRadius: 24, background: D.field,
                opacity: sessionActive ? 1 : 0.5,
              }}
            >
              <input
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleManualSend()}
                disabled={!sessionActive}
                placeholder={sessionActive ? "Type a message to students" : "Start a session to send messages"}
                aria-label="Message to students"
                style={{
                  flex: 1, minWidth: 0, border: "none", outline: "none",
                  background: "transparent", color: D.text, fontSize: 14,
                  fontFamily: "inherit", padding: "8px 0",
                }}
              />
              <button
                className="bc-btn"
                onClick={handleManualSend}
                disabled={!sessionActive || !manualText.trim()}
                aria-label="Send message"
                style={{
                  ...btnBase, width: 36, height: 36, borderRadius: "50%", background: "transparent",
                  opacity: manualText.trim() ? 1 : 0.4,
                  cursor: manualText.trim() && sessionActive ? "pointer" : "not-allowed",
                }}
              >
                <Glyph d={PATH.send} size={20} color={D.focus} />
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── Bottom bar: session info · controls · panel toggle ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: 12, paddingTop: 12,
      }}>

        {/* Left: session code */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, minWidth: 0, paddingLeft: 8,
          fontSize: 14,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: sessionActive ? "#22C55E" : "#5F6368",
            boxShadow: sessionActive ? "0 0 0 3px rgba(34,197,94,0.25)" : "none",
          }} />
          {sessionActive ? (
            <span
              title="Session code"
              style={{
                fontFamily: "monospace", fontWeight: 600, letterSpacing: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {sessionCode}
            </span>
          ) : (
            <span style={{ color: D.dim }}>No active session</span>
          )}
        </div>

        {/* Center: control pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: 8,
          background: D.surface, borderRadius: 32,
        }}>

          {/* Mic (mute / unmute) */}
          <div style={{ position: "relative" }}>
            {showHint && (
              <div role="status" style={{
                position: "absolute", bottom: "calc(100% + 18px)", left: "50%",
                transform: "translateX(-50%)", width: 272, zIndex: 5,
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "14px 10px 14px 18px", borderRadius: 8,
                background: D.snack, fontSize: 14, lineHeight: 1.45,
                boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
              }}>
                <span style={{ flex: 1 }}>
                  Your mic is off. Click the mic to send live captions to students.
                </span>
                <button
                  className="bc-btn"
                  onClick={() => setHintDismissed(true)}
                  aria-label="Dismiss"
                  style={{ ...btnBase, width: 28, height: 28, borderRadius: "50%", background: "transparent" }}
                >
                  <Glyph d={PATH.close} size={18} color={D.text} />
                </button>
                <div style={{
                  position: "absolute", top: "100%", left: "50%", marginLeft: -8,
                  borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
                  borderTop: `8px solid ${D.snack}`,
                }} />
              </div>
            )}
            <button
              className="bc-btn"
              onClick={recording ? stopRecording : startRecording}
              disabled={!sessionActive}
              aria-label={recording ? "Mute microphone" : "Unmute microphone"}
              aria-pressed={micOff}
              title={recording ? "Mute" : "Unmute"}
              style={{
                ...btnBase, width: 56, height: 48, borderRadius: 24,
                background: micOff ? D.muteBg : D.btn,
                opacity: sessionActive ? 1 : 0.4,
                cursor: sessionActive ? "pointer" : "not-allowed",
              }}
            >
              <Icon
                name={recording ? "mic" : "mic-off"}
                size={22}
                color={micOff ? D.muteFg : D.text}
              />
            </button>
          </div>

          {/* Start / End session */}
          {sessionActive ? (
            <button
              className="bc-btn"
              onClick={toggleSession}
              disabled={togglingSession}
              aria-label="End session"
              title="End session"
              style={{
                ...btnBase, width: 64, height: 48, borderRadius: 24,
                background: D.end, opacity: togglingSession ? 0.6 : 1,
                cursor: togglingSession ? "not-allowed" : "pointer",
              }}
            >
              <Glyph d={PATH.endCall} size={26} color="#fff" />
            </button>
          ) : (
            <button
              className="bc-btn"
              onClick={toggleSession}
              disabled={togglingSession}
              style={{
                ...btnBase, gap: 8, height: 48, padding: "0 22px", borderRadius: 24,
                background: C.teal, color: "#fff", fontSize: 14, fontWeight: 600,
                opacity: togglingSession ? 0.6 : 1,
                cursor: togglingSession ? "not-allowed" : "pointer",
              }}
            >
              <Glyph d={PATH.play} size={20} color="#fff" />
              {togglingSession ? "Starting…" : "Start session"}
            </button>
          )}
        </div>

        {/* Right: messages panel toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 8 }}>
          <button
            className="bc-btn"
            onClick={() => setPanelOpen(o => !o)}
            aria-label="Messages to students"
            aria-pressed={panelOpen}
            title="Messages to students"
            style={{
              ...btnBase, width: 48, height: 48, borderRadius: "50%",
              background: panelOpen ? D.panelOn : D.surface,
            }}
          >
            <Glyph d={PATH.chat} size={22} color={panelOpen ? D.panelFg : D.text} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Broadcast;