import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVAD } from "../../hooks/useVAD";
import { useSessionStore } from "../../store/sessionStore";
import EnrollmentCard from "../enrollment/EnrollmentCard";
import LiveMetricsTable from "./LiveMetricsTable";
import SpeakerIndicator from "./SpeakerIndicator";
import TurnLog from "./TurnLog";
import WaveformCanvas from "./WaveformCanvas";

function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  return `${m}m ${s % 60}s`;
}

export default function SessionScreen() {
  const participants = useSessionStore((s) => s.participants);
  const currentSpeakerId = useSessionStore((s) => s.currentSpeakerId);
  const sessionStartTime = useSessionStore((s) => s.sessionStartTime);
  const endSession = useSessionStore((s) => s.endSession);

  const [elapsed, setElapsed] = useState(0);
  const [reenrollingId, setReenrollingId] = useState<string | null>(null);

  useVAD();

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - (sessionStartTime ?? Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStartTime]);

  const currentSpeaker = participants.find((p) => p.id === currentSpeakerId) ?? null;
  const reenrollingParticipant = participants.find((p) => p.id === reenrollingId) ?? null;

  return (
    <div className="flex flex-col min-h-screen p-6 gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Live Session</h2>
          <p className="text-xs text-muted-foreground tabular-nums">{fmtElapsed(elapsed)}</p>
        </div>
        <Button type="button" variant="destructive" onClick={endSession}>
          End Session
        </Button>
      </div>
      <WaveformCanvas />
      <SpeakerIndicator speaker={currentSpeaker} />
      <LiveMetricsTable onReenroll={(id) => setReenrollingId(id)} />
      <TurnLog />

      {reenrollingParticipant && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-6 gap-4">
          <p className="text-sm text-muted-foreground">
            Re-enrolling will replace the current voice profile.
          </p>
          <EnrollmentCard
            key={`${reenrollingParticipant.id}-reenroll`}
            participant={reenrollingParticipant}
            onDone={() => setReenrollingId(null)}
          />
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setReenrollingId(null)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
