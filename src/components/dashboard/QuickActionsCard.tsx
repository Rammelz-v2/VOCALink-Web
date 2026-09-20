import React from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../../styles/tokens";
import QuickAction from "./QuickAction";

interface QuickActionsCardProps {
  onBroadcast: () => void;
  onLiveCC: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ onBroadcast, onLiveCC }) => (
  <div style={{
    background: C.white, borderRadius: Radius.lg,
    border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
  }}>
    <div style={{
      padding: "14px 16px", borderBottom: `1px solid ${C.gray2}`,
      fontSize: FontSize.md, fontWeight: 700, color: C.text,
      background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
    }}>
      Quick Actions
    </div>
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
      <QuickAction
        onClick={onBroadcast}
        gradient="linear-gradient(135deg, #1AADDC, #0E8DB8)"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>}
        label="STT Broadcast"
        sub="Speak to all students"
      />
      <QuickAction
        onClick={onLiveCC}
        gradient="linear-gradient(135deg, #0EA5E9, #0284C7)"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
        label="Live CC Log"
        sub="Full session transcript"
      />
    </div>
  </div>
);

export default QuickActionsCard;
