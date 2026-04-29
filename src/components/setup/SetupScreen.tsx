import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionStore } from "../../store/sessionStore";
import NameInput from "./NameInput";

interface Entry {
  id: number;
  name: string;
}

export default function SetupScreen() {
  const nextId = useRef(2);
  const [entries, setEntries] = useState<Entry[]>([
    { id: 0, name: "" },
    { id: 1, name: "" },
  ]);
  const setParticipants = useSessionStore((s) => s.setParticipants);
  const setPhase = useSessionStore((s) => s.setPhase);

  function addParticipant() {
    if (entries.length < 8) {
      setEntries([...entries, { id: nextId.current++, name: "" }]);
    }
  }

  function removeParticipant(id: number) {
    if (entries.length > 2) setEntries(entries.filter((e) => e.id !== id));
  }

  function updateName(id: number, value: string) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, name: value } : e)));
  }

  function handleStart() {
    const trimmed = entries.map((e) => e.name.trim()).filter(Boolean);
    if (trimmed.length < 2) return;
    setParticipants(trimmed);
    setPhase("enrollment");
  }

  const valid = entries.filter((e) => e.name.trim()).length >= 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-primary">VoxShare</CardTitle>
          <CardDescription>Track who speaks, how much, and for how long.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <NameInput
                key={entry.id}
                value={entry.name}
                onChange={(v) => updateName(entry.id, v)}
                onRemove={entries.length > 2 ? () => removeParticipant(entry.id) : undefined}
                placeholder={`Participant ${i + 1}`}
              />
            ))}
            {entries.length < 8 && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={addParticipant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add participant
              </Button>
            )}
          </div>
          <Button className="w-full" disabled={!valid} onClick={handleStart}>
            Start Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
