import { expect, test } from '@playwright/test';

test('public static wireframe is clear about implemented and proposed screens', async ({
  page,
}) => {
  const apiRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/')) apiRequests.push(request.url());
  });

  await page.goto('./');
  await expect(page).toHaveTitle('MindCommons — Future product vision');
  await expect(
    page.getByRole('heading', { name: /A commons takes more than a screen/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Community onboarding' })).toBeVisible();
  await expect(page.getByText('PROTOTYPE').first()).toBeVisible();
  await expect(page.getByText('PROPOSED').first()).toBeVisible();
  await expect(page.getByText('static preview only')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Prototype source' })).toHaveAttribute(
    'href',
    'https://github.com/Bepoadewale/mindcommons',
  );
  await expect(page.getByRole('link', { name: 'Working prototype' })).toHaveCount(0);
  expect(apiRequests).toEqual([]);
});

test('static wireframe fits an Android-sized viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport);
});

test('static wireframe passes WCAG 2.1 A and AA axe checks', async ({ page }) => {
  await page.goto('./');
  await page.addScriptTag({
    path: new URL('../../node_modules/axe-core/axe.min.js', import.meta.url).pathname,
  });
  const violations = await page.evaluate(async () => {
    const browser = window as unknown as Window & {
      axe: {
        run: (
          context: Document,
          options: { runOnly: string[] },
        ) => Promise<{ violations: Array<{ id: string; impact: string | null }> }>;
      };
    };
    const results = await browser.axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    });
    return results.violations.map(({ id, impact }) => `${id}:${impact}`);
  });
  expect(violations).toEqual([]);
});
