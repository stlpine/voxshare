import type React from "react";
import { useEffect, useRef } from "react";

export function useWaveform(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animFrameRef = useRef(0);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    async function init() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      function draw() {
        if (stopped) return;
        animFrameRef.current = requestAnimationFrame(draw);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#818cf8";
        ctx.beginPath();

        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] ?? 128) / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      draw();
    }

    init().catch(console.error);

    return () => {
      stopped = true;
      cancelAnimationFrame(animFrameRef.current);
      stream?.getTracks().forEach((t) => {
        t.stop();
      });
      audioCtx?.close().catch(console.error);
    };
  }, [canvasRef]);
}
