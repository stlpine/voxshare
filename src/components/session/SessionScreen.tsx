import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const pendingTurnStart = useSessionStore((s) => s.pendingTurnStart);
  const sessionStartTime = useSessionStore((s) => s.sessionStartTime);
  const endSession = useSessionStore((s) => s.endSession);
  const addParticipant = useSessionStore((s) => s.addParticipant);
  const setIsEnrolling = useSessionStore((s) => s.setIsEnrolling);

  const [elapsed, setElapsed] = useState(0);
  const [reenrollingId, setReenrollingId] = useState<string | null>(null);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [newName, setNewName] = useState("");
  const [enrollingNewId, setEnrollingNewId] = useState<string | null>(null);

  useVAD();

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - (sessionStartTime ?? Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStartTime]);

  useEffect(() => {
    setIsEnrolling(reenrollingId !== null || enrollingNewId !== null);
  }, [reenrollingId, enrollingNewId, setIsEnrolling]);

  function handleAddParticipant() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = `p${Date.now()}`;
    addParticipant(id, trimmed);
    setAddingParticipant(false);
    setNewName("");
    setEnrollingNewId(id);
  }

  const isSpeaking = pendingTurnStart !== null;
  const lastSpeaker = participants.find((p) => p.id === currentSpeakerId) ?? null;
  const reenrollingParticipant = participants.find((p) => p.id === reenrollingId) ?? null;
  const enrollingNewParticipant = participants.find((p) => p.id === enrollingNewId) ?? null;

  return (
    <div className="flex flex-col min-h-screen p-6 gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Live Session</h2>
          <p className="text-xs text-muted-foreground tabular-nums">{fmtElapsed(elapsed)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setAddingParticipant(true)}>
            Add Participant
          </Button>
          <Button type="button" variant="destructive" onClick={endSession}>
            End Session
          </Button>
        </div>
      </div>
      <WaveformCanvas />
      <SpeakerIndicator isSpeaking={isSpeaking} lastSpeaker={lastSpeaker} />
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

      {addingParticipant && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-6 gap-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Add Participant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                autoFocus
              />
              <Button
                type="button"
                className="w-full"
                onClick={handleAddParticipant}
                disabled={!newName.trim()}
              >
                Start Enrollment
              </Button>
            </CardContent>
          </Card>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => {
              setAddingParticipant(false);
              setNewName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {enrollingNewParticipant && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-6 gap-4">
          <EnrollmentCard
            key={`${enrollingNewParticipant.id}-new`}
            participant={enrollingNewParticipant}
            onDone={() => setEnrollingNewId(null)}
          />
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setEnrollingNewId(null)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
