import * as React from 'react';
import { startTransition } from 'react';
import { fetchSetupState, saveSetupState } from '@/lib/api';
import type { SetupState } from '@/lib/types';
import { SetupForm } from '@/components/setup-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function App() {
  const [setupState, setSetupState] = React.useState<SetupState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadState = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextState = await fetchSetupState();
      startTransition(() => {
        setSetupState(nextState);
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load setup');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadState();
  }, [loadState]);

  async function handleSave(form: SetupState['form']) {
    setSaving(true);
    setError(null);

    try {
      const nextState = await saveSetupState(form);
      startTransition(() => {
        setSetupState(nextState);
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to save setup');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 px-1">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          Career-Ops
        </p>
        <div className="max-w-4xl">
          <h1 className="font-serif text-4xl tracking-tight md:text-6xl">
            Minimal setup, same repo contract.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            This interface configures Career-Ops through forms only. It writes directly to the same
            files the CLI workflow already expects, including `config/profile.yml`, `portals.yml`,
            `cv.md`, and generated `modes/_profile.md`.
          </p>
        </div>
      </header>

      {error ? (
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading || !setupState ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading setup state</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reading the current repository files and normalizing the form data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SetupForm
          initialForm={setupState.form}
          complete={setupState.complete}
          missing={setupState.missing}
          saving={saving}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
