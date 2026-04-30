import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: process.env.E2E_API_URL || "http://127.0.0.1:8080",
    extraHTTPHeaders: { "Content-Type": "application/json" }
  }
});
