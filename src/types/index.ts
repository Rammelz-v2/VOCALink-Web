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