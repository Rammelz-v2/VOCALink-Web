import React from "react";
import { D } from "./theme";
import type { StudentActivity } from "../../hooks/useBroadcastSession";
import StageEmptyState from "./StageEmptyState";
import StudentActivityFeed from "./StudentActivityFeed";
import StageTopControls from "./StageTopControls";
import ErrorSnackbar from "./ErrorSnackbar";
import CaptionOverlay from "./CaptionOverlay";

interface StageProps {
  sessionActive: boolean;
  studentActivity: StudentActivity[];
  feedRef: React.RefObject<HTMLDivElement | null>;
  onFeedScroll: () => void;
  recording: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  error: string;
  onDismissError: () => void;
  lastText: string;
}

/** The "room" — student responses (or an empty state), top-right controls,
 *  error snackbar, and the teacher's live caption overlay. */
const Stage: React.FC<StageProps> = ({
  sessionActive, studentActivity, feedRef, onFeedScroll,
  recording, isFullscreen, onToggleFullscreen,
  error, onDismissError, lastText,
}) => (
  <section style={{
    flex: 1, minWidth: 0, position: "relative", overflow: "hidden",
    borderRadius: 16,
    background: `radial-gradient(ellipse at 50% 45%, ${D.glow} 0%, ${D.stage} 70%)`,
  }}>
    {!sessionActive ? (
      <StageEmptyState
        heading="Start a session to see student responses"
        sub="Students respond with AAC icons. Their taps show up here as they happen."
      />
    ) : studentActivity.length === 0 ? (
      <StageEmptyState
        heading="Waiting for students…"
        sub="Responses appear here the moment a student taps an icon."
      />
    ) : (
      <StudentActivityFeed activity={studentActivity} feedRef={feedRef} onScroll={onFeedScroll} />
    )}

    <StageTopControls
      sessionActive={sessionActive}
      recording={recording}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
    />

    {error && <ErrorSnackbar message={error} onDismiss={onDismissError} />}

    {recording && lastText && <CaptionOverlay text={lastText} />}
  </section>
);

export default Stage;