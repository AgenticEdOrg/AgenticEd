import { expect, Page, TestInfo } from '@playwright/test';

export function metric(testInfo: TestInfo, type: string, description = '1') {
  testInfo.annotations.push({ type: `qa:${type}`, description });
}

export async function timedGoto(page: Page, path: string, testInfo: TestInfo, lesson?: number) {
  const started = Date.now();
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `${path} should load successfully`).toBeTruthy();
  const elapsed = Date.now() - started;
  metric(testInfo, 'page_load_ms', JSON.stringify({ path, ms: elapsed }));
  if (lesson) metric(testInfo, 'lesson_load_ms', JSON.stringify({ week: lesson, ms: elapsed }));
}

const activities: Record<number, { text?: string[]; selects?: string[] }> = {
  1: { text: ['#f-product', '#f-goal', '#f-think', '#f-act', '#f-obs'] },
  2: { text: ['#r1p', '#r2p', '#r3p'] },
  3: { selects: ['#tool-used'], text: ['#step2', '#step4'] },
  4: { selects: ['#scenario'], text: ['#orch', '#w1', '#w2'] },
  5: { selects: ['#choice', '#tool'], text: ['#sysprompt', '#agentdesc'] },
  6: { selects: ['#pos'], text: ['#arg', '#counter'] }
};

export async function completeActivity(page: Page, week: number) {
  const fields = activities[week];
  for (const selector of fields.selects || []) {
    await page.locator(selector).selectOption({ index: 1 });
  }
  for (const selector of fields.text || []) {
    await page.locator(selector).fill(`Automated QA evidence for AgenticEd Week ${week}`);
  }
  await page.getByRole('button', { name: /Complete|Submit Build Worksheet/i }).click();
  await expect(page.locator('#activity-result')).toBeVisible();
}

export async function passQuiz(page: Page, week: number) {
  await expect.poll(() => page.evaluate((selectedWeek) => Boolean((window as any).AGENTICED_QUIZ?.weeks?.[selectedWeek]), week)).toBeTruthy();
  const answers = await page.evaluate((selectedWeek) => {
    const quiz = (window as any).AGENTICED_QUIZ.weeks[selectedWeek];
    return quiz.questions.map((question: { a: number }) => question.a);
  }, week);
  for (let question = 0; question < answers.length; question += 1) {
    await page.locator(`label[data-q="${question}"][data-o="${answers[question]}"]`).click();
  }
  await page.locator('#grade').click();
  await expect(page.locator('#score')).toBeVisible();
  await expect(page.locator('#score-n')).toContainText(`${answers.length}`);
}

export async function savePortfolioArtifact(page: Page, week: number) {
  const key = `w${week}`;
  const card = page.locator(`.art[data-key="${key}"]`);
  if (!(await card.evaluate((node) => node.classList.contains('done')))) {
    await card.locator('.art__check').click();
  }
  await card.locator('textarea').fill(`Automated portfolio artifact for Week ${week}`);
  await expect(card).toHaveClass(/done/);
  const persisted = await page.evaluate((artifactKey) => {
    const data = JSON.parse(localStorage.getItem('agenticed_portfolio') || '{}');
    return Boolean(data[artifactKey]?.done && data[artifactKey]?.note);
  }, key);
  expect(persisted).toBeTruthy();
}
