import Meyda from "meyda";
import type { Participant } from "../types";

const FRAME_SIZE = 2048;
const HOP_SIZE = 1024;
const NUM_COEFFICIENTS = 13;
const SIMILARITY_THRESHOLD = 0.75;

export function extractMFCCProfile(pcm: Float32Array, sampleRate: number): number[] {
  Meyda.bufferSize = FRAME_SIZE;
  Meyda.sampleRate = sampleRate;
  Meyda.numberOfMFCCCoefficients = NUM_COEFFICIENTS;

  const sums = new Array<number>(NUM_COEFFICIENTS).fill(0);
  let frameCount = 0;

  for (let i = 0; i + FRAME_SIZE <= pcm.length; i += HOP_SIZE) {
    const frame = pcm.slice(i, i + FRAME_SIZE);
    const features = Meyda.extract(["mfcc"], frame);
    if (features?.mfcc) {
      for (let j = 0; j < NUM_COEFFICIENTS; j++) {
        sums[j] += features.mfcc[j] ?? 0;
      }
      frameCount++;
    }
  }

  if (frameCount === 0) return sums;
  return sums.map((v) => v / frameCount);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) ** 2;
    normB += (b[i] ?? 0) ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function identifySpeaker(
  pcm: Float32Array,
  sampleRate: number,
  participants: Participant[],
): string | null {
  const profile = extractMFCCProfile(pcm, sampleRate);
  let bestId: string | null = null;
  let bestScore = -Infinity;

  for (const p of participants) {
    if (!p.mfccProfile) continue;
    const score = cosineSimilarity(profile, p.mfccProfile);
    if (score > bestScore) {
      bestScore = score;
      bestId = p.id;
    }
  }

  return bestScore >= SIMILARITY_THRESHOLD ? bestId : null;
}
