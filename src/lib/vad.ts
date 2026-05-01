import { MicVAD } from "@ricky0123/vad-web";

export async function createVAD(
  onSpeechStart: () => void,
  onSpeechEnd: (audio: Float32Array) => void,
): Promise<MicVAD> {
  const assetBase = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return MicVAD.new({
    baseAssetPath: assetBase,
    onnxWASMBasePath: assetBase,
    model: "legacy",
    minSpeechMs: 300,
    preSpeechPadMs: 200,
    positiveSpeechThreshold: 0.6,
    negativeSpeechThreshold: 0.45,
    onSpeechStart,
    onSpeechEnd,
  });
}
