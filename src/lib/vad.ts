import { MicVAD } from "@ricky0123/vad-web";

export async function createVAD(
  onSpeechStart: () => void,
  onSpeechEnd: (audio: Float32Array) => void,
): Promise<MicVAD> {
  return MicVAD.new({
    baseAssetPath: "/",
    onnxWASMBasePath: "/",
    model: "legacy",
    minSpeechMs: 300,
    preSpeechPadMs: 200,
    positiveSpeechThreshold: 0.6,
    negativeSpeechThreshold: 0.45,
    onSpeechStart,
    onSpeechEnd,
  });
}
