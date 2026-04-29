export type Phase = "setup" | "enrollment" | "session" | "dashboard";

export interface Participant {
  id: string;
  name: string;
  mfccProfile: number[] | null;
}

export interface TurnEvent {
  speakerId: string;
  speakerName: string;
  startTime: number;
  durationMs: number;
}

export interface SpeakerMetrics {
  id: string;
  name: string;
  totalMs: number;
  turns: number;
  longestMs: number;
  talkRatio: number;
}
