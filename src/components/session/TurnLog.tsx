import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSessionStore } from "../../store/sessionStore";

export default function TurnLog() {
  const turns = useSessionStore((s) => s.turns);
  const recent = [...turns].reverse().slice(0, 50);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Recent turns
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-40 px-4 pb-4">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No turns yet.</p>
          ) : (
            <div className="space-y-1 pt-1">
              {recent.map((t) => (
                <div
                  key={`${t.speakerId}-${t.startTime}`}
                  className="flex items-center gap-3 text-sm py-0.5"
                >
                  <span className="font-medium text-primary min-w-[80px]">{t.speakerName}</span>
                  <span className="text-muted-foreground">{(t.durationMs / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
