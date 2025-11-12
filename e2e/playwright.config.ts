
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  
  // Timeout para cada test
  timeout: 30000,
  
  // Configuración de ejecución
  fullyParallel: false, // Evitar conflictos en BD
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'e2e/reports' }],
    ['junit', { outputFile: 'e2e/reports/results.xml' }],
    ['list']
  ],
  
  use: {
    // Base URL
    baseURL: process.env.FRONTEND_URL || 'http://localhost:8080',
    
    // Screenshots y videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    
    // Navegación
    navigationTimeout: 15000,
    actionTimeout: 10000,
  },

  // Proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Servidor local (opcional, si quieres que Playwright levante el frontend)
  webServer: {
    command: 'npm start',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
});
