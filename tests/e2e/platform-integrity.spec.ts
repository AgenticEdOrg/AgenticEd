import { expect, test } from '@playwright/test';
import { metric, timedGoto } from './helpers';

test('all core learning links resolve', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One profile is sufficient for link integrity.');
  await timedGoto(page, '/index.html', testInfo);
  const hrefs = await page.locator('a[href]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute('href') || ''))]
      .filter((href) => href && !href.startsWith('#') && !href.startsWith('mailto:') && !/^https?:/i.test(href))
  );
  const broken: Array<{ href: string; status: number }> = [];
  for (const href of hrefs) {
    const response = await request.get(new URL(href, 'http://127.0.0.1:4173/index.html').toString());
    if (!response.ok()) broken.push({ href, status: response.status() });
  }
  metric(testInfo, 'links_checked', String(hrefs.length));
  metric(testInfo, 'broken_core_links', String(broken.length));
  expect(broken, `Broken links: ${JSON.stringify(broken)}`).toEqual([]);
});

test('every week exposes the core curriculum components', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Content structure is browser-independent.');
  let available = 0;
  let expected = 0;
  for (let week = 1; week <= 6; week += 1) {
    await timedGoto(page, `/week${week}.html`, testInfo, week);
    const checks = [
      page.getByText(`Week ${week} of 6`, { exact: true }),
      page.locator('#activity-result'),
      page.getByRole('link', { name: new RegExp(`Week ${week} Quiz`, 'i') }),
      page.getByRole('link', { name: /Your Portfolio/i })
    ];
    for (const locator of checks) {
      expected += 1;
      if ((await locator.count()) > 0) available += 1;
    }
  }
  metric(testInfo, 'curriculum_components', JSON.stringify({ available, expected }));
  expect(available).toBe(expected);
});
