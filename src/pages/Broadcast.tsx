import React from "react";
import { VIEW_HEIGHT, CSS, D } from "../components/broadcast/theme";
import { useBroadcastSession } from "../hooks/useBroadcastSession";
import Stage from "../components/broadcast/Stage";
import MessagesPanel from "../components/broadcast/MessagesPanel";
import ControlBar from "../components/broadcast/ControlBar";

const Broadcast: React.FC = () => {
  const bc = useBroadcastSession();

  return (
    <div
      ref={bc.containerRef}
      style={{
        display: "flex", flexDirection: "column",
        height: bc.isFullscreen ? "100vh" : VIEW_HEIGHT,
        minHeight: 520,
        padding: 12, boxSizing: "border-box",
        background: D.page, color: D.text,
        borderRadius: bc.isFullscreen ? 0 : 20,
      }}
    >
      <style>{CSS}</style>

      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>
        <Stage
          sessionActive={bc.sessionActive}
          studentActivity={bc.studentActivity}
          feedRef={bc.activityRef}
          onFeedScroll={bc.onFeedScroll}
          recording={bc.recording}
          isFullscreen={bc.isFullscreen}
          onToggleFullscreen={bc.toggleFullscreen}
          error={bc.error}
          onDismissError={() => bc.setError("")}
          lastText={bc.lastText}
        />

        {bc.panelOpen && (
          <MessagesPanel
            onClose={() => bc.setPanelOpen(false)}
            chatRef={bc.chatRef}
            sentLines={bc.sentLines}
            manualText={bc.manualText}
            setManualText={bc.setManualText}
            onSend={bc.handleManualSend}
            sessionActive={bc.sessionActive}
          />
        )}
      </div>

      <ControlBar
        sessionActive={bc.sessionActive}
        sessionCode={bc.sessionCode}
        recording={bc.recording}
        micOff={bc.micOff}
        showHint={bc.showHint}
        onDismissHint={() => bc.setHintDismissed(true)}
        onToggleMic={bc.recording ? bc.stopRecording : bc.startRecording}
        togglingSession={bc.togglingSession}
        onToggleSession={bc.toggleSession}
        panelOpen={bc.panelOpen}
        onTogglePanel={() => bc.setPanelOpen(o => !o)}
      />
    </div>
  );
};

export default Broadcast;
