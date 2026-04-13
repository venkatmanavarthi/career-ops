import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultWorkspaceRoot = resolve(__dirname, '../..');
const workspaceRoot = process.env.WORKSPACE_ROOT
  ? resolve(process.cwd(), process.env.WORKSPACE_ROOT)
  : defaultWorkspaceRoot;
const port = Number(process.env.PORT ?? 3001);

const app = createApp({ workspaceRoot });

app.listen(port, '127.0.0.1', () => {
  console.log(`career-ops setup api listening on http://127.0.0.1:${port}`);
  console.log(`workspace root: ${workspaceRoot}`);
});
