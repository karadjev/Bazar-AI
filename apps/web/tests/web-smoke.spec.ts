import { expect, test } from "@playwright/test";

/**
 * Нужен запущенный фронт: npm run dev (порт 3000) или E2E_WEB_URL.
 * Запуск: npm run e2e:web
 */
test.describe("public pages", () => {
  test("главная монтируется", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("page-home")).toBeVisible();
  });

  test("шаблоны и онбординг монтируются", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.getByTestId("page-templates")).toBeVisible();
    await page.goto("/onboarding");
    await expect(page.getByTestId("page-onboarding")).toBeVisible();
  });

  test("демо-витрина монтируется", async ({ page }) => {
    await page.goto("/store/oud-house");
    await expect(page.getByTestId("page-store")).toBeVisible();
  });

  test("тарифы и возможности монтируются", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByTestId("page-pricing")).toBeVisible();
    await page.goto("/features");
    await expect(page.getByTestId("page-features")).toBeVisible();
  });
});
