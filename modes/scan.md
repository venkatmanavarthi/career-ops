# Mode: scan — Portal Scanner (Offer Discovery)

Scan configured job portals, filter by title relevance, and add new offers to the pipeline for later evaluation.

## Recommended execution

Run as a sub-agent so it does not consume main-thread context:

```
Agent(
    subagent_type="general-purpose",
    prompt="[contents of this file + specific data]",
    run_in_background=True
)
```

## Configuration

Read `portals.yml`, which contains:
- `freshness`: recency policy for discovery (`websearch_recency_days`, `max_job_age_days`, `require_posted_date`)
- `search_queries`: list of WebSearch queries with `site:` filters per portal (broad discovery)
- `tracked_companies`: specific companies with `careers_url` for direct navigation
- `title_filter`: positive/negative/seniority_boost keywords for title filtering

## Discovery strategy (3 levels)

### Level 1 — Direct Playwright (PRIMARY)

**For each company in `tracked_companies`:** Navigate to its `careers_url` with Playwright (`browser_navigate` + `browser_snapshot`), read ALL visible job listings, and extract title + URL for each. This is the most reliable method because:
- It sees the page in real time (not cached Google results)
- It works with SPAs (Ashby, Lever, Workday)
- It detects new offers immediately
- It does not depend on Google indexing

**Every company MUST have `careers_url` in `portals.yml`.** If it is missing, find it once, save it, and use it in future scans.

### Level 2 — Greenhouse API (SUPPLEMENTARY)

For companies on Greenhouse, the JSON API (`boards-api.greenhouse.io/v1/boards/{slug}/jobs`) returns clean structured data. Use it as a fast complement to Level 1. It is faster than Playwright, but only works with Greenhouse.

### Level 3 — WebSearch queries (BROAD DISCOVERY)

`search_queries` with `site:` filters cover portals horizontally (all Ashby sites, all Greenhouse sites, etc.). Useful for discovering NEW companies not yet in `tracked_companies`, but results may be stale unless constrained by the freshness policy.

**Execution priority:**
1. Level 1: Playwright → all `tracked_companies` with `careers_url`
2. Level 2: API → all `tracked_companies` with `api:`
3. Level 3: WebSearch → all `search_queries` with `enabled: true`

These levels are additive: run all of them, merge the results, and deduplicate.

## Workflow

1. **Read config**: `portals.yml`
   - Load `freshness.websearch_recency_days` (default `7`)
   - Load `freshness.max_job_age_days` (default `30`)
   - Load `freshness.require_posted_date` (default `false`)
2. **Read history**: `data/scan-history.tsv` → URLs already seen
3. **Read dedup sources**: `data/applications.md` + `data/pipeline.md`

4. **Level 1 — Playwright scan** (parallel in batches of 3-5):
   For each company in `tracked_companies` with `enabled: true` and a defined `careers_url`:
   a. `browser_navigate` to `careers_url`
   b. If the board exposes sorting, switch to `Newest` / `Most recent` / `Date posted` first
   c. `browser_snapshot` to read all job listings
   d. If the page has filters/departments, navigate the relevant sections
   e. For each listing, extract: `{title, url, company, posted_at?}`
   f. If the page paginates, navigate additional pages
   g. Accumulate into the candidate list
   h. If `careers_url` fails (404, redirect), try `scan_query` as a fallback and note that the URL should be updated

5. **Level 2 — Greenhouse APIs** (parallel):
   For each company in `tracked_companies` with `api:` defined and `enabled: true`:
   a. WebFetch the API URL → JSON job list
   b. For each job, extract: `{title, url, company, updated_at?}`
   c. Accumulate into the candidate list (dedup against Level 1)

6. **Level 3 — WebSearch queries** (parallel when possible):
   For each query in `search_queries` with `enabled: true`:
   a. Run WebSearch with the defined `query` and pass `recency=freshness.websearch_recency_days` when the tool supports it
   b. From each result extract: `{title, url, company}`
      - **title**: from the result title (before `" @ "` or `" | "`)
      - **url**: result URL
      - **company**: after `" @ "` in the title, or extracted from domain/path
   c. Accumulate into the candidate list (dedup against Levels 1+2)

6. **Filter by title** using `title_filter` from `portals.yml`:
   - At least 1 `positive` keyword must appear in the title (case-insensitive)
   - 0 `negative` keywords may appear
   - `seniority_boost` keywords add priority but are not mandatory

7. **Deduplicate** against 3 sources:
   - `scan-history.tsv` → exact URL already seen
   - `applications.md` → normalized company + role already evaluated
   - `pipeline.md` → exact URL already pending or processed

7.5. **Verify liveness for WebSearch results (Level 3)** — BEFORE adding to the pipeline:

   WebSearch results may be stale (Google caches them for weeks or months). To avoid evaluating expired roles, verify each new Level 3 URL with Playwright. Levels 1 and 2 are inherently real-time and do not require this verification.

   For each new Level 3 URL (sequentially — NEVER run Playwright in parallel):
   a. `browser_navigate` to the URL
   b. `browser_snapshot` to read the content
   c. Classify it:
      - **Active**: visible job title + role description + Apply/Submit button
      - **Expired** (any of these signals):
        - Final URL contains `?error=true` (Greenhouse does this when the role is closed)
        - Page contains: "job no longer available" / "no longer open" / "position has been filled" / "this job has expired" / "page not found"
        - Only navbar and footer are visible, with no JD content (content < ~300 chars)
   d. If expired: register it in `scan-history.tsv` with status `skipped_expired` and discard it
   e. If active: extract `posted_at` / `updated_at` if visible and continue to step 7.6

   **Do not interrupt the whole scan if one URL fails.** If `browser_navigate` errors (timeout, 403, etc.), mark it `skipped_expired` and continue.

7.6. **Apply freshness filter** — BEFORE adding to the pipeline:
   For every candidate from any source:
   a. Prefer the freshest timestamp available:
      - explicit posted date on the job board
      - API `updated_at` / `created_at`
      - relative labels like `2 days ago` converted to an absolute date
   b. If a timestamp exists and the posting is older than `freshness.max_job_age_days`, register it as `skipped_stale` and discard it
   c. If no timestamp exists:
      - when `freshness.require_posted_date = true`, register it as `skipped_unknown_age` and discard it
      - otherwise keep it, but mention `age unknown` in the summary when relevant

8. **For each verified new offer that passes filters and freshness checks**:
   a. Add to the `Pending` section of `pipeline.md`: `- [ ] {url} | {company} | {title}`
   b. Register in `scan-history.tsv`: `{url}\t{date}\t{query_name}\t{title}\t{company}\tadded`

9. **Title-filtered offers**: register in `scan-history.tsv` with status `skipped_title`
10. **Duplicate offers**: register with status `skipped_dup`
11. **Expired offers (Level 3)**: register with status `skipped_expired`
12. **Stale offers**: register with status `skipped_stale`
13. **Unknown-age offers discarded by policy**: register with status `skipped_unknown_age`

## Extracting title and company from WebSearch results

WebSearch results usually come as: `"Job Title @ Company"` or `"Job Title | Company"` or `"Job Title — Company"`.

Portal extraction patterns:
- **Ashby**: `"Senior AI PM (Remote) @ EverAI"` → title: `Senior AI PM`, company: `EverAI`
- **Greenhouse**: `"AI Engineer at Anthropic"` → title: `AI Engineer`, company: `Anthropic`
- **Lever**: `"Product Manager - AI @ Temporal"` → title: `Product Manager - AI`, company: `Temporal`

Generic regex: `(.+?)(?:\s*[@|—–-]\s*|\s+at\s+)(.+?)$`

## Private URLs

If a URL is not publicly accessible:
1. Save the JD to `jds/{company}-{role-slug}.md`
2. Add it to `pipeline.md` as: `- [ ] local:jds/{company}-{role-slug}.md | {company} | {title}`

## Scan history

`data/scan-history.tsv` tracks ALL URLs seen:

```
url	first_seen	portal	title	company	status
https://...	2026-02-10	Ashby — AI PM	PM AI	Acme	added
https://...	2026-02-10	Greenhouse — SA	Junior Dev	BigCo	skipped_title
https://...	2026-02-10	Ashby — AI PM	SA AI	OldCo	skipped_dup
https://...	2026-02-10	WebSearch — AI PM	PM AI	ClosedCo	skipped_expired
https://...	2026-02-10	OpenAI Careers	Old Role	OpenAI	skipped_stale
https://...	2026-02-10	WebSearch — AI PM	Unknown Date Role	Acme	skipped_unknown_age
```

## Output summary

```
Portal Scan — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Queries executed: N
Offers found: N total
Title-filtered: N relevant
Duplicates: N (already evaluated or already in pipeline)
Expired discarded: N (dead links, Level 3)
Stale discarded: N (older than freshness.max_job_age_days)
Unknown-age discarded: N (require_posted_date=true)
New offers added to pipeline.md: N

  + {company} | {title} | {query_name}
  ...

→ Run `/career-ops pipeline` to evaluate the new offers.
```

## `careers_url` management

Every company in `tracked_companies` should have `careers_url` — the direct URL to its job page. This avoids rediscovering it on every scan.

**Known platform patterns:**
- **Ashby:** `https://jobs.ashbyhq.com/{slug}`
- **Greenhouse:** `https://job-boards.greenhouse.io/{slug}` o `https://job-boards.eu.greenhouse.io/{slug}`
- **Lever:** `https://jobs.lever.co/{slug}`
- **Custom:** The company's own URL (for example: `https://openai.com/careers`)

**If `careers_url` does not exist** for a company:
1. Try the pattern for its known platform
2. If that fails, do a quick WebSearch: `"{company}" careers jobs`
3. Use Playwright to confirm it works
4. **Save the discovered URL in `portals.yml`** for future scans

**If `careers_url` returns 404 or redirects:**
1. Note it in the output summary
2. Try `scan_query` as a fallback
3. Mark it for manual update

## `portals.yml` maintenance

- **ALWAYS save `careers_url`** when adding a new company
- Add new queries as interesting portals or roles are discovered
- Disable noisy queries with `enabled: false`
- Adjust filtering keywords as target roles evolve
- Add companies to `tracked_companies` when they are worth tracking closely
- Verify `careers_url` periodically — companies do change ATS platforms
