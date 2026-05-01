import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite's transform middleware intercepts .mjs/.js requests before the
// public-directory middleware, causing "This file is in /public" errors for
// Worker scripts that onnxruntime-web and vad-web load at runtime.
// This plugin adds a middleware in configureServer (no return value = runs
// BEFORE Vite installs its internal middlewares) and serves those files
// directly as plain static assets, bypassing the transform pipeline.
function staticWorkerAssetsPlugin(): Plugin {
  const assets: Record<string, string> = {
    "/ort-wasm-simd-threaded.mjs": path.join(__dirname, "public/ort-wasm-simd-threaded.mjs"),
    "/vad.worklet.bundle.min.js": path.join(__dirname, "public/vad.worklet.bundle.min.js"),
  };

  return {
    name: "static-worker-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const filePath = req.url && assets[req.url.split("?")[0]];
        if (!filePath) return next();
        const stream = fs.createReadStream(filePath);
        stream.on("error", () => next());
        res.setHeader("Content-Type", "text/javascript");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        stream.pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [staticWorkerAssetsPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
