const RECORDING_MS = 5000;

export async function recordEnrollmentAudio(): Promise<Float32Array> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => {
        t.stop();
      });
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
      stream.getTracks().forEach((t) => {
        t.stop();
      });
      reject(new Error("MediaRecorder error"));
    };

    recorder.start();
    setTimeout(() => recorder.stop(), RECORDING_MS);
  });
}
