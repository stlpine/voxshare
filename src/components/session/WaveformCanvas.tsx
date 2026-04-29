import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { useWaveform } from "../../hooks/useWaveform";

export default function WaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useWaveform(canvasRef);
  return (
    <Card className="overflow-hidden">
      <canvas ref={canvasRef} width={600} height={80} className="w-full" />
    </Card>
  );
}
