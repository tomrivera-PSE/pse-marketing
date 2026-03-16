const { chromium } = require('playwright');
const path = require('path');

const DEMO_URL = 'https://demo.payrollsynergyexperts.com';
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots');

const screenshots = [
  {
    name: 'dashboard-overview',
    path: '/',
    waitFor: 3000,
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'compliance-scan',
    path: '/compliance',
    waitFor: 3000,
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'payroll-run',
    path: '/payroll',
    waitFor: 3000,
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'audit-trail',
    path: '/audit',
    waitFor: 3000,
    viewport: { width: 1280, height: 800 },
  },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const shot of screenshots) {
    console.log(`Capturing ${shot.name}...`);
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    try {
      await page.goto(`${DEMO_URL}${shot.path}`, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });
      await page.waitForTimeout(shot.waitFor);
      await page.screenshot({
        path: path.join(OUT_DIR, `${shot.name}.png`),
        fullPage: false,
      });
      console.log(`  ✓ ${shot.name}.png saved`);
    } catch (err) {
      console.error(`  ✗ ${shot.name} failed: ${err.message}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\nDone.');
})();
