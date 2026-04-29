import { useSessionStore } from "../../store/sessionStore";
import EnrollmentCard from "./EnrollmentCard";

export default function EnrollmentScreen() {
  const participants = useSessionStore((s) => s.participants);
  const enrollmentIndex = useSessionStore((s) => s.enrollmentIndex);
  const current = participants[enrollmentIndex];

  if (!current) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Voice Enrollment</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {enrollmentIndex + 1} of {participants.length}
        </p>
      </div>
      <EnrollmentCard key={current.id} participant={current} />
    </div>
  );
}
