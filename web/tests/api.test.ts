import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createSetupHandlers } from '../server/app';
import { getSetupState } from '../../lib/setup-store.mjs';

async function createWorkspace() {
  return mkdtemp(join(tmpdir(), 'career-ops-api-'));
}

function createMockResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    text: '',
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload: string) {
      this.text = payload;
      return this;
    },
  };
}

describe('setup api', () => {
  test('GET returns normalized defaults for a fresh workspace', async () => {
    const workspace = await createWorkspace();

    try {
      const handlers = createSetupHandlers({ workspaceRoot: workspace });
      const response = createMockResponse();

      await handlers.loadSetup({} as never, response as never);

      expect(response.statusCode).toBe(200);
      expect((response.body as any).complete).toBe(false);
      expect((response.body as any).missing).toContain('cv.md');
      expect((response.body as any).form.targets.primaryRoles.length).toBeGreaterThan(0);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  test('PUT saves setup data and subsequent GET reports complete', async () => {
    const workspace = await createWorkspace();

    try {
      const handlers = createSetupHandlers({ workspaceRoot: workspace });
      const initialState = await getSetupState(workspace);
      const payload = {
        ...initialState.form,
        profile: {
          ...initialState.form.profile,
          fullName: 'Morgan Lee',
          email: 'morgan@example.com',
        },
        cvMarkdown: '# Morgan Lee\n\nApplied AI operator.\n',
      };
      const saveResponse = createMockResponse();

      await handlers.updateSetup({ body: payload } as never, saveResponse as never);
      expect(saveResponse.statusCode).toBe(200);
      expect((saveResponse.body as any).complete).toBe(true);

      const getResponse = createMockResponse();
      await handlers.loadSetup({} as never, getResponse as never);

      expect(getResponse.statusCode).toBe(200);
      expect((getResponse.body as any).complete).toBe(true);
      expect((getResponse.body as any).form.profile.fullName).toBe('Morgan Lee');

      const profileYaml = await readFile(join(workspace, 'config/profile.yml'), 'utf8');
      expect(profileYaml).toContain('Morgan Lee');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
