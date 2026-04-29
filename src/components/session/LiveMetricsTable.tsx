import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionStore } from "../../store/sessionStore";

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

interface Props {
  onReenroll?: (id: string) => void;
}

export default function LiveMetricsTable({ onReenroll }: Props) {
  const participants = useSessionStore((s) => s.participants);
  const turns = useSessionStore((s) => s.turns);

  const knownTurns = turns.filter((t) => t.speakerId !== "__unknown__");
  const unknownTurns = turns.filter((t) => t.speakerId === "__unknown__");
  const totalMs = turns.reduce((sum, t) => sum + t.durationMs, 0);

  const metrics = participants.map((p) => {
    const pTurns = knownTurns.filter((t) => t.speakerId === p.id);
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

  const unknownMs = unknownTurns.reduce((sum, t) => sum + t.durationMs, 0);
  const unknownLongest = unknownTurns.reduce((max, t) => Math.max(max, t.durationMs), 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Live metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Speaker</TableHead>
              <TableHead>Talk time</TableHead>
              <TableHead>Turns</TableHead>
              <TableHead>Longest</TableHead>
              <TableHead>Share</TableHead>
              {onReenroll && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{fmtMs(m.totalMs)}</TableCell>
                <TableCell>{m.turns}</TableCell>
                <TableCell>{m.longestMs > 0 ? fmtMs(m.longestMs) : "—"}</TableCell>
                <TableCell>{(m.talkRatio * 100).toFixed(0)}%</TableCell>
                {onReenroll && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground"
                      onClick={() => onReenroll(m.id)}
                    >
                      Re-enroll
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {unknownTurns.length > 0 && (
              <TableRow className="text-muted-foreground">
                <TableCell className="italic">Unknown</TableCell>
                <TableCell>{fmtMs(unknownMs)}</TableCell>
                <TableCell>{unknownTurns.length}</TableCell>
                <TableCell>{fmtMs(unknownLongest)}</TableCell>
                <TableCell>{totalMs > 0 ? ((unknownMs / totalMs) * 100).toFixed(0) : 0}%</TableCell>
                {onReenroll && <TableCell />}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
