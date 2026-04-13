# Mode: apply — Live Application Assistant

Interactive mode for when the candidate is filling out an application form in Chrome. Read what is on screen, load prior context for the role, and generate tailored answers for each form question.

## Requirements

- **Best with visible Playwright**: In visible mode, the candidate can see the browser and Claude can interact with the page.
- **Without Playwright**: The candidate shares a screenshot or pastes the questions manually.

## Workflow

```
1. DETECT    → Read the active Chrome tab (screenshot/URL/title)
2. IDENTIFY  → Extract company + role from the page
3. SEARCH    → Match against existing reports in reports/
4. LOAD      → Read the full report + Section G (if present)
5. COMPARE   → Does the on-screen role match the evaluated one? If not, warn
6. ANALYZE   → Identify ALL visible form questions
7. GENERATE  → Produce a tailored answer for each question
8. PRESENT   → Show formatted answers for copy-paste
```

## Step 1 — Detect the role

**With Playwright:** Take a snapshot of the active page. Read the title, URL, and visible content.

**Without Playwright:** Ask the candidate to:
- Share a screenshot of the form (the Read tool can read images)
- Or paste the form questions as text
- Or give the company + role so it can be looked up

## Step 2 — Identify and load context

1. Extract the company name and role title from the page
2. Search `reports/` by company name (case-insensitive grep)
3. If there is a match, load the full report
4. If Section G exists, load prior draft answers as the base
5. If there is NO match, warn and offer to run a quick auto-pipeline

## Step 3 — Detect role changes

If the on-screen role differs from the evaluated one:
- **Warn the candidate**: "The role changed from [X] to [Y]. Do you want me to re-evaluate it or adapt the answers to the new title?"
- **If adapting**: Adjust the answers to the new role without re-evaluating
- **If re-evaluating**: Run the full A-F evaluation, update the report, regenerate Section G
- **Update the tracker**: Change the role title in `applications.md` if needed

## Step 4 — Analyze form questions

Identify ALL visible questions:
- Free-text fields (cover letter, why this role, etc.)
- Dropdowns (how did you hear, work authorization, etc.)
- Yes/No fields (relocation, visa, etc.)
- Salary fields (range, expectation)
- Upload fields (resume, cover letter PDF)

Classify each question:
- **Already answered in Section G** → adapt the existing answer
- **New question** → generate an answer from the report + `cv.md`

## Step 5 — Generate answers

For each question, generate the answer using:

1. **Report context**: Use proof points from block B and STAR stories from block F
2. **Previous Section G**: If a draft answer exists, refine it instead of starting over
3. **"I'm choosing you" tone**: Same framework as auto-pipeline
4. **Specificity**: Reference something concrete from the visible JD on screen
5. **career-ops proof point**: Include it in "Additional info" if there is a relevant field

**Output format:**

```
## Answers for [Company] — [Role]

Based on: Report #NNN | Score: X.X/5 | Archetype: [type]

---

### 1. [Exact form question]
> [Answer ready to copy-paste]

### 2. [Next question]
> [Answer]

...

---

Notes:
- [Any observation about the role, changes, etc.]
- [Personalization suggestions the candidate should review]
```

## Step 6 — Post-apply (optional)

If the candidate confirms they submitted the application:
1. Update status in `applications.md` from `Evaluated` to `Applied`
2. Update Section G of the report with the final answers
3. Suggest the next step: `/career-ops contacto` for LinkedIn outreach

## Scroll handling

If the form has more questions than are currently visible:
- Ask the candidate to scroll and share another screenshot
- Or paste the remaining questions
- Process iteratively until the whole form is covered
