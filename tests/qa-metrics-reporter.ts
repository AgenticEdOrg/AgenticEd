import type { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'node:fs';
import path from 'node:path';

type RecordedTest = {
  title: string;
  project: string;
  status: string;
  duration_ms: number;
  annotations: Array<{ type: string; description?: string }>;
};

class QaMetricsReporter implements Reporter {
  private tests: RecordedTest[] = [];
  private rootDir = process.cwd();

  onBegin(config: FullConfig) {
    this.rootDir = config.rootDir ? path.resolve(config.rootDir, '..', '..') : process.cwd();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.tests.push({
      title: test.titlePath().join(' > '),
      project: test.parent.project()?.name || 'unknown',
      status: result.status,
      duration_ms: result.duration,
      annotations: test.annotations.map(({ type, description }) => ({ type, description }))
    });
  }

  onEnd() {
    const outputDir = path.join(process.cwd(), 'metrics', 'raw');
    fs.mkdirSync(outputDir, { recursive: true });
    const now = new Date();
    const payload = {
      schema_version: 1,
      run_id: process.env.QA_RUN_ID || `local-${now.toISOString()}`,
      updated_at: now.toISOString(),
      region: process.env.QA_REGION || 'unspecified',
      tests: this.tests
    };
    fs.writeFileSync(path.join(outputDir, 'latest-run.json'), JSON.stringify(payload, null, 2) + '\n');
  }
}

export default QaMetricsReporter;
