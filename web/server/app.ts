import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { resolve } from 'path';
import type { Request, Response } from 'express';
import { getSetupState, saveSetupForm } from '../../lib/setup-store.mjs';

interface CreateAppOptions {
  workspaceRoot: string;
}

export function createApp({ workspaceRoot }: CreateAppOptions) {
  const app = express();
  const distDir = resolve(process.cwd(), 'dist');
  const indexPath = resolve(distDir, 'index.html');
  const handlers = createSetupHandlers({ workspaceRoot });

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/setup', handlers.loadSetup);
  app.put('/api/setup', handlers.updateSetup);

  if (existsSync(indexPath)) {
    app.use(express.static(distDir));

    app.get('*', (_request, response) => {
      response.sendFile(indexPath);
    });
  }

  return app;
}

export function createSetupHandlers({ workspaceRoot }: CreateAppOptions) {
  return {
    async loadSetup(_request: Request, response: Response) {
      try {
        const state = await getSetupState(workspaceRoot);
        response.json(state);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load setup state';
        response.status(500).send(message);
      }
    },

    async updateSetup(request: Request, response: Response) {
      if (!request.body || typeof request.body !== 'object') {
        response.status(400).send('Invalid form payload');
        return;
      }

      try {
        const state = await saveSetupForm(workspaceRoot, request.body);
        response.json(state);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save setup state';
        response.status(500).send(message);
      }
    },
  };
}
