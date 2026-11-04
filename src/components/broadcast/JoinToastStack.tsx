import React from "react";
import type { SessionParticipant } from "../../types";
import JoinToast    from "./JoinToast";
import RequestToast from "./RequestToast";

interface JoinToastStackProps {
  toasts: SessionParticipant[];
  leaveToasts?: SessionParticipant[];
  requestToasts?: { id: number; student_name: string; request_type: string; note?: string | null }[];
  onDismiss: (id: number) => void;
  onDismissLeave?: (id: number) => void;
  onDismissRequest?: (id: number) => void;
}

const JoinToastStack: React.FC<JoinToastStackProps> = ({
  toasts, leaveToasts = [], requestToasts = [],
  onDismiss, onDismissLeave, onDismissRequest,
}) => {
  if (toasts.length === 0 && leaveToasts.length === 0 && requestToasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      right: 24,
      zIndex: 8900,
      display: "flex",
      flexDirection: "column-reverse",
      gap: 10,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <JoinToast key={`join-${t.id}`} participant={t} type="join" onDismiss={() => onDismiss(t.id)} />
      ))}
      {leaveToasts.map(t => (
        <JoinToast key={`leave-${t.id}`} participant={t} type="leave" onDismiss={() => onDismissLeave?.(t.id)} />
      ))}
      {requestToasts.map(t => (
        <RequestToast key={`req-${t.id}`} toast={t} onDismiss={() => onDismissRequest?.(t.id)} />
      ))}
    </div>
  );
};

export default JoinToastStack;
