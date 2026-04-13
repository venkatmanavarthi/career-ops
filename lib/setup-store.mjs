import { existsSync, readFileSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const GENERATED_PROFILE_COMMENT = 'career-ops-generated-profile:';

export const REQUIRED_SETUP_FILES = [
  'cv.md',
  'config/profile.yml',
  'modes/_profile.md',
  'portals.yml',
  'data/applications.md',
];

export const TRACKER_TEMPLATE = `# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`;

function templatePath(projectRoot, relativePath) {
  const projectCandidate = join(projectRoot, relativePath);
  if (existsSync(projectCandidate)) {
    return projectCandidate;
  }
  return join(repoRoot, relativePath);
}

function projectPath(projectRoot, relativePath) {
  return join(projectRoot, relativePath);
}

async function ensureDirForFile(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) {
    return '';
  }
  return readFile(filePath, 'utf8');
}

function readYamlFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  const content = readFileSync(filePath, 'utf8');
  return YAML.parse(content) ?? {};
}

async function writeYamlFile(filePath, value) {
  await ensureDirForFile(filePath);
  const content = `${YAML.stringify(value).trimEnd()}\n`;
  await writeFile(filePath, content, 'utf8');
}

function mergeUnknown(existingValue, patchValue) {
  if (Array.isArray(patchValue)) {
    return patchValue;
  }

  if (patchValue === null || typeof patchValue !== 'object') {
    return patchValue;
  }

  const base = existingValue && typeof existingValue === 'object' && !Array.isArray(existingValue)
    ? { ...existingValue }
    : {};

  for (const [key, value] of Object.entries(patchValue)) {
    base[key] = mergeUnknown(base[key], value);
  }

  return base;
}

function cleanString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function cleanIntegerString(value, fallback = '') {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return typeof value === 'string' ? value.trim() : fallback;
}

function cleanStringArray(values, fallback = []) {
  if (!Array.isArray(values)) {
    return fallback;
  }
  return values
    .map((value) => cleanString(value).trim())
    .filter(Boolean);
}

function createId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

function optionalPositiveInteger(value) {
  const normalized = cleanIntegerString(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function decodeProfileMetadata(content) {
  const match = content.match(/<!--\s*career-ops-generated-profile:([A-Za-z0-9+/=_-]+)\s*-->/);
  if (!match) {
    return null;
  }

  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function encodeProfileMetadata(framing) {
  return Buffer.from(JSON.stringify(framing), 'utf8').toString('base64');
}

function defaultFraming() {
  return {
    adaptiveFraming: [
      {
        role: 'Platform / LLMOps',
        emphasize: 'Production systems builder, observability, evals',
        proofPointSources: 'article-digest.md + cv.md',
      },
      {
        role: 'Agentic / Automation',
        emphasize: 'Multi-agent orchestration, HITL, reliability',
        proofPointSources: 'article-digest.md + cv.md',
      },
      {
        role: 'Technical AI PM',
        emphasize: 'Product discovery, PRDs, metrics',
        proofPointSources: 'cv.md + article-digest.md',
      },
    ],
    crossCuttingAdvantage: 'Technical builder with real-world proof',
    portfolio: {
      url: '',
      password: '',
      whenToShare: '',
    },
    compGuidance: 'Use current market data and frame compensation by role title, not by tool list.',
    negotiationSalary:
      'Based on market data for this role, I am targeting the range from my profile. I am flexible on structure as long as the total package is aligned.',
    negotiationGeo:
      'The roles I am competitive for are output-based, not postcode-based. My track record does not change based on location.',
    negotiationLowOffer:
      'I am comparing against opportunities in the higher part of my range. I am interested in the role, so let’s explore whether we can close the gap.',
    locationPolicyForms: 'State actual location, timezone overlap, and travel availability plainly in forms.',
    locationPolicyEvaluations:
      'Score remote and hybrid roles based on real feasibility. Only treat fully on-site, no-exception roles as hard blockers.',
  };
}

function buildDefaultFormData(profileDoc, portalsDoc) {
  const dashboard = profileDoc?.narrative?.dashboard ?? {};
  return {
    profile: {
      fullName: cleanString(profileDoc?.candidate?.full_name, ''),
      email: cleanString(profileDoc?.candidate?.email, ''),
      phone: cleanString(profileDoc?.candidate?.phone, ''),
      candidateLocation: cleanString(profileDoc?.candidate?.location, ''),
      linkedin: cleanString(profileDoc?.candidate?.linkedin, ''),
      portfolioUrl: cleanString(profileDoc?.candidate?.portfolio_url, ''),
      github: cleanString(profileDoc?.candidate?.github, ''),
      twitter: cleanString(profileDoc?.candidate?.twitter, ''),
    },
    targets: {
      primaryRoles: cleanStringArray(profileDoc?.target_roles?.primary, []),
      archetypes: (profileDoc?.target_roles?.archetypes ?? []).map((entry, index) => ({
        id: cleanString(entry?.id, createId('archetype', index)),
        name: cleanString(entry?.name, ''),
        level: cleanString(entry?.level, ''),
        fit: cleanString(entry?.fit, 'primary'),
      })),
      headline: cleanString(profileDoc?.narrative?.headline, ''),
      exitStory: cleanString(profileDoc?.narrative?.exit_story, ''),
      superpowers: cleanStringArray(profileDoc?.narrative?.superpowers, []),
    },
    proofPoints: {
      items: (profileDoc?.narrative?.proof_points ?? []).map((entry, index) => ({
        id: cleanString(entry?.id, createId('proof', index)),
        name: cleanString(entry?.name, ''),
        url: cleanString(entry?.url, ''),
        heroMetric: cleanString(entry?.hero_metric, ''),
      })),
      dashboardUrl: cleanString(dashboard?.url, ''),
      dashboardPassword: cleanString(dashboard?.password, ''),
      dashboardWhenToShare: cleanString(dashboard?.when_to_share, ''),
    },
    compensation: {
      targetRange: cleanString(profileDoc?.compensation?.target_range, ''),
      currency: cleanString(profileDoc?.compensation?.currency, ''),
      minimum: cleanString(profileDoc?.compensation?.minimum, ''),
      locationFlexibility: cleanString(profileDoc?.compensation?.location_flexibility, ''),
    },
    location: {
      country: cleanString(profileDoc?.location?.country, ''),
      city: cleanString(profileDoc?.location?.city, ''),
      timezone: cleanString(profileDoc?.location?.timezone, ''),
      visaStatus: cleanString(profileDoc?.location?.visa_status, ''),
    },
    framing: defaultFraming(),
    cvMarkdown: '',
    scanner: {
      freshness: {
        webSearchRecencyDays: cleanIntegerString(
          portalsDoc?.freshness?.websearch_recency_days,
          '7',
        ),
        maxJobAgeDays: cleanIntegerString(portalsDoc?.freshness?.max_job_age_days, '30'),
        requirePostedDate: portalsDoc?.freshness?.require_posted_date === true,
      },
      positiveKeywords: cleanStringArray(portalsDoc?.title_filter?.positive, []),
      negativeKeywords: cleanStringArray(portalsDoc?.title_filter?.negative, []),
      seniorityBoost: cleanStringArray(portalsDoc?.title_filter?.seniority_boost, []),
      searchQueries: (portalsDoc?.search_queries ?? []).map((entry, index) => ({
        id: cleanString(entry?.id, createId('search-query', index)),
        name: cleanString(entry?.name, ''),
        query: cleanString(entry?.query, ''),
        enabled: entry?.enabled !== false,
      })),
      trackedCompanies: (portalsDoc?.tracked_companies ?? []).map((entry, index) => ({
        id: cleanString(entry?.id, createId('company', index)),
        name: cleanString(entry?.name, ''),
        careersUrl: cleanString(entry?.careers_url, ''),
        scanMethod: cleanString(entry?.scan_method, 'playwright'),
        scanQuery: cleanString(entry?.scan_query, ''),
        api: cleanString(entry?.api, ''),
        notes: cleanString(entry?.notes, ''),
        enabled: entry?.enabled !== false,
      })),
    },
  };
}

function normalizeFormData(raw, defaults) {
  const source = raw ?? {};
  const merged = mergeUnknown(defaults, source);

  return {
    profile: {
      fullName: cleanString(merged.profile?.fullName),
      email: cleanString(merged.profile?.email),
      phone: cleanString(merged.profile?.phone),
      candidateLocation: cleanString(merged.profile?.candidateLocation),
      linkedin: cleanString(merged.profile?.linkedin),
      portfolioUrl: cleanString(merged.profile?.portfolioUrl),
      github: cleanString(merged.profile?.github),
      twitter: cleanString(merged.profile?.twitter),
    },
    targets: {
      primaryRoles: cleanStringArray(merged.targets?.primaryRoles, defaults.targets.primaryRoles),
      archetypes: (merged.targets?.archetypes ?? defaults.targets.archetypes).map((entry, index) => ({
        id: cleanString(entry?.id, createId('archetype', index)),
        name: cleanString(entry?.name),
        level: cleanString(entry?.level),
        fit: cleanString(entry?.fit, 'primary'),
      })),
      headline: cleanString(merged.targets?.headline),
      exitStory: cleanString(merged.targets?.exitStory),
      superpowers: cleanStringArray(merged.targets?.superpowers, defaults.targets.superpowers),
    },
    proofPoints: {
      items: (merged.proofPoints?.items ?? defaults.proofPoints.items).map((entry, index) => ({
        id: cleanString(entry?.id, createId('proof', index)),
        name: cleanString(entry?.name),
        url: cleanString(entry?.url),
        heroMetric: cleanString(entry?.heroMetric),
      })),
      dashboardUrl: cleanString(merged.proofPoints?.dashboardUrl),
      dashboardPassword: cleanString(merged.proofPoints?.dashboardPassword),
      dashboardWhenToShare: cleanString(merged.proofPoints?.dashboardWhenToShare),
    },
    compensation: {
      targetRange: cleanString(merged.compensation?.targetRange),
      currency: cleanString(merged.compensation?.currency),
      minimum: cleanString(merged.compensation?.minimum),
      locationFlexibility: cleanString(merged.compensation?.locationFlexibility),
    },
    location: {
      country: cleanString(merged.location?.country),
      city: cleanString(merged.location?.city),
      timezone: cleanString(merged.location?.timezone),
      visaStatus: cleanString(merged.location?.visaStatus),
    },
    framing: {
      adaptiveFraming: (merged.framing?.adaptiveFraming ?? defaults.framing.adaptiveFraming).map((entry, index) => ({
        id: cleanString(entry?.id, createId('framing', index)),
        role: cleanString(entry?.role),
        emphasize: cleanString(entry?.emphasize),
        proofPointSources: cleanString(entry?.proofPointSources),
      })),
      crossCuttingAdvantage: cleanString(
        merged.framing?.crossCuttingAdvantage,
        defaults.framing.crossCuttingAdvantage,
      ),
      portfolio: {
        url: cleanString(merged.framing?.portfolio?.url, defaults.framing.portfolio.url),
        password: cleanString(
          merged.framing?.portfolio?.password,
          defaults.framing.portfolio.password,
        ),
        whenToShare: cleanString(
          merged.framing?.portfolio?.whenToShare,
          defaults.framing.portfolio.whenToShare,
        ),
      },
      compGuidance: cleanString(merged.framing?.compGuidance, defaults.framing.compGuidance),
      negotiationSalary: cleanString(
        merged.framing?.negotiationSalary,
        defaults.framing.negotiationSalary,
      ),
      negotiationGeo: cleanString(merged.framing?.negotiationGeo, defaults.framing.negotiationGeo),
      negotiationLowOffer: cleanString(
        merged.framing?.negotiationLowOffer,
        defaults.framing.negotiationLowOffer,
      ),
      locationPolicyForms: cleanString(
        merged.framing?.locationPolicyForms,
        defaults.framing.locationPolicyForms,
      ),
      locationPolicyEvaluations: cleanString(
        merged.framing?.locationPolicyEvaluations,
        defaults.framing.locationPolicyEvaluations,
      ),
    },
    cvMarkdown: cleanString(merged.cvMarkdown),
    scanner: {
      freshness: {
        webSearchRecencyDays: cleanIntegerString(
          merged.scanner?.freshness?.webSearchRecencyDays,
          defaults.scanner.freshness.webSearchRecencyDays,
        ),
        maxJobAgeDays: cleanIntegerString(
          merged.scanner?.freshness?.maxJobAgeDays,
          defaults.scanner.freshness.maxJobAgeDays,
        ),
        requirePostedDate:
          merged.scanner?.freshness?.requirePostedDate === true
          || (merged.scanner?.freshness?.requirePostedDate !== false
            && defaults.scanner.freshness.requirePostedDate),
      },
      positiveKeywords: cleanStringArray(
        merged.scanner?.positiveKeywords,
        defaults.scanner.positiveKeywords,
      ),
      negativeKeywords: cleanStringArray(
        merged.scanner?.negativeKeywords,
        defaults.scanner.negativeKeywords,
      ),
      seniorityBoost: cleanStringArray(
        merged.scanner?.seniorityBoost,
        defaults.scanner.seniorityBoost,
      ),
      searchQueries: (merged.scanner?.searchQueries ?? defaults.scanner.searchQueries).map((entry, index) => ({
        id: cleanString(entry?.id, createId('search-query', index)),
        name: cleanString(entry?.name),
        query: cleanString(entry?.query),
        enabled: entry?.enabled !== false,
      })),
      trackedCompanies: (merged.scanner?.trackedCompanies ?? defaults.scanner.trackedCompanies).map((entry, index) => ({
        id: cleanString(entry?.id, createId('company', index)),
        name: cleanString(entry?.name),
        careersUrl: cleanString(entry?.careersUrl),
        scanMethod: cleanString(entry?.scanMethod, 'playwright'),
        scanQuery: cleanString(entry?.scanQuery),
        api: cleanString(entry?.api),
        notes: cleanString(entry?.notes),
        enabled: entry?.enabled !== false,
      })),
    },
  };
}

async function createDefaults(projectRoot) {
  const profileExample = readYamlFile(templatePath(projectRoot, 'config/profile.example.yml')) ?? {};
  const portalsExample = readYamlFile(templatePath(projectRoot, 'templates/portals.example.yml')) ?? {};
  return buildDefaultFormData(profileExample, portalsExample);
}

function profilePatchFromForm(form) {
  const proofPoints = form.proofPoints.items
    .filter((entry) => entry.name || entry.url || entry.heroMetric)
    .map((entry) => ({
      name: entry.name,
      url: entry.url,
      hero_metric: entry.heroMetric,
    }));

  const patch = {
    candidate: {
      full_name: form.profile.fullName,
      email: form.profile.email,
      phone: form.profile.phone,
      location: form.profile.candidateLocation,
      linkedin: form.profile.linkedin,
      portfolio_url: form.profile.portfolioUrl,
      github: form.profile.github,
      twitter: form.profile.twitter,
    },
    target_roles: {
      primary: form.targets.primaryRoles,
      archetypes: form.targets.archetypes
        .filter((entry) => entry.name || entry.level)
        .map((entry) => ({
          name: entry.name,
          level: entry.level,
          fit: entry.fit,
        })),
    },
    narrative: {
      headline: form.targets.headline,
      exit_story: form.targets.exitStory,
      superpowers: form.targets.superpowers,
      proof_points: proofPoints,
    },
    compensation: {
      target_range: form.compensation.targetRange,
      currency: form.compensation.currency,
      minimum: form.compensation.minimum,
      location_flexibility: form.compensation.locationFlexibility,
    },
    location: {
      country: form.location.country,
      city: form.location.city,
      timezone: form.location.timezone,
      visa_status: form.location.visaStatus,
    },
  };

  if (form.proofPoints.dashboardUrl || form.proofPoints.dashboardPassword || form.proofPoints.dashboardWhenToShare) {
    patch.narrative.dashboard = {
      url: form.proofPoints.dashboardUrl,
      password: form.proofPoints.dashboardPassword,
      when_to_share: form.proofPoints.dashboardWhenToShare,
    };
  } else {
    patch.narrative.dashboard = null;
  }

  return patch;
}

function portalsPatchFromForm(form) {
  return {
    freshness: {
      websearch_recency_days: optionalPositiveInteger(form.scanner.freshness.webSearchRecencyDays),
      max_job_age_days: optionalPositiveInteger(form.scanner.freshness.maxJobAgeDays),
      require_posted_date: form.scanner.freshness.requirePostedDate,
    },
    title_filter: {
      positive: form.scanner.positiveKeywords,
      negative: form.scanner.negativeKeywords,
      seniority_boost: form.scanner.seniorityBoost,
    },
    search_queries: form.scanner.searchQueries
      .filter((entry) => entry.name || entry.query)
      .map((entry) => ({
        name: entry.name,
        query: entry.query,
        enabled: entry.enabled,
      })),
    tracked_companies: form.scanner.trackedCompanies
      .filter((entry) => entry.name || entry.careersUrl)
      .map((entry) => ({
        name: entry.name,
        careers_url: entry.careersUrl,
        scan_method: entry.scanMethod || undefined,
        scan_query: entry.scanQuery || undefined,
        api: entry.api || undefined,
        notes: entry.notes || undefined,
        enabled: entry.enabled,
      })),
  };
}

export function renderProfileMarkdown(framing) {
  const metadata = encodeProfileMetadata(framing);
  const adaptiveRows = framing.adaptiveFraming
    .filter((entry) => entry.role || entry.emphasize || entry.proofPointSources)
    .map(
      (entry) =>
        `| ${entry.role || 'Role'} | ${entry.emphasize || 'What to emphasize'} | ${entry.proofPointSources || 'Sources'} |`,
    )
    .join('\n');

  const portfolioLines = framing.portfolio.url
    ? [
        `- URL: ${framing.portfolio.url}`,
        framing.portfolio.password ? `- Password: ${framing.portfolio.password}` : '',
        framing.portfolio.whenToShare
          ? `- When to share: ${framing.portfolio.whenToShare}`
          : '',
      ].filter(Boolean)
    : ['- No public demo configured yet.'];

  return `# User Profile Context -- career-ops

<!-- Managed by the career-ops setup UI. Edit through the form-based settings screen. -->
<!-- ${GENERATED_PROFILE_COMMENT}${metadata} -->

## Your Adaptive Framing

| If the role is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
${adaptiveRows || '| Role | Focus | Sources |'}

## Your Cross-cutting Advantage

${framing.crossCuttingAdvantage}

## Your Portfolio / Demo

${portfolioLines.join('\n')}

## Your Comp Targets

${framing.compGuidance}

## Your Negotiation Scripts

**Salary expectations:**
> "${framing.negotiationSalary}"

**Geographic discount pushback:**
> "${framing.negotiationGeo}"

**When offered below target:**
> "${framing.negotiationLowOffer}"

## Your Location Policy

**In forms:**
${framing.locationPolicyForms}

**In evaluations:**
${framing.locationPolicyEvaluations}
`;
}

export async function ensureTracker(projectRoot) {
  const trackerPath = projectPath(projectRoot, 'data/applications.md');
  if (!existsSync(trackerPath)) {
    await ensureDirForFile(trackerPath);
    await writeFile(trackerPath, TRACKER_TEMPLATE, 'utf8');
  }
}

export function getMissingSetupFiles(projectRoot) {
  return REQUIRED_SETUP_FILES.filter((relativePath) => !existsSync(projectPath(projectRoot, relativePath)));
}

export async function getSetupState(projectRoot) {
  const defaults = await createDefaults(projectRoot);

  const profileDoc = readYamlFile(projectPath(projectRoot, 'config/profile.yml'))
    ?? readYamlFile(templatePath(projectRoot, 'config/profile.example.yml'))
    ?? {};
  const portalsDoc = readYamlFile(projectPath(projectRoot, 'portals.yml'))
    ?? readYamlFile(templatePath(projectRoot, 'templates/portals.example.yml'))
    ?? {};
  const cvMarkdown = await readTextIfExists(projectPath(projectRoot, 'cv.md'));
  const profileMarkdown = await readTextIfExists(projectPath(projectRoot, 'modes/_profile.md'));
  const framingMetadata = decodeProfileMetadata(profileMarkdown);

  const form = normalizeFormData(
    {
      ...buildDefaultFormData(profileDoc, portalsDoc),
      framing: framingMetadata ?? defaults.framing,
      cvMarkdown,
    },
    defaults,
  );

  return {
    complete: getMissingSetupFiles(projectRoot).length === 0,
    missing: getMissingSetupFiles(projectRoot),
    form,
  };
}

export async function saveSetupForm(projectRoot, rawForm) {
  const defaults = await createDefaults(projectRoot);
  const form = normalizeFormData(rawForm, defaults);

  await mkdir(projectPath(projectRoot, 'data'), { recursive: true });
  await mkdir(projectPath(projectRoot, 'output'), { recursive: true });
  await mkdir(projectPath(projectRoot, 'reports'), { recursive: true });

  const existingProfileDoc = readYamlFile(projectPath(projectRoot, 'config/profile.yml'))
    ?? readYamlFile(templatePath(projectRoot, 'config/profile.example.yml'))
    ?? {};
  const existingPortalsDoc = readYamlFile(projectPath(projectRoot, 'portals.yml'))
    ?? readYamlFile(templatePath(projectRoot, 'templates/portals.example.yml'))
    ?? {};

  const nextProfileDoc = mergeUnknown(existingProfileDoc, profilePatchFromForm(form));
  if (nextProfileDoc?.narrative?.dashboard === null) {
    delete nextProfileDoc.narrative.dashboard;
  }

  const nextPortalsDoc = mergeUnknown(existingPortalsDoc, portalsPatchFromForm(form));

  await writeYamlFile(projectPath(projectRoot, 'config/profile.yml'), nextProfileDoc);
  await writeYamlFile(projectPath(projectRoot, 'portals.yml'), nextPortalsDoc);

  await ensureDirForFile(projectPath(projectRoot, 'cv.md'));
  await writeFile(
    projectPath(projectRoot, 'cv.md'),
    form.cvMarkdown.trim() ? `${form.cvMarkdown.trimEnd()}\n` : '',
    'utf8',
  );

  await ensureDirForFile(projectPath(projectRoot, 'modes/_profile.md'));
  await writeFile(
    projectPath(projectRoot, 'modes/_profile.md'),
    renderProfileMarkdown(form.framing),
    'utf8',
  );

  await ensureTracker(projectRoot);

  return getSetupState(projectRoot);
}
