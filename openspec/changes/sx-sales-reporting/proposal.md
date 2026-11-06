# Sales reporting

## Why

Administrators need to list orders by processing status and view sales charts (revenue and units ordered) for a date period. The legacy Order Processing Center provides this through an admin facade and a date-range order finder.

## What changes

- Order listing by status (approved, key `SWHR6-R-0004`).
- Revenue and units-ordered aggregation by category or by item within a category, for an inclusive date period.
- Date-range order retrieval and supporting indexes by user and date (draft, awaiting SME decision).

## Impact

Recovered legacy behaviour only. Open questions (status filtering in charts, float accumulation, chart labelling) are flagged in design.md.
