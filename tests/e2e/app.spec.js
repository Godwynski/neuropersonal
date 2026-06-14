const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test.describe('Neuropersonal E2E Testing', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Wait for the dev server to be ready since we use wait-on locally, 
    // or we can test against the built app. We will test against the Vite dev server by pointing main.js
    // Playwright launches main.js directly
    electronApp = await electron.launch({
      args: ['electron/main.js'],
      env: { ...process.env, NODE_ENV: 'test' }
    });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('App should launch and display the dashboard', async () => {
    // Wait for the React app to load and the initial elements to appear
    const url = window.url();
    console.log("Current URL:", url);
    const title = await window.title();
    console.log("Window Title:", title);
    const content = await window.content();
    console.log("Window Content Length:", content.length);
    console.log("Window Content Preview:", content.substring(0, 500));
    await expect(window.locator('text=NeurOptimize')).toBeVisible({ timeout: 15000 });
    
    const errors = [];
    window.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    window.on('pageerror', exception => {
      errors.push(exception.message);
    });

    // Navigate to Advanced Tweaks
    await window.click('text=Advanced Tweaks');
    await expect(window.locator('text=Low-level system modifications')).toBeVisible();

    // Navigate to Settings & Backup
    await window.click('text=Settings & Backup');
    await expect(window.locator('text=Registry Rollback')).toBeVisible();

    // Check if there were any console errors during navigation
    expect(errors.length).toBe(0);
  });
});
