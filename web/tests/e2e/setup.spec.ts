import { test, expect } from '@playwright/test';
import { mkdir, readFile, rm } from 'fs/promises';
import { join, resolve } from 'path';

const workspaceRoot = resolve(process.cwd(), 'test-results/playwright-workspace');

test.beforeEach(async () => {
  await rm(workspaceRoot, { recursive: true, force: true });
  await mkdir(workspaceRoot, { recursive: true });
});

test('completes onboarding and writes the setup files', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Full name').fill('Riley Quinn');
  await page.getByLabel('Email').fill('riley@example.com');
  await page.getByRole('button', { name: 'CV' }).click();
  await page.getByLabel('CV markdown').fill('# Riley Quinn\n\n- Builds pragmatic systems.\n');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Create setup files' }).click();

  await expect(page.getByRole('button', { name: 'Save settings' })).toBeVisible();

  const profileYaml = await readFile(join(workspaceRoot, 'config/profile.yml'), 'utf8');
  const portalsYaml = await readFile(join(workspaceRoot, 'portals.yml'), 'utf8');
  const cvMarkdown = await readFile(join(workspaceRoot, 'cv.md'), 'utf8');
  const tracker = await readFile(join(workspaceRoot, 'data/applications.md'), 'utf8');

  expect(profileYaml).toContain('Riley Quinn');
  expect(portalsYaml).toContain('title_filter');
  expect(cvMarkdown).toContain('# Riley Quinn');
  expect(tracker).toContain('# Applications Tracker');
});
