import React from "react";
import { Radius, Shadow, FontSize } from "../../styles/tokens";
import { Button } from "../ui";

interface WelcomeBannerProps {
  today: string;
  teacherName: string;
  roomSection?: string;
  department?: string;
  onStartBroadcast: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  today, teacherName, roomSection, department, onStartBroadcast,
}) => (
  <div style={{
    borderRadius: Radius.xl,
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0E8DB8 100%)",
    padding: "28px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: Shadow.lg, position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", right: 80, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(26,173,220,0.12)" }} />
    <div style={{ position: "absolute", right: -20, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(13,208,245,0.08)" }} />

    <div style={{ zIndex: 1 }}>
      <div style={{ fontSize: FontSize.xs, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        {today}
      </div>
      <div style={{ fontSize: FontSize.xl, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
        Good morning, {teacherName} 👋
      </div>
      <div style={{ fontSize: FontSize.base, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
        {roomSection || "Your classroom"} · {department || "SNED"}
      </div>
    </div>

    <Button
      variant="primary"
      size="lg"
      onClick={onStartBroadcast}
      style={{ zIndex: 1, flexShrink: 0, boxShadow: "0 4px 16px rgba(26,173,220,0.4)" }}
    >
      🎙 Start Broadcast
    </Button>
  </div>
);

export default WelcomeBanner;
