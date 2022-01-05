import { PlaywrightTestConfig, devices } from '@playwright/test';

// import { addAliases } from 'module-alias';
// import * as packageJson from './package.json';
// addAliases(packageJson._moduleAliases);

const config: PlaywrightTestConfig = {
  testMatch: '**/*.e2e.[j|t]s',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default config;