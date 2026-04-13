# Mode: offer — Full A-F Evaluation

When the candidate pastes a job posting (text or URL), ALWAYS deliver all 6 blocks:

## Step 0 — Archetype Detection

Classify the role into one of the 6 archetypes (see `_shared.md`). If it is hybrid, name the 2 closest. This determines:
- Which proof points to prioritize in block B
- How to rewrite the summary in block E
- Which STAR stories to prepare in block F

## Block A — Role Summary

Table with:
- Detected archetype
- Domain (platform/agentic/LLMOps/ML/enterprise)
- Function (build/consult/manage/deploy)
- Seniority
- Remote (full/hybrid/onsite)
- Team size (if mentioned)
- One-sentence TL;DR

## Block B — CV Match

Read `cv.md`. Create a table mapping each JD requirement to exact CV lines.

**Adapted to the archetype:**
- If FDE → prioritize fast-delivery and client-facing proof points
- If SA → prioritize systems design and integrations
- If PM → prioritize product discovery and metrics
- If LLMOps → prioritize evals, observability, and pipelines
- If Agentic → prioritize multi-agent, HITL, and orchestration
- If Transformation → prioritize change management, adoption, and scaling

Include a **gaps** section with a mitigation strategy for each gap:
1. Is it a hard blocker or a nice-to-have?
2. Can the candidate demonstrate adjacent experience?
3. Is there a portfolio project that covers the gap?
4. Concrete mitigation plan (cover-letter phrasing, quick project, etc.)

## Block C — Level and Strategy

1. **Detected level** in the JD vs the **candidate's natural level for this archetype**
2. **"Sell seniority without lying" plan**: specific phrasing by archetype, concrete achievements to highlight, how to position founder experience as an advantage
3. **"If they downlevel me" plan**: accept only if comp is fair, negotiate a 6-month review, require clear promotion criteria

## Block D — Comp and Demand

Use WebSearch for:
- Current role salaries (Glassdoor, Levels.fyi, Blind)
- Company compensation reputation
- Demand trend for the role

Present a table with cited data and sources. If data is missing, say so instead of inventing it.

## Block E — Personalization Plan

| # | Section | Current State | Proposed Change | Why |
|---|---------|---------------|-----------------|-----|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 CV changes plus Top 5 LinkedIn changes to maximize match.

## Block F — Interview Plan

6-10 STAR+R stories mapped to JD requirements (STAR + **Reflection**):

| # | JD Requirement | STAR+R Story | S | T | A | R | Reflection |
|---|----------------|--------------|---|---|---|---|------------|

The **Reflection** column captures what was learned or what would be done differently. This signals seniority: junior candidates describe what happened, senior candidates extract lessons.

**Story Bank:** If `interview-prep/story-bank.md` exists, check whether any of these stories are already there. If not, append the new ones. Over time this builds a reusable bank of 5-10 master stories that can adapt to any interview question.

**Selected and framed by archetype:**
- FDE → emphasize delivery speed and client-facing work
- SA → emphasize architecture decisions
- PM → emphasize discovery and trade-offs
- LLMOps → emphasize metrics, evals, and production hardening
- Agentic → emphasize orchestration, error handling, and HITL
- Transformation → emphasize adoption and organizational change

Also include:
- 1 recommended case study (which project to present and how)
- Red-flag questions and how to answer them (for example: "Why did you sell your company?" or "Did you manage a reporting team?")

---

## Post-Evaluation

**ALWAYS** after generating blocks A-F:

### 1. Save the report `.md`

Save the full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = next sequential number (3 digits, zero-padded)
- `{company-slug}` = lowercase company name, spaces replaced with hyphens
- `{YYYY-MM-DD}` = current date

**Report format:**

```markdown
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**Archetype:** {detected}
**Score:** {X/5}
**PDF:** {path or pending}

---

## A) Role Summary
(full contents of block A)

## B) CV Match
(full contents of block B)

## C) Level and Strategy
(full contents of block C)

## D) Comp and Demand
(full contents of block D)

## E) Personalization Plan
(full contents of block E)

## F) Interview Plan
(full contents of block F)

## G) Draft Application Answers
(only if score >= 4.5 — draft answers for the application form)

---

## Extracted Keywords
(list of 15-20 JD keywords for ATS optimization)
```

### 2. Register in the tracker

**ALWAYS** register in `data/applications.md`:
- Next sequential number
- Current date
- Company
- Role
- Score: average match score (1-5)
- Status: `Evaluated`
- PDF: ❌ (or ✅ if auto-pipeline generated the PDF)
- Report: relative link to the report `.md` (for example: `[001](reports/001-company-2026-01-01.md)`)

**Tracker format:**

```markdown
| # | Date | Company | Role | Score | Status | PDF | Report |
```
