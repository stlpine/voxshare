import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Participant } from "../../types";

interface Props {
  isSpeaking: boolean;
  lastSpeaker: Participant | null;
}

export default function SpeakerIndicator({ isSpeaking, lastSpeaker }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-150 ${
            isSpeaking ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {isSpeaking ? "Speaking…" : "Listening…"}
        </span>
        {!isSpeaking && lastSpeaker && (
          <Badge variant="secondary" className="ml-auto text-muted-foreground font-normal">
            Last: {lastSpeaker.name}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
