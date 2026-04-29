import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Participant } from "../../types";

interface Props {
  speaker: Participant | null;
}

export default function SpeakerIndicator({ speaker }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        {speaker ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-sm text-muted-foreground">Currently speaking</span>
            <Badge variant="secondary" className="ml-auto text-primary font-semibold">
              {speaker.name}
            </Badge>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
            <span className="text-sm text-muted-foreground">Listening…</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}
