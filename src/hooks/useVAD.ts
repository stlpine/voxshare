import type { MicVAD } from "@ricky0123/vad-web";
import { useEffect, useRef } from "react";
import { identifySpeaker } from "../lib/mfcc";
import { createVAD } from "../lib/vad";
import { useSessionStore } from "../store/sessionStore";
import type { Participant } from "../types";

export function useVAD() {
  const vadRef = useRef<MicVAD | null>(null);
  const participants = useSessionStore((s) => s.participants);
  const recordSpeechStart = useSessionStore((s) => s.recordSpeechStart);
  const recordTurn = useSessionStore((s) => s.recordTurn);
  const recordUnknownTurn = useSessionStore((s) => s.recordUnknownTurn);

  // Keep refs so VAD callbacks always see fresh values without needing re-init
  const participantsRef = useRef<Participant[]>(participants);
  const recordSpeechStartRef = useRef(recordSpeechStart);
  const recordTurnRef = useRef(recordTurn);
  const recordUnknownTurnRef = useRef(recordUnknownTurn);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    recordSpeechStartRef.current = recordSpeechStart;
  }, [recordSpeechStart]);

  useEffect(() => {
    recordTurnRef.current = recordTurn;
  }, [recordTurn]);

  useEffect(() => {
    recordUnknownTurnRef.current = recordUnknownTurn;
  }, [recordUnknownTurn]);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      const vad = await createVAD(
        () => {
          recordSpeechStartRef.current(null);
        },
        (audio: Float32Array) => {
          const durationMs = Math.round((audio.length / 16000) * 1000);
          const speakerId = identifySpeaker(audio, 16000, participantsRef.current);
          if (speakerId) {
            recordTurnRef.current(speakerId, durationMs);
          } else {
            recordUnknownTurnRef.current(durationMs);
          }
        },
      );

      if (destroyed) {
        void vad.destroy();
        return;
      }

      vadRef.current = vad;
      await vad.start();
    }

    init().catch(console.error);

    return () => {
      destroyed = true;
      vadRef.current?.destroy().catch(console.error);
      vadRef.current = null;
    };
  }, []);
}
