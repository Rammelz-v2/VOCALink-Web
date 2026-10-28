export interface SessionParticipant {
  id:        number;
  user_id:   number;
  name:      string;
  joined_at: string;
}

export interface SessionMeta {
  id:           number;
  session_code: string;
  started_at:   string;
  is_active:    boolean;
}

export type StudentStatus = "online" | "idle" | "request" | "urgent";

export interface Student {
  id: number;
  name: string;
  status: StudentStatus;
  bg: string;
  color: string;
}

export interface QuickReply {
  label: string;
  bg: string;
  text: string;
}

export type NavPage =
  | "dashboard"
  | "broadcast"
  | "livecc"
  | "settings";

export interface TranscriptLine {
  time: string;
  speaker: string;
  text: string;
  isCC: boolean;
}