import type { SetupFormData, SetupState } from '@/lib/types';

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export async function fetchSetupState(): Promise<SetupState> {
  const response = await fetch('/api/setup');
  return readJson<SetupState>(response);
}

export async function saveSetupState(form: SetupFormData): Promise<SetupState> {
  const response = await fetch('/api/setup', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form),
  });

  return readJson<SetupState>(response);
}
