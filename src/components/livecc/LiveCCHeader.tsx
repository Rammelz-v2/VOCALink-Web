import React from "react";
import { Colors as C, FontSize } from "../../styles/tokens";
import { CardTitle, Button } from "../ui";

interface LiveCCHeaderProps {
  isLive: boolean;
  onRefresh: () => void;
}

const LiveCCHeader: React.FC<LiveCCHeaderProps> = ({ isLive, onRefresh }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
    <div>
      <CardTitle>CC Session Log</CardTitle>
      <p style={{ fontSize: FontSize.sm, color: C.text3, margin: "4px 0 0", lineHeight: 1.5 }}>
        Full transcript — teacher broadcasts &amp; student icon taps per session.
      </p>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {isLive && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" }} />
          <span style={{ fontSize: FontSize.xs, color: "#15803D", fontWeight: 600 }}>Live</span>
        </div>
      )}
      <Button size="sm" variant="outline" onClick={onRefresh}>↻ Refresh</Button>
    </div>
  </div>
);

export default LiveCCHeader;
