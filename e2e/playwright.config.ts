// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports' }],
    ['junit', { outputFile: 'reports/results.xml' }],
    ['list']
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:8080',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // ======================================================
  // 🔧 Servidores locales (solo para desarrollo, no en CI)
  // ======================================================
  webServer: process.env.CI
    ? undefined // En CI no levanta nada (usa URLs QA)
    : [
        // 🟢 Backend local
        {
          command: 'cd ../coffehub/backend && npm start',
          url: 'http://localhost:4000',
          reuseExistingServer: true,
          timeout: 120000,
        },
        // 🟢 Frontend local
        {
          command: 'cd ../coffehub/frontend && npm start',
          url: 'http://localhost:8080',
          reuseExistingServer: true,
          timeout: 120000,
        },
      ],
});