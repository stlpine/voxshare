const RECORDING_MS = 5000;
const RMS_THRESHOLD = 0.02;

export async function recordEnrollmentAudio(
  onVoiceActivity?: (speaking: boolean) => void,
): Promise<Float32Array> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  let analyserCtx: AudioContext | null = null;
  let animFrameId: number | null = null;

  if (onVoiceActivity) {
    analyserCtx = new AudioContext({ latencyHint: "interactive" });
    const source = analyserCtx.createMediaStreamSource(stream);
    const analyser = analyserCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);
      onVoiceActivity(rms > RMS_THRESHOLD);
      animFrameId = requestAnimationFrame(tick);
    };
    animFrameId = requestAnimationFrame(tick);
  }

  function cleanup() {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    if (analyserCtx) void analyserCtx.close();
    for (const t of stream.getTracks()) t.stop();
  }

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      cleanup();
      const blob = new Blob(chunks, { type: mimeType });
      blob
        .arrayBuffer()
        .then((buf) => {
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          return audioCtx.decodeAudioData(buf).then((audioBuffer) => {
            void audioCtx.close();
            resolve(audioBuffer.getChannelData(0));
          });
        })
        .catch(reject);
    };

    recorder.onerror = () => {
      cleanup();
      reject(new Error("MediaRecorder error"));
    };

    recorder.start();
    setTimeout(() => recorder.stop(), RECORDING_MS);
  });
}
