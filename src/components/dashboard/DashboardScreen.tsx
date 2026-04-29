import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStore } from "../../store/sessionStore";
import type { SpeakerMetrics } from "../../types";
import SummaryTable from "./SummaryTable";
import TalkTimeChart from "./TalkTimeChart";

function exportCSV(
  metrics: SpeakerMetrics[],
  sessionStartTime: number | null,
  sessionEndTime: number | null,
) {
  const fmt = (ts: number | null) => (ts ? new Date(ts).toLocaleString() : "—");
  const meta = `Session start,${fmt(sessionStartTime)}\nSession end,${fmt(sessionEndTime)}\n\n`;
  const header = "Speaker,Talk Time (s),Turns,Longest Turn (s),Talk Share (%)\n";
  const rows = metrics
    .map(
      (m) =>
        `${m.name},${(m.totalMs / 1000).toFixed(1)},${m.turns},${(m.longestMs / 1000).toFixed(1)},${(m.talkRatio * 100).toFixed(1)}`,
    )
    .join("\n");
  const blob = new Blob([meta + header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "voxshare-session.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardScreen() {
  const reset = useSessionStore((s) => s.reset);
  const participants = useSessionStore((s) => s.participants);
  const turns = useSessionStore((s) => s.turns);
  const sessionStartTime = useSessionStore((s) => s.sessionStartTime);
  const sessionEndTime = useSessionStore((s) => s.sessionEndTime);

  const totalMs = turns.reduce((sum, t) => sum + t.durationMs, 0);

  const metrics = participants.map((p) => {
    const pTurns = turns.filter((t) => t.speakerId === p.id);
    const pTotalMs = pTurns.reduce((sum, t) => sum + t.durationMs, 0);
    const longestMs = pTurns.reduce((max, t) => Math.max(max, t.durationMs), 0);
    return {
      id: p.id,
      name: p.name,
      totalMs: pTotalMs,
      turns: pTurns.length,
      longestMs,
      talkRatio: totalMs > 0 ? pTotalMs / totalMs : 0,
    };
  });

  const unknownTurns = turns.filter((t) => t.speakerId === "__unknown__");
  if (unknownTurns.length > 0) {
    const unknownMs = unknownTurns.reduce((sum, t) => sum + t.durationMs, 0);
    const longestMs = unknownTurns.reduce((max, t) => Math.max(max, t.durationMs), 0);
    metrics.push({
      id: "__unknown__",
      name: "Unknown",
      totalMs: unknownMs,
      turns: unknownTurns.length,
      longestMs,
      talkRatio: totalMs > 0 ? unknownMs / totalMs : 0,
    });
  }

  return (
    <div className="flex flex-col min-h-screen p-6 gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Session Summary</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => exportCSV(metrics, sessionStartTime, sessionEndTime)}
          >
            Export CSV
          </Button>
          <Button type="button" onClick={reset}>
            New Session
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-sm text-muted-foreground">Total session time</p>
          <p className="text-3xl font-bold mt-1">
            {Math.floor(totalMs / 60000)}m {Math.floor((totalMs % 60000) / 1000)}s
          </p>
        </CardContent>
      </Card>
      <TalkTimeChart metrics={metrics} />
      <SummaryTable metrics={metrics} />
    </div>
  );
}
