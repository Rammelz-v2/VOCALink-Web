import React from "react";
import { D, colorFor } from "./theme";
import type { StudentActivity } from "../../hooks/useBroadcastSession";

interface StudentActivityFeedProps {
  activity: StudentActivity[];
  feedRef: React.RefObject<HTMLDivElement | null>; 
  onScroll: () => void;
}
const StudentActivityFeed: React.FC<StudentActivityFeedProps> = ({ activity, feedRef, onScroll }) => (
  <div
    ref={feedRef}
    onScroll={onScroll}
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
      {activity.map((item, idx) => {
        const isLatest = idx === activity.length - 1;
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
              <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.3, wordBreak: "break-word" }}>
                {item.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default StudentActivityFeed;
