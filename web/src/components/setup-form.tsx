import * as React from 'react';
import type {
  AdaptiveFramingRow,
  ArchetypeFormRow,
  CompanyRow,
  ProofPointFormRow,
  SearchQueryRow,
  SetupFormData,
} from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { MarkdownPreview } from '@/components/markdown-preview';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface SetupFormProps {
  initialForm: SetupFormData;
  complete: boolean;
  missing: string[];
  saving: boolean;
  onSave: (form: SetupFormData) => Promise<void>;
}

interface SectionDefinition {
  id: string;
  label: string;
  title: string;
  description: string;
  render: (props: SectionRenderProps) => React.ReactNode;
}

interface SectionRenderProps {
  form: SetupFormData;
  onFormChange: React.Dispatch<React.SetStateAction<SetupFormData>>;
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function SectionFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StringListEditor({
  label,
  description,
  items,
  addLabel,
  placeholder,
  onChange,
}: {
  label: string;
  description?: string;
  items: string[];
  addLabel: string;
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex gap-3">
            <Input
              value={item}
              onChange={(event) =>
                onChange(
                  items.map((current, currentIndex) =>
                    currentIndex === index ? event.target.value : current,
                  ),
                )
              }
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => onChange([...items, ''])}>
          {addLabel}
        </Button>
      </div>
    </Field>
  );
}

function ListCard({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <Card className="bg-background/70 shadow-none">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ProfileSection({ form, onFormChange }: SectionRenderProps) {
  return (
    <SectionFrame
      title="Profile"
      description="Candidate identity and public links. This writes to `config/profile.yml`."
    >
      <FieldGroup>
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="full-name">Full name</FieldLabel>
            <Input
              id="full-name"
              value={form.profile.fullName}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, fullName: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              value={form.profile.email}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, email: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              value={form.profile.phone}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, phone: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="candidate-location">Candidate location</FieldLabel>
            <Input
              id="candidate-location"
              value={form.profile.candidateLocation}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, candidateLocation: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
            <Input
              id="linkedin"
              value={form.profile.linkedin}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, linkedin: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="portfolio">Portfolio URL</FieldLabel>
            <Input
              id="portfolio"
              value={form.profile.portfolioUrl}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, portfolioUrl: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="github">GitHub</FieldLabel>
            <Input
              id="github"
              value={form.profile.github}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, github: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="twitter">X / Twitter</FieldLabel>
            <Input
              id="twitter"
              value={form.profile.twitter}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  profile: { ...current.profile, twitter: event.target.value },
                }))
              }
            />
          </Field>
        </div>
      </FieldGroup>
    </SectionFrame>
  );
}

function TargetsSection({ form, onFormChange }: SectionRenderProps) {
  const archetypes = form.targets.archetypes;

  return (
    <SectionFrame
      title="Targets"
      description="Roles, archetypes, and narrative framing that drive Career-Ops evaluations."
    >
      <FieldGroup>
        <StringListEditor
          label="Primary roles"
          description="These are your North Star roles."
          items={form.targets.primaryRoles}
          addLabel="Add role"
          placeholder="Senior AI Engineer"
          onChange={(primaryRoles) =>
            onFormChange((current) => ({
              ...current,
              targets: { ...current.targets, primaryRoles },
            }))
          }
        />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Archetypes</h3>
              <p className="text-sm text-muted-foreground">
                These are written to `config/profile.yml` and used across the evaluation modes.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                onFormChange((current) => ({
                  ...current,
                  targets: {
                    ...current.targets,
                    archetypes: [
                      ...current.targets.archetypes,
                      { id: createId('archetype'), name: '', level: '', fit: 'primary' },
                    ],
                  },
                }))
              }
            >
              Add archetype
            </Button>
          </div>
          {archetypes.map((entry, index) => (
            <ListCard
              key={entry.id}
              title={`Archetype ${index + 1}`}
              onRemove={() =>
                onFormChange((current) => ({
                  ...current,
                  targets: {
                    ...current.targets,
                    archetypes: current.targets.archetypes.filter((item) => item.id !== entry.id),
                  },
                }))
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={entry.name}
                    onChange={(event) =>
                      onFormChange((current) => ({
                        ...current,
                        targets: {
                          ...current.targets,
                          archetypes: current.targets.archetypes.map((item) =>
                            item.id === entry.id ? { ...item, name: event.target.value } : item,
                          ),
                        },
                      }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Level</FieldLabel>
                  <Input
                    value={entry.level}
                    onChange={(event) =>
                      onFormChange((current) => ({
                        ...current,
                        targets: {
                          ...current.targets,
                          archetypes: current.targets.archetypes.map((item) =>
                            item.id === entry.id ? { ...item, level: event.target.value } : item,
                          ),
                        },
                      }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Fit</FieldLabel>
                  <Select
                    value={entry.fit}
                    onChange={(event) =>
                      onFormChange((current) => ({
                        ...current,
                        targets: {
                          ...current.targets,
                          archetypes: current.targets.archetypes.map((item) =>
                            item.id === entry.id ? { ...item, fit: event.target.value } : item,
                          ),
                        },
                      }))
                    }
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="adjacent">Adjacent</option>
                  </Select>
                </Field>
              </div>
            </ListCard>
          ))}
        </div>
        <Field>
          <FieldLabel htmlFor="headline">Headline</FieldLabel>
          <Input
            id="headline"
            value={form.targets.headline}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                targets: { ...current.targets, headline: event.target.value },
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exit-story">Exit story</FieldLabel>
          <Textarea
            id="exit-story"
            value={form.targets.exitStory}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                targets: { ...current.targets, exitStory: event.target.value },
              }))
            }
          />
        </Field>
        <StringListEditor
          label="Superpowers"
          items={form.targets.superpowers}
          addLabel="Add superpower"
          placeholder="Fast prototyping from idea to production"
          onChange={(superpowers) =>
            onFormChange((current) => ({
              ...current,
              targets: { ...current.targets, superpowers },
            }))
          }
        />
      </FieldGroup>
    </SectionFrame>
  );
}

function ProofPointsSection({ form, onFormChange }: SectionRenderProps) {
  const items = form.proofPoints.items;

  return (
    <SectionFrame
      title="Proof Points"
      description="Structured proof points and optional demo access. These stay form-driven."
    >
      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Proof point rows</h3>
            <p className="text-sm text-muted-foreground">
              Each row becomes a structured entry in `config/profile.yml`.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onFormChange((current) => ({
                ...current,
                proofPoints: {
                  ...current.proofPoints,
                  items: [
                    ...current.proofPoints.items,
                    { id: createId('proof'), name: '', url: '', heroMetric: '' },
                  ],
                },
              }))
            }
          >
            Add proof point
          </Button>
        </div>
        {items.map((entry, index) => (
          <ListCard
            key={entry.id}
            title={`Proof point ${index + 1}`}
            onRemove={() =>
              onFormChange((current) => ({
                ...current,
                proofPoints: {
                  ...current.proofPoints,
                  items: current.proofPoints.items.filter((item) => item.id !== entry.id),
                },
              }))
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={entry.name}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      proofPoints: {
                        ...current.proofPoints,
                        items: current.proofPoints.items.map((item) =>
                          item.id === entry.id ? { ...item, name: event.target.value } : item,
                        ),
                      },
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>URL</FieldLabel>
                <Input
                  value={entry.url}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      proofPoints: {
                        ...current.proofPoints,
                        items: current.proofPoints.items.map((item) =>
                          item.id === entry.id ? { ...item, url: event.target.value } : item,
                        ),
                      },
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Hero metric</FieldLabel>
                <Input
                  value={entry.heroMetric}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      proofPoints: {
                        ...current.proofPoints,
                        items: current.proofPoints.items.map((item) =>
                          item.id === entry.id ? { ...item, heroMetric: event.target.value } : item,
                        ),
                      },
                    }))
                  }
                />
              </Field>
            </div>
          </ListCard>
        ))}
        <Separator />
        <div className="grid gap-5 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="dashboard-url">Dashboard URL</FieldLabel>
            <Input
              id="dashboard-url"
              value={form.proofPoints.dashboardUrl}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  proofPoints: { ...current.proofPoints, dashboardUrl: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dashboard-password">Dashboard password</FieldLabel>
            <Input
              id="dashboard-password"
              value={form.proofPoints.dashboardPassword}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  proofPoints: { ...current.proofPoints, dashboardPassword: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dashboard-share">When to share</FieldLabel>
            <Input
              id="dashboard-share"
              value={form.proofPoints.dashboardWhenToShare}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  proofPoints: { ...current.proofPoints, dashboardWhenToShare: event.target.value },
                }))
              }
            />
          </Field>
        </div>
      </FieldGroup>
    </SectionFrame>
  );
}

function CompensationSection({ form, onFormChange }: SectionRenderProps) {
  return (
    <SectionFrame
      title="Compensation & Location"
      description="Comp expectations, geography, and logistics."
    >
      <FieldGroup>
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="target-range">Target range</FieldLabel>
            <Input
              id="target-range"
              value={form.compensation.targetRange}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  compensation: { ...current.compensation, targetRange: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <Input
              id="currency"
              value={form.compensation.currency}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  compensation: { ...current.compensation, currency: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="minimum">Minimum</FieldLabel>
            <Input
              id="minimum"
              value={form.compensation.minimum}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  compensation: { ...current.compensation, minimum: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="flexibility">Location flexibility</FieldLabel>
            <Input
              id="flexibility"
              value={form.compensation.locationFlexibility}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  compensation: {
                    ...current.compensation,
                    locationFlexibility: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input
              id="country"
              value={form.location.country}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  location: { ...current.location, country: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              value={form.location.city}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  location: { ...current.location, city: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
            <Input
              id="timezone"
              value={form.location.timezone}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  location: { ...current.location, timezone: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="visa-status">Visa status</FieldLabel>
            <Input
              id="visa-status"
              value={form.location.visaStatus}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  location: { ...current.location, visaStatus: event.target.value },
                }))
              }
            />
          </Field>
        </div>
      </FieldGroup>
    </SectionFrame>
  );
}

function FramingSection({ form, onFormChange }: SectionRenderProps) {
  return (
    <SectionFrame
      title="Career-Ops Framing"
      description="These form values generate `modes/_profile.md`."
    >
      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Adaptive framing</h3>
            <p className="text-sm text-muted-foreground">
              Role-specific positioning used when Career-Ops tailors output.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onFormChange((current) => ({
                ...current,
                framing: {
                  ...current.framing,
                  adaptiveFraming: [
                    ...current.framing.adaptiveFraming,
                    {
                      id: createId('framing'),
                      role: '',
                      emphasize: '',
                      proofPointSources: '',
                    },
                  ],
                },
              }))
            }
          >
            Add framing row
          </Button>
        </div>
        {form.framing.adaptiveFraming.map((entry, index) => (
          <ListCard
            key={entry.id}
            title={`Framing row ${index + 1}`}
            onRemove={() =>
              onFormChange((current) => ({
                ...current,
                framing: {
                  ...current.framing,
                  adaptiveFraming: current.framing.adaptiveFraming.filter((item) => item.id !== entry.id),
                },
              }))
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Input
                  value={entry.role}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      framing: {
                        ...current.framing,
                        adaptiveFraming: current.framing.adaptiveFraming.map((item) =>
                          item.id === entry.id ? { ...item, role: event.target.value } : item,
                        ),
                      },
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Emphasize</FieldLabel>
                <Input
                  value={entry.emphasize}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      framing: {
                        ...current.framing,
                        adaptiveFraming: current.framing.adaptiveFraming.map((item) =>
                          item.id === entry.id ? { ...item, emphasize: event.target.value } : item,
                        ),
                      },
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Proof point sources</FieldLabel>
                <Input
                  value={entry.proofPointSources}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      framing: {
                        ...current.framing,
                        adaptiveFraming: current.framing.adaptiveFraming.map((item) =>
                          item.id === entry.id
                            ? { ...item, proofPointSources: event.target.value }
                            : item,
                        ),
                      },
                    }))
                  }
                />
              </Field>
            </div>
          </ListCard>
        ))}
        <Field>
          <FieldLabel>Cross-cutting advantage</FieldLabel>
          <Textarea
            value={form.framing.crossCuttingAdvantage}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, crossCuttingAdvantage: event.target.value },
              }))
            }
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-3">
          <Field>
            <FieldLabel>Portfolio URL</FieldLabel>
            <Input
              value={form.framing.portfolio.url}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  framing: {
                    ...current.framing,
                    portfolio: { ...current.framing.portfolio, url: event.target.value },
                  },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>Portfolio password</FieldLabel>
            <Input
              value={form.framing.portfolio.password}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  framing: {
                    ...current.framing,
                    portfolio: { ...current.framing.portfolio, password: event.target.value },
                  },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>When to share</FieldLabel>
            <Input
              value={form.framing.portfolio.whenToShare}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  framing: {
                    ...current.framing,
                    portfolio: { ...current.framing.portfolio, whenToShare: event.target.value },
                  },
                }))
              }
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Comp guidance</FieldLabel>
          <Textarea
            value={form.framing.compGuidance}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, compGuidance: event.target.value },
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Negotiation: salary expectations</FieldLabel>
          <Textarea
            value={form.framing.negotiationSalary}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, negotiationSalary: event.target.value },
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Negotiation: geographic discount</FieldLabel>
          <Textarea
            value={form.framing.negotiationGeo}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, negotiationGeo: event.target.value },
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Negotiation: low offer</FieldLabel>
          <Textarea
            value={form.framing.negotiationLowOffer}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, negotiationLowOffer: event.target.value },
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Location policy in forms</FieldLabel>
          <Textarea
            value={form.framing.locationPolicyForms}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, locationPolicyForms: event.target.value },
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Location policy in evaluations</FieldLabel>
          <Textarea
            value={form.framing.locationPolicyEvaluations}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                framing: { ...current.framing, locationPolicyEvaluations: event.target.value },
              }))
            }
          />
        </Field>
      </FieldGroup>
    </SectionFrame>
  );
}

function CvSection({ form, onFormChange }: SectionRenderProps) {
  const deferredMarkdown = React.useDeferredValue(form.cvMarkdown);

  return (
    <SectionFrame
      title="CV"
      description="Paste markdown and review the live preview before saving to `cv.md`."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Field>
          <FieldLabel htmlFor="cv-markdown">CV markdown</FieldLabel>
          <Textarea
            id="cv-markdown"
            className="min-h-[480px]"
            value={form.cvMarkdown}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                cvMarkdown: event.target.value,
              }))
            }
          />
        </Field>
        <MarkdownPreview markdown={deferredMarkdown} />
      </div>
    </SectionFrame>
  );
}

function ScannerFiltersSection({ form, onFormChange }: SectionRenderProps) {
  return (
    <SectionFrame
      title="Scanner Filters"
      description="Freshness and title filtering for `portals.yml`: recency rules, positive keywords, negative keywords, and seniority boosts."
    >
      <FieldGroup>
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="websearch-recency-days">WebSearch recency window (days)</FieldLabel>
            <FieldDescription>
              Applied to WebSearch discovery so broad queries prefer recently indexed jobs.
            </FieldDescription>
            <Input
              id="websearch-recency-days"
              inputMode="numeric"
              value={form.scanner.freshness.webSearchRecencyDays}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  scanner: {
                    ...current.scanner,
                    freshness: {
                      ...current.scanner.freshness,
                      webSearchRecencyDays: event.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="max-job-age-days">Maximum accepted job age (days)</FieldLabel>
            <FieldDescription>
              Jobs older than this are treated as stale when the scanner can extract a posted date.
            </FieldDescription>
            <Input
              id="max-job-age-days"
              inputMode="numeric"
              value={form.scanner.freshness.maxJobAgeDays}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  scanner: {
                    ...current.scanner,
                    freshness: {
                      ...current.scanner.freshness,
                      maxJobAgeDays: event.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Require a posted date</div>
            <div className="text-sm text-muted-foreground">
              Skip jobs when the scanner cannot verify how old the posting is.
            </div>
          </div>
          <Switch
            checked={form.scanner.freshness.requirePostedDate}
            onCheckedChange={(requirePostedDate) =>
              onFormChange((current) => ({
                ...current,
                scanner: {
                  ...current.scanner,
                  freshness: {
                    ...current.scanner.freshness,
                    requirePostedDate,
                  },
                },
              }))
            }
          />
        </div>
        <StringListEditor
          label="Positive keywords"
          items={form.scanner.positiveKeywords}
          addLabel="Add positive keyword"
          placeholder="LLMOps"
          onChange={(positiveKeywords) =>
            onFormChange((current) => ({
              ...current,
              scanner: { ...current.scanner, positiveKeywords },
            }))
          }
        />
        <StringListEditor
          label="Negative keywords"
          items={form.scanner.negativeKeywords}
          addLabel="Add negative keyword"
          placeholder="Junior"
          onChange={(negativeKeywords) =>
            onFormChange((current) => ({
              ...current,
              scanner: { ...current.scanner, negativeKeywords },
            }))
          }
        />
        <StringListEditor
          label="Seniority boosts"
          items={form.scanner.seniorityBoost}
          addLabel="Add seniority hint"
          placeholder="Staff"
          onChange={(seniorityBoost) =>
            onFormChange((current) => ({
              ...current,
              scanner: { ...current.scanner, seniorityBoost },
            }))
          }
        />
      </FieldGroup>
    </SectionFrame>
  );
}

function SearchQueriesSection({ form, onFormChange }: SectionRenderProps) {
  const [expandedQueryIds, setExpandedQueryIds] = React.useState<Set<string>>(() => new Set());
  const [queryFilter, setQueryFilter] = React.useState('');
  const deferredQueryFilter = React.useDeferredValue(queryFilter);
  const normalizedQueryFilter = deferredQueryFilter.trim().toLowerCase();

  React.useEffect(() => {
    setExpandedQueryIds((current) => {
      const validIds = new Set(form.scanner.searchQueries.map((item) => item.id));
      let changed = false;
      const next = new Set<string>();

      current.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [form.scanner.searchQueries]);

  function updateSearchQuery(queryId: string, updates: Partial<SearchQueryRow>) {
    onFormChange((current) => ({
      ...current,
      scanner: {
        ...current.scanner,
        searchQueries: current.scanner.searchQueries.map((item) =>
          item.id === queryId ? { ...item, ...updates } : item,
        ),
      },
    }));
  }

  function toggleExpanded(queryId: string) {
    setExpandedQueryIds((current) => {
      const next = new Set(current);
      if (next.has(queryId)) {
        next.delete(queryId);
      } else {
        next.add(queryId);
      }
      return next;
    });
  }

  function removeSearchQuery(queryId: string) {
    setExpandedQueryIds((current) => {
      const next = new Set(current);
      next.delete(queryId);
      return next;
    });

    onFormChange((current) => ({
      ...current,
      scanner: {
        ...current.scanner,
        searchQueries: current.scanner.searchQueries.filter((item) => item.id !== queryId),
      },
    }));
  }

  function disableAllSearchQueries() {
    onFormChange((current) => ({
      ...current,
      scanner: {
        ...current.scanner,
        searchQueries: current.scanner.searchQueries.map((item) => ({ ...item, enabled: false })),
      },
    }));
  }

  const filteredSearchQueries = form.scanner.searchQueries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry, index }) => {
      if (!normalizedQueryFilter) {
        return true;
      }

      const queryLabel = entry.name || `Search query ${index + 1}`;
      const haystack = [queryLabel, entry.query].join(' ').toLowerCase();
      return haystack.includes(normalizedQueryFilter);
    });

  return (
    <SectionFrame
      title="Search Queries"
      description="Enable or rewrite the WebSearch queries that seed the scanner in `portals.yml`."
    >
      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Search queries</h3>
            <p className="text-sm text-muted-foreground">
              Each row maps directly to `search_queries` in `portals.yml`.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!form.scanner.searchQueries.some((entry) => entry.enabled)}
              onClick={disableAllSearchQueries}
            >
              Disable all
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                onFormChange((current) => ({
                  ...current,
                  scanner: {
                    ...current.scanner,
                    searchQueries: [
                      ...current.scanner.searchQueries,
                      { id: createId('query'), name: '', query: '', enabled: true },
                    ],
                  },
                }))
              }
            >
              Add query
            </Button>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="search-queries-filter">Search queries</FieldLabel>
          <Input
            id="search-queries-filter"
            value={queryFilter}
            onChange={(event) => setQueryFilter(event.target.value)}
            placeholder="Filter by name or query text"
          />
        </Field>
        <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-background/70">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Query</th>
                  <th className="px-4 py-3 font-medium">Enabled</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {filteredSearchQueries.map(({ entry, index }) => {
                  const queryLabel = entry.name || `Search query ${index + 1}`;
                  const isExpanded = expandedQueryIds.has(entry.id);

                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="align-middle">
                        <td className="px-4 py-3 font-medium">{queryLabel}</td>
                        <td className="max-w-[32rem] px-4 py-3 text-muted-foreground">
                          <div className="truncate">{entry.query || 'Add the query text used for scanning.'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Switch
                              aria-label={`${entry.enabled ? 'Disable' : 'Enable'} ${queryLabel}`}
                              checked={entry.enabled}
                              onCheckedChange={(enabled) =>
                                updateSearchQuery(entry.id, { enabled })
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {entry.enabled ? 'On' : 'Off'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${queryLabel}`}
                              onClick={() => toggleExpanded(entry.id)}
                            >
                              {isExpanded ? 'Hide details' : 'Edit'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Remove ${queryLabel}`}
                              onClick={() => removeSearchQuery(entry.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="bg-secondary/20">
                          <td colSpan={4} className="px-4 py-4">
                            <div className="grid gap-4">
                              <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input
                                  value={entry.name}
                                  onChange={(event) =>
                                    updateSearchQuery(entry.id, { name: event.target.value })
                                  }
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Query</FieldLabel>
                                <Textarea
                                  value={entry.query}
                                  onChange={(event) =>
                                    updateSearchQuery(entry.id, { query: event.target.value })
                                  }
                                />
                              </Field>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
                {filteredSearchQueries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No search queries match this filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </FieldGroup>
    </SectionFrame>
  );
}

function TrackedCompaniesSection({ form, onFormChange }: SectionRenderProps) {
  const [expandedCompanyIds, setExpandedCompanyIds] = React.useState<Set<string>>(() => new Set());
  const [companyFilter, setCompanyFilter] = React.useState('');
  const deferredCompanyFilter = React.useDeferredValue(companyFilter);
  const normalizedCompanyFilter = deferredCompanyFilter.trim().toLowerCase();

  React.useEffect(() => {
    setExpandedCompanyIds((current) => {
      const validIds = new Set(form.scanner.trackedCompanies.map((item) => item.id));
      let changed = false;
      const next = new Set<string>();

      current.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [form.scanner.trackedCompanies]);

  function updateTrackedCompany(companyId: string, updates: Partial<CompanyRow>) {
    onFormChange((current) => ({
      ...current,
      scanner: {
        ...current.scanner,
        trackedCompanies: current.scanner.trackedCompanies.map((item) =>
          item.id === companyId ? { ...item, ...updates } : item,
        ),
      },
    }));
  }

  function toggleExpanded(companyId: string) {
    setExpandedCompanyIds((current) => {
      const next = new Set(current);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  }

  function removeTrackedCompany(companyId: string) {
    setExpandedCompanyIds((current) => {
      const next = new Set(current);
      next.delete(companyId);
      return next;
    });

    onFormChange((current) => ({
      ...current,
      scanner: {
        ...current.scanner,
        trackedCompanies: current.scanner.trackedCompanies.filter((item) => item.id !== companyId),
      },
    }));
  }

  function disableAllTrackedCompanies() {
    onFormChange((current) => ({
      ...current,
      scanner: {
        ...current.scanner,
        trackedCompanies: current.scanner.trackedCompanies.map((item) => ({
          ...item,
          enabled: false,
        })),
      },
    }));
  }

  const filteredTrackedCompanies = form.scanner.trackedCompanies
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry, index }) => {
      if (!normalizedCompanyFilter) {
        return true;
      }

      const companyLabel = entry.name || `Company ${index + 1}`;
      const haystack = [
        companyLabel,
        entry.careersUrl,
        entry.scanMethod,
        entry.scanQuery,
        entry.api,
        entry.notes,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedCompanyFilter);
    });

  return (
    <SectionFrame
      title="Tracked Companies"
      description="Manage the company rotation written to `tracked_companies` in `portals.yml`."
    >
      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Tracked companies</h3>
            <p className="text-sm text-muted-foreground">
              URLs, scan method, notes, and enabled state stay structured here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!form.scanner.trackedCompanies.some((entry) => entry.enabled)}
              onClick={disableAllTrackedCompanies}
            >
              Disable all
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                onFormChange((current) => ({
                  ...current,
                  scanner: {
                    ...current.scanner,
                    trackedCompanies: [
                      ...current.scanner.trackedCompanies,
                      {
                        id: createId('company'),
                        name: '',
                        careersUrl: '',
                        scanMethod: 'playwright',
                        scanQuery: '',
                        api: '',
                        notes: '',
                        enabled: true,
                      },
                    ],
                  },
                }))
              }
            >
              Add company
            </Button>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="tracked-companies-filter">Search companies</FieldLabel>
          <Input
            id="tracked-companies-filter"
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            placeholder="Filter by company, URL, method, or notes"
          />
        </Field>
        <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-background/70">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Careers URL</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Enabled</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {filteredTrackedCompanies.map(({ entry, index }) => {
                  const companyLabel = entry.name || `Company ${index + 1}`;
                  const isExpanded = expandedCompanyIds.has(entry.id);

                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="align-middle">
                        <td className="px-4 py-3 font-medium">{companyLabel}</td>
                        <td className="max-w-[24rem] px-4 py-3 text-muted-foreground">
                          <div className="truncate">
                            {entry.careersUrl || 'Add a careers URL to target this company directly.'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {entry.scanMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Switch
                              aria-label={`${entry.enabled ? 'Disable' : 'Enable'} ${companyLabel}`}
                              checked={entry.enabled}
                              onCheckedChange={(enabled) =>
                                updateTrackedCompany(entry.id, { enabled })
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {entry.enabled ? 'On' : 'Off'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${companyLabel}`}
                              onClick={() => toggleExpanded(entry.id)}
                            >
                              {isExpanded ? 'Hide details' : 'Edit'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Remove ${companyLabel}`}
                              onClick={() => removeTrackedCompany(entry.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="bg-secondary/20">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input
                                  value={entry.name}
                                  onChange={(event) =>
                                    updateTrackedCompany(entry.id, { name: event.target.value })
                                  }
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Careers URL</FieldLabel>
                                <Input
                                  value={entry.careersUrl}
                                  onChange={(event) =>
                                    updateTrackedCompany(entry.id, {
                                      careersUrl: event.target.value,
                                    })
                                  }
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Scan method</FieldLabel>
                                <Select
                                  value={entry.scanMethod}
                                  onChange={(event) =>
                                    updateTrackedCompany(entry.id, {
                                      scanMethod: event.target.value,
                                    })
                                  }
                                >
                                  <option value="playwright">playwright</option>
                                  <option value="websearch">websearch</option>
                                  <option value="greenhouse_api">greenhouse_api</option>
                                </Select>
                              </Field>
                              <Field>
                                <FieldLabel>API URL</FieldLabel>
                                <Input
                                  value={entry.api}
                                  onChange={(event) =>
                                    updateTrackedCompany(entry.id, { api: event.target.value })
                                  }
                                />
                              </Field>
                              <Field className="md:col-span-2">
                                <FieldLabel>Scan query</FieldLabel>
                                <Textarea
                                  value={entry.scanQuery}
                                  onChange={(event) =>
                                    updateTrackedCompany(entry.id, {
                                      scanQuery: event.target.value,
                                    })
                                  }
                                />
                              </Field>
                              <Field className="md:col-span-2">
                                <FieldLabel>Notes</FieldLabel>
                                <Textarea
                                  value={entry.notes}
                                  onChange={(event) =>
                                    updateTrackedCompany(entry.id, { notes: event.target.value })
                                  }
                                />
                              </Field>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
                {filteredTrackedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No tracked companies match this filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </FieldGroup>
    </SectionFrame>
  );
}

const sections: SectionDefinition[] = [
  {
    id: 'profile',
    label: 'Profile',
    title: 'Profile',
    description: 'Identity, contact, and public links.',
    render: (props) => <ProfileSection {...props} />,
  },
  {
    id: 'targets',
    label: 'Targets',
    title: 'Targets',
    description: 'Roles, archetypes, and narrative.',
    render: (props) => <TargetsSection {...props} />,
  },
  {
    id: 'proof-points',
    label: 'Proof Points',
    title: 'Proof Points',
    description: 'Structured projects and demo access.',
    render: (props) => <ProofPointsSection {...props} />,
  },
  {
    id: 'comp-location',
    label: 'Comp & Location',
    title: 'Comp & Location',
    description: 'Compensation, country, city, timezone.',
    render: (props) => <CompensationSection {...props} />,
  },
  {
    id: 'framing',
    label: 'Framing',
    title: 'Career-Ops Framing',
    description: 'Generated `_profile.md` content.',
    render: (props) => <FramingSection {...props} />,
  },
  {
    id: 'cv',
    label: 'CV',
    title: 'CV',
    description: 'Markdown editor with preview.',
    render: (props) => <CvSection {...props} />,
  },
  {
    id: 'scanner-filters',
    label: 'Scanner Filters',
    title: 'Scanner Filters',
    description: 'Positive, negative, and seniority title filters.',
    render: (props) => <ScannerFiltersSection {...props} />,
  },
  {
    id: 'search-queries',
    label: 'Search Queries',
    title: 'Search Queries',
    description: 'WebSearch seed queries for the scanner.',
    render: (props) => <SearchQueriesSection {...props} />,
  },
  {
    id: 'tracked-companies',
    label: 'Tracked Companies',
    title: 'Tracked Companies',
    description: 'Structured company targets and scan methods.',
    render: (props) => <TrackedCompaniesSection {...props} />,
  },
];

export function SetupForm({
  initialForm,
  complete,
  missing,
  saving,
  onSave,
}: SetupFormProps) {
  const [form, setForm] = React.useState(initialForm);
  const [activeTab, setActiveTab] = React.useState(sections[0].id);
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  React.useEffect(() => {
    setActiveTab(sections[0].id);
    setActiveStep(0);
  }, [complete]);

  async function handleSave() {
    await onSave(form);
  }

  const currentSection = sections[activeStep];

  return (
    <div className="flex flex-col gap-6">
      {complete ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList>
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button onClick={handleSave} disabled={saving} className="self-start lg:self-auto">
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              {section.render({ form, onFormChange: setForm })}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Onboarding</Badge>
                {missing.map((item) => (
                  <Badge key={item} variant="outline">
                    Missing: {item}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl">Steps</CardTitle>
              <CardDescription>
                Complete the required setup once. You can edit every section later in the same UI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[520px]">
                <div className="flex flex-col gap-3">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        index === activeStep
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background/70 hover:bg-secondary'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-[0.24em] opacity-70">
                        Step {index + 1}
                      </div>
                      <div className="mt-1 font-medium">{section.label}</div>
                      <div className="mt-1 text-sm opacity-80">{section.description}</div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            {currentSection.render({ form, onFormChange: setForm })}
            <Card className="bg-card/85">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div className="text-sm text-muted-foreground">
                  Step {activeStep + 1} of {sections.length}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((value) => Math.max(value - 1, 0))}
                  >
                    Back
                  </Button>
                  {activeStep < sections.length - 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setActiveStep((value) => Math.min(value + 1, sections.length - 1))
                      }
                    >
                      Next
                    </Button>
                  ) : null}
                  <Button type="button" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Create setup files'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
