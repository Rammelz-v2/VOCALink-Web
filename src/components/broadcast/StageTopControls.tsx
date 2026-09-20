import React from "react";
import Icon from "../ui/Icon";
import { D, PATH, Glyph } from "./theme";
import IconButton from "./IconButton";

interface StageTopControlsProps {
  sessionActive: boolean;
  recording: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const StageTopControls: React.FC<StageTopControlsProps> = ({
  sessionActive, recording, isFullscreen, onToggleFullscreen,
}) => (
  <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 8 }}>
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
    <IconButton
      size={36}
      background="rgba(10,20,60,0.75)"
      onClick={onToggleFullscreen}
      aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
      aria-pressed={isFullscreen}
      title={isFullscreen ? "Exit full screen" : "Full screen"}
    >
      <Glyph d={isFullscreen ? PATH.fullscreenExit : PATH.fullscreen} size={18} color={D.text} />
    </IconButton>
  </div>
);

export default StageTopControls;
