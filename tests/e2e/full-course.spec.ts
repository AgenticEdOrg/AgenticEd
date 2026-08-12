import { expect, test } from '@playwright/test';
import { completeActivity, metric, passQuiz, savePortfolioArtifact, timedGoto } from './helpers';

test('complete the six-week automated learning journey', async ({ page }, testInfo) => {
  metric(testInfo, 'journey_attempt');
  await timedGoto(page, '/index.html', testInfo);
  await page.getByRole('link', { name: /Start Beginner Foundations/i }).click();

  for (let week = 1; week <= 6; week += 1) {
    metric(testInfo, 'lesson_attempt', String(week));
    await expect(page).toHaveURL(new RegExp(`week${week}\\.html`));
    await expect(page.getByText(`Week ${week} of 6`, { exact: true })).toBeVisible();
    const navigationMs = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      return Math.round(navigation?.duration || 0);
    });
    metric(testInfo, 'lesson_load_ms', JSON.stringify({ week, ms: navigationMs }));
    await completeActivity(page, week);
    metric(testInfo, 'activity_validated', String(week));

    await page.getByRole('link', { name: new RegExp(`Week ${week} Quiz`, 'i') }).click();
    await passQuiz(page, week);
    metric(testInfo, 'assessment_validated', String(week));

    await timedGoto(page, '/portfolio.html', testInfo);
    await savePortfolioArtifact(page, week);
    metric(testInfo, 'portfolio_validated', String(week));
    metric(testInfo, 'lesson_validated', String(week));

    if (week < 6) await timedGoto(page, `/week${week + 1}.html`, testInfo);
  }

  metric(testInfo, 'certificate_attempt');
  await page.getByRole('link', { name: /Get Certificate/i }).click();
  await page.locator('#name').fill('AgenticEd QA Learner');
  await page.locator('#school').fill('Automated Platform Validation');
  await page.locator('#make').click();
  await expect(page.locator('#c-name')).toHaveText('AgenticEd QA Learner');
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('agenticed:certificate')))).toBeTruthy();
  metric(testInfo, 'certificate_validated');
  metric(testInfo, 'journey_success');
});
