import { create } from "zustand";
import type { Participant, Phase, TurnEvent } from "../types";

interface SessionState {
  phase: Phase;
  participants: Participant[];
  enrollmentIndex: number;
  turns: TurnEvent[];
  currentSpeakerId: string | null;
  pendingTurnStart: number | null;
  sessionStartTime: number | null;
  sessionEndTime: number | null;
}

interface SessionActions {
  setPhase: (phase: Phase) => void;
  setParticipants: (names: string[]) => void;
  setMfccProfile: (id: string, profile: number[]) => void;
  advanceEnrollment: () => void;
  recordSpeechStart: (speakerId: string | null) => void;
  recordTurn: (speakerId: string, durationMs: number) => void;
  recordUnknownTurn: (durationMs: number) => void;
  endSession: () => void;
  reset: () => void;
}

type Store = SessionState & SessionActions;

export const useSessionStore = create<Store>((set) => ({
  phase: "setup",
  participants: [],
  enrollmentIndex: 0,
  turns: [],
  currentSpeakerId: null,
  pendingTurnStart: null,
  sessionStartTime: null,
  sessionEndTime: null,

  setPhase: (phase) => set({ phase }),

  setParticipants: (names) =>
    set({
      participants: names.map((name, i) => ({ id: `p${i}`, name, mfccProfile: null })),
      enrollmentIndex: 0,
    }),

  setMfccProfile: (id, profile) =>
    set((s) => ({
      participants: s.participants.map((p) => (p.id === id ? { ...p, mfccProfile: profile } : p)),
    })),

  advanceEnrollment: () =>
    set((s) => {
      const next = s.enrollmentIndex + 1;
      if (next >= s.participants.length) {
        return { phase: "session" as Phase, enrollmentIndex: next, sessionStartTime: Date.now() };
      }
      return { enrollmentIndex: next };
    }),

  recordSpeechStart: (_speakerId) => set({ pendingTurnStart: Date.now(), currentSpeakerId: null }),

  recordTurn: (speakerId, durationMs) =>
    set((s) => {
      const participant = s.participants.find((p) => p.id === speakerId);
      if (!participant) return {};
      const turn: TurnEvent = {
        speakerId,
        speakerName: participant.name,
        startTime: s.pendingTurnStart ?? Date.now() - durationMs,
        durationMs,
      };
      return { turns: [...s.turns, turn], currentSpeakerId: speakerId, pendingTurnStart: null };
    }),

  recordUnknownTurn: (durationMs) =>
    set((s) => {
      const turn: TurnEvent = {
        speakerId: "__unknown__",
        speakerName: "Unknown",
        startTime: s.pendingTurnStart ?? Date.now() - durationMs,
        durationMs,
      };
      return { turns: [...s.turns, turn], pendingTurnStart: null };
    }),

  endSession: () =>
    set((s) => {
      const now = Date.now();
      if (s.pendingTurnStart) {
        return {
          phase: "dashboard" as Phase,
          pendingTurnStart: null,
          currentSpeakerId: null,
          sessionEndTime: now,
        };
      }
      return { phase: "dashboard" as Phase, currentSpeakerId: null, sessionEndTime: now };
    }),

  reset: () =>
    set({
      phase: "setup",
      participants: [],
      enrollmentIndex: 0,
      turns: [],
      currentSpeakerId: null,
      pendingTurnStart: null,
      sessionStartTime: null,
      sessionEndTime: null,
    }),
}));
