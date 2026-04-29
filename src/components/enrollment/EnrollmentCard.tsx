import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recordEnrollmentAudio } from "../../lib/enrollment";
import { extractMFCCProfile } from "../../lib/mfcc";
import { useSessionStore } from "../../store/sessionStore";
import type { Participant } from "../../types";
import CountdownRing from "./CountdownRing";

type RecordState = "idle" | "recording" | "processing" | "done" | "error";

const NUM_SAMPLES = 3;

const PHRASE_POOL = [
  "다람쥐 헌 쳇바퀴에 타고파",
  "내가 그린 기린 그림은 잘 그린 기린 그림이다",
  "된장찌개와 김치볶음밥은 한국의 대표적인 음식입니다",
  "봄 여름 가을 겨울 사계절 내내 아름다운 우리나라",
  "하늘을 나는 새처럼 자유롭게 살고 싶다",
  "서울 시내에서 지하철을 타고 여행하는 것이 편리합니다",
  "오늘 날씨가 정말 맑고 아름답네요",
  "저 푸른 초원 위에 그림 같은 집을 짓고 싶다",
];

function pickPhrases(n: number): string[] {
  const shuffled = [...PHRASE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

interface Props {
  participant: Participant;
  onDone?: () => void;
}

export default function EnrollmentCard({ participant, onDone }: Props) {
  const [state, setState] = useState<RecordState>("idle");
  const [round, setRound] = useState(0);
  const [collectedProfiles, setCollectedProfiles] = useState<number[][]>([]);
  const [phrases] = useState(() => pickPhrases(NUM_SAMPLES));
  const setMfccProfile = useSessionStore((s) => s.setMfccProfile);
  const advanceEnrollment = useSessionStore((s) => s.advanceEnrollment);

  async function handleRecord() {
    setState("recording");
    try {
      const pcm = await recordEnrollmentAudio();
      setState("processing");
      const profile = extractMFCCProfile(pcm, 16000);
      const updated = [...collectedProfiles, profile];

      if (updated.length < NUM_SAMPLES) {
        setCollectedProfiles(updated);
        setRound(updated.length);
        setState("idle");
      } else {
        const averaged = profile.map(
          (_, i) => updated.reduce((sum, p) => sum + (p[i] ?? 0), 0) / updated.length,
        );
        setMfccProfile(participant.id, averaged);
        setState("done");
        setTimeout(() => {
          if (onDone) onDone();
          else advanceEnrollment();
        }, 800);
      }
    } catch {
      setState("error");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <CardDescription>Now enrolling</CardDescription>
        <CardTitle className="text-2xl">{participant.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground italic">"{phrases[round]}"</p>
        </div>

        {state !== "done" && state !== "error" && (
          <p className="text-center text-xs text-muted-foreground">
            Sample {round + 1} of {NUM_SAMPLES}
          </p>
        )}

        {state === "recording" && (
          <div className="flex justify-center">
            <CountdownRing durationMs={5000} />
          </div>
        )}

        {state === "idle" && (
          <Button type="button" className="w-full" onClick={handleRecord}>
            {round === 0 ? "Start Recording" : "Record Next Sample"}
          </Button>
        )}

        {state === "processing" && (
          <p className="text-center text-sm text-muted-foreground">Processing…</p>
        )}

        {state === "done" && (
          <p className="text-center text-sm font-medium text-green-400">✓ Profile saved</p>
        )}

        {state === "error" && (
          <div className="space-y-3">
            <p className="text-center text-sm text-destructive">
              Recording failed. Check microphone permissions.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setState("idle")}
            >
              Try again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
