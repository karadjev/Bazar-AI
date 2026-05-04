import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  /* По умолчанию только API (не требует Next на :3000). Веб: npm run e2e:web или npm run e2e:all */
  projects: [
    {
      name: "api",
      testMatch: "**/alpha-flow.spec.ts",
      use: {
        baseURL: process.env.E2E_API_URL || "http://127.0.0.1:8080"
      }
    },
    {
      name: "web",
      testMatch: "**/web-smoke.spec.ts",
      use: {
        baseURL: process.env.E2E_WEB_URL || "http://127.0.0.1:3000"
      }
    }
  ]
});
