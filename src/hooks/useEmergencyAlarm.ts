import { useEffect, useRef } from "react";
import type { CommRequest } from "./useBroadcastSession";

export function useEmergencyAlarm(requests: CommRequest[]) {
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playAlarm = (ctx: AudioContext) => {
    const pattern: Array<{ freq: number; t: number; dur: number }> = [
      { freq: 960, t: 0.00, dur: 0.14 },
      { freq: 720, t: 0.16, dur: 0.14 },
      { freq: 960, t: 0.32, dur: 0.14 },
      { freq: 720, t: 0.48, dur: 0.14 },
      { freq: 960, t: 0.64, dur: 0.14 },
      { freq: 720, t: 0.80, dur: 0.14 },
    ];
    pattern.forEach(({ freq, t, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.connect(gain);
      gain.connect(ctx.destination);
      const s = ctx.currentTime + t;
      osc.frequency.setValueAtTime(freq, s);
      gain.gain.setValueAtTime(0.28, s);
      gain.gain.exponentialRampToValueAtTime(0.001, s + dur);
      osc.start(s);
      osc.stop(s + dur + 0.01);
    });
  };

  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      ctx.resume().then(() => {
        playAlarm(ctx);
        alarmTimerRef.current = setInterval(() => playAlarm(ctx), 2500);
      });
    } catch {}

    const studentNames = [...new Set(requests.map(r => r.student_name))].join(", ");
    const sendOSNotification = () => {
      try {
        new Notification("🚨 EMERGENCY", {
          body: `${studentNames} needs immediate help — respond now!`,
          tag: "vocalink-emergency",
          requireInteraction: true,
        });
      } catch {}
    };
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        sendOSNotification();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(p => {
          if (p === "granted") sendOSNotification();
        });
      }
    }

    const originalTitle = document.title;
    let titleFlip = false;
    const titleTimer = setInterval(() => {
      document.title = (titleFlip = !titleFlip)
        ? "🚨 EMERGENCY — Respond now!"
        : originalTitle;
    }, 700);

    try { navigator.vibrate?.([400, 150, 400, 150, 400]); } catch {}

    return () => {
      if (alarmTimerRef.current) clearInterval(alarmTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
      clearInterval(titleTimer);
      document.title = originalTitle;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
