# Mode: tracker — Application Tracker

Read and display `data/applications.md`.

**Tracker format:**
```markdown
| # | Date | Company | Role | Score | Status | PDF | Report |
```

Possible statuses: `Evaluated` → `Applied` → `Responded` → `Contact` → `Interview` → `Offer` / `Rejected` / `Discarded` / `SKIP`

- `Applied` = the candidate submitted the application
- `Responded` = a recruiter/company contacted the candidate and the candidate replied (inbound)
- `Contact` = the candidate proactively contacted someone at the company (outbound, for example a LinkedIn power move)

If the user asks to update a status, edit the corresponding row.

Also show statistics:
- Total applications
- By status
- Average score
- % with generated PDF
- % with generated report
