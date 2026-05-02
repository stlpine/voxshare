import { expect, test } from "@playwright/test";

// How long to wait for the SW-triggered reload to settle and isolation to activate.
// First visit: SW registers → skipWaiting → clients.claim → controllerchange → reload.
const SW_TIMEOUT = 15_000;

async function waitForIsolation(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => window.crossOriginIsolated), { timeout: SW_TIMEOUT })
    .toBe(true);
}

test("service worker sets cross-origin isolation headers", async ({ page }) => {
  await page.goto("/");
  await waitForIsolation(page);
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
});

test("WASM and ONNX assets are fetchable inside the isolated context", async ({ page }) => {
  await page.goto("/");
  await waitForIsolation(page);

  const assets = [
    "/ort-wasm-simd-threaded.wasm",
    "/silero_vad_legacy.onnx",
    "/ort-wasm-simd-threaded.mjs",
    "/vad.worklet.bundle.min.js",
  ];

  for (const asset of assets) {
    // Fetch from within the browser so COEP restrictions apply — this is the
    // same path the ONNX runtime takes when loading the WASM at runtime.
    const status = await page.evaluate(
      async (url) => (await fetch(url)).status,
      asset,
    );
    expect(status, `${asset} returned ${status}, expected 200`).toBe(200);
  }
});

test("WASM file is served with content-type application/wasm", async ({ page }) => {
  await page.goto("/");
  await waitForIsolation(page);

  const contentType = await page.evaluate(async () => {
    const response = await fetch("/ort-wasm-simd-threaded.wasm");
    return response.headers.get("content-type");
  });

  expect(contentType).toContain("application/wasm");
});

test("app renders setup screen", async ({ page }) => {
  await page.goto("/");
  await waitForIsolation(page);
  await expect(page.getByText("VoxShare")).toBeVisible();
});
