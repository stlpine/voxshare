import { copyFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const assets = [
  "node_modules/@ricky0123/vad-web/dist/silero_vad_legacy.onnx",
  "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
  "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
  "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs",
];

for (const asset of assets) {
  const filename = asset.split("/").pop();
  await copyFile(join(root, asset), join(root, "public", filename));
  console.log(`  copied ${filename}`);
}
