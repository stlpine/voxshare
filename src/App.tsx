import DashboardScreen from "./components/dashboard/DashboardScreen";
import EnrollmentScreen from "./components/enrollment/EnrollmentScreen";
import SessionScreen from "./components/session/SessionScreen";
import SetupScreen from "./components/setup/SetupScreen";
import { useSessionStore } from "./store/sessionStore";

export default function App() {
  const phase = useSessionStore((s) => s.phase);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {phase === "setup" && <SetupScreen />}
      {phase === "enrollment" && <EnrollmentScreen />}
      {phase === "session" && <SessionScreen />}
      {phase === "dashboard" && <DashboardScreen />}
    </div>
  );
}
