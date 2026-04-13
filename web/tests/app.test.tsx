import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '@/App';
import type { SetupState } from '@/lib/types';

function buildState(overrides: Partial<SetupState> = {}): SetupState {
  return {
    complete: false,
    missing: ['cv.md', 'config/profile.yml'],
    form: {
      profile: {
        fullName: '',
        email: '',
        phone: '',
        candidateLocation: '',
        linkedin: '',
        portfolioUrl: '',
        github: '',
        twitter: '',
      },
      targets: {
        primaryRoles: ['Senior AI Engineer'],
        archetypes: [{ id: 'a-1', name: 'AI/ML Engineer', level: 'Senior', fit: 'primary' }],
        headline: '',
        exitStory: '',
        superpowers: ['Fast prototyping'],
      },
      proofPoints: {
        items: [{ id: 'p-1', name: 'Project Alpha', url: '', heroMetric: '40% faster' }],
        dashboardUrl: '',
        dashboardPassword: '',
        dashboardWhenToShare: '',
      },
      compensation: {
        targetRange: '',
        currency: 'USD',
        minimum: '',
        locationFlexibility: '',
      },
      location: {
        country: '',
        city: '',
        timezone: '',
        visaStatus: '',
      },
      framing: {
        adaptiveFraming: [
          {
            id: 'f-1',
            role: 'Platform',
            emphasize: 'Reliability',
            proofPointSources: 'cv.md',
          },
        ],
        crossCuttingAdvantage: '',
        portfolio: {
          url: '',
          password: '',
          whenToShare: '',
        },
        compGuidance: '',
        negotiationSalary: '',
        negotiationGeo: '',
        negotiationLowOffer: '',
        locationPolicyForms: '',
        locationPolicyEvaluations: '',
      },
      cvMarkdown: '',
      scanner: {
        freshness: {
          webSearchRecencyDays: '7',
          maxJobAgeDays: '30',
          requirePostedDate: false,
        },
        positiveKeywords: ['AI'],
        negativeKeywords: ['Junior'],
        seniorityBoost: ['Senior'],
        searchQueries: [{ id: 'q-1', name: 'AI roles', query: 'site:jobs "AI"', enabled: true }],
        trackedCompanies: [
          {
            id: 'c-1',
            name: 'OpenAI',
            careersUrl: 'https://openai.com/careers',
            scanMethod: 'websearch',
            scanQuery: '',
            api: '',
            notes: '',
            enabled: true,
          },
        ],
      },
    },
    ...overrides,
  };
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders onboarding for incomplete setup and updates CV preview', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify(buildState()), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(buildState({ complete: true, missing: [] })), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );

    render(<App />);

    expect(await screen.findByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scanner Filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Queries/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tracked Companies/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create setup files' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Step 6 CV/i }));

    const textarea = await screen.findByLabelText('CV markdown');
    fireEvent.change(textarea, { target: { value: '# Pat Doe\n\n- Built reliable systems.\n' } });

    expect(await screen.findByText('Pat Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Search Queries/i }));
    expect(screen.getByLabelText('Search queries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable all' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Disable AI roles' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('AI roles')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand AI roles' }));
    expect(await screen.findByDisplayValue('AI roles')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tracked Companies/i }));
    expect(screen.getByLabelText('Search companies')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable all' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Disable OpenAI' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand OpenAI' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('OpenAI')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Disable OpenAI' }));
    expect(screen.getByRole('switch', { name: 'Enable OpenAI' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand OpenAI' }));
    expect(await screen.findByDisplayValue('OpenAI')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create setup files' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  test('renders settings tabs for complete setup and loads saved values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify(
            buildState({
              complete: true,
              missing: [],
              form: {
                ...buildState().form,
                profile: {
                  ...buildState().form.profile,
                  fullName: 'Sam Carter',
                },
              },
            }),
          ),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Save settings' })).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Sam Carter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scanner Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search Queries' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tracked Companies' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Scanner Filters' }));
    expect(await screen.findByDisplayValue('AI')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Search Queries' }));
    expect(screen.getByLabelText('Search queries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable all' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Disable AI roles' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand AI roles' }));
    expect(await screen.findByDisplayValue('AI roles')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tracked Companies' }));
    expect(screen.getByLabelText('Search companies')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable all' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Disable OpenAI' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand OpenAI' }));
    expect(await screen.findByDisplayValue('OpenAI')).toBeInTheDocument();
  });
});
