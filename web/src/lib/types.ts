export interface ArchetypeFormRow {
  id: string;
  name: string;
  level: string;
  fit: string;
}

export interface ProofPointFormRow {
  id: string;
  name: string;
  url: string;
  heroMetric: string;
}

export interface AdaptiveFramingRow {
  id: string;
  role: string;
  emphasize: string;
  proofPointSources: string;
}

export interface SearchQueryRow {
  id: string;
  name: string;
  query: string;
  enabled: boolean;
}

export interface CompanyRow {
  id: string;
  name: string;
  careersUrl: string;
  scanMethod: string;
  scanQuery: string;
  api: string;
  notes: string;
  enabled: boolean;
}

export interface SetupFormData {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    candidateLocation: string;
    linkedin: string;
    portfolioUrl: string;
    github: string;
    twitter: string;
  };
  targets: {
    primaryRoles: string[];
    archetypes: ArchetypeFormRow[];
    headline: string;
    exitStory: string;
    superpowers: string[];
  };
  proofPoints: {
    items: ProofPointFormRow[];
    dashboardUrl: string;
    dashboardPassword: string;
    dashboardWhenToShare: string;
  };
  compensation: {
    targetRange: string;
    currency: string;
    minimum: string;
    locationFlexibility: string;
  };
  location: {
    country: string;
    city: string;
    timezone: string;
    visaStatus: string;
  };
  framing: {
    adaptiveFraming: AdaptiveFramingRow[];
    crossCuttingAdvantage: string;
    portfolio: {
      url: string;
      password: string;
      whenToShare: string;
    };
    compGuidance: string;
    negotiationSalary: string;
    negotiationGeo: string;
    negotiationLowOffer: string;
    locationPolicyForms: string;
    locationPolicyEvaluations: string;
  };
  cvMarkdown: string;
  scanner: {
    freshness: {
      webSearchRecencyDays: string;
      maxJobAgeDays: string;
      requirePostedDate: boolean;
    };
    positiveKeywords: string[];
    negativeKeywords: string[];
    seniorityBoost: string[];
    searchQueries: SearchQueryRow[];
    trackedCompanies: CompanyRow[];
  };
}

export interface SetupState {
  complete: boolean;
  missing: string[];
  form: SetupFormData;
}
