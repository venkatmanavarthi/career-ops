import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  getMissingSetupFiles,
  getSetupState,
  renderProfileMarkdown,
  saveSetupForm,
} from '../../lib/setup-store.mjs';

async function createWorkspace() {
  return mkdtemp(join(tmpdir(), 'career-ops-setup-'));
}

describe('setup-store', () => {
  test('detects missing files in a fresh workspace', async () => {
    const workspace = await createWorkspace();

    try {
      expect(getMissingSetupFiles(workspace)).toEqual([
        'cv.md',
        'config/profile.yml',
        'modes/_profile.md',
        'portals.yml',
        'data/applications.md',
      ]);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('saves form data, preserves unknown yaml keys, and generates profile markdown', async () => {
    const workspace = await createWorkspace();

    try {
      await mkdir(join(workspace, 'config'), { recursive: true });
      await writeFile(
        join(workspace, 'config/profile.yml'),
        'candidate:\n  full_name: Existing Person\npreferences:\n  theme: sand\n',
        'utf8',
      );
      await mkdir(workspace, { recursive: true });
      await writeFile(
        join(workspace, 'portals.yml'),
        'title_filter:\n  positive:\n    - Existing\nmeta:\n  owner: user\n',
        'utf8',
      );

      const initialState = await getSetupState(workspace);
      const nextForm = {
        ...initialState.form,
        profile: {
          ...initialState.form.profile,
          fullName: 'Taylor Rivera',
          email: 'taylor@example.com',
        },
        scanner: {
          ...initialState.form.scanner,
          freshness: {
            ...initialState.form.scanner.freshness,
            webSearchRecencyDays: '3',
            maxJobAgeDays: '14',
            requirePostedDate: true,
          },
          positiveKeywords: ['Platform Engineer', 'AI'],
        },
        framing: {
          ...initialState.form.framing,
          crossCuttingAdvantage: 'Builder who connects operations, systems, and clarity.',
        },
        cvMarkdown: '# Taylor Rivera\n\n- Built systems that shipped.\n',
      };

      const savedState = await saveSetupForm(workspace, nextForm);

      expect(savedState.complete).toBe(true);
      expect(savedState.missing).toEqual([]);

      const profileYaml = await readFile(join(workspace, 'config/profile.yml'), 'utf8');
      const portalsYaml = await readFile(join(workspace, 'portals.yml'), 'utf8');
      const profileMarkdown = await readFile(join(workspace, 'modes/_profile.md'), 'utf8');
      const tracker = await readFile(join(workspace, 'data/applications.md'), 'utf8');

      expect(profileYaml).toContain('Taylor Rivera');
      expect(profileYaml).toContain('theme: sand');
      expect(portalsYaml).toContain('websearch_recency_days: 3');
      expect(portalsYaml).toContain('max_job_age_days: 14');
      expect(portalsYaml).toContain('require_posted_date: true');
      expect(portalsYaml).toContain('Platform Engineer');
      expect(portalsYaml).toContain('owner: user');
      expect(profileMarkdown).toContain('career-ops-generated-profile:');
      expect(profileMarkdown).toContain('Builder who connects operations, systems, and clarity.');
      expect(tracker).toContain('# Applications Tracker');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('renders generated profile markdown from structured framing', () => {
    const output = renderProfileMarkdown({
      adaptiveFraming: [
        {
          id: 'row-1',
          role: 'Platform',
          emphasize: 'Reliability and tooling',
          proofPointSources: 'cv.md + article-digest.md',
        },
      ],
      crossCuttingAdvantage: 'Grounded systems thinker.',
      portfolio: {
        url: 'https://example.com/demo',
        password: 'demo-pass',
        whenToShare: 'LLMOps roles',
      },
      compGuidance: 'Use current market ranges.',
      negotiationSalary: 'Target my preferred range.',
      negotiationGeo: 'Keep comp tied to output.',
      negotiationLowOffer: 'Ask to close the gap.',
      locationPolicyForms: 'State timezone overlap clearly.',
      locationPolicyEvaluations: 'Penalize strict on-site roles only when necessary.',
    });

    expect(output).toContain('career-ops-generated-profile:');
    expect(output).toContain('Grounded systems thinker.');
    expect(output).toContain('https://example.com/demo');
  });
});
