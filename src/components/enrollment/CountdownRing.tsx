import { useEffect, useState } from "react";

interface Props {
  durationMs: number;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownRing({ durationMs }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.min(Date.now() - start, durationMs));
    }, 50);
    return () => clearInterval(id);
  }, [durationMs]);

  const progress = elapsed / durationMs;
  const offset = CIRCUMFERENCE * (1 - progress);
  const secondsLeft = Math.ceil((durationMs - elapsed) / 1000);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="48" cy="48" r={RADIUS} fill="none" stroke="#334155" strokeWidth="6" />
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke="#818cf8"
          strokeWidth="6"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 50ms linear" }}
        />
      </svg>
      <span className="text-indigo-400 font-bold text-xl z-10">{secondsLeft}s</span>
    </div>
  );
}
