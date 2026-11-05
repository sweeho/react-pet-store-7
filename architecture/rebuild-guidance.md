# Rebuild guidance

Guidance for tickets that rebuild the Java Pet Store from this extraction.

## Authority

- The capability delta specs under `openspec/changes/sx-<capability>/specs/` are the requirement source. Where `api/openapi.yaml`, `architecture/erd.mermaid` or `architecture/schema.sql` disagree with a delta spec, the delta spec wins. Those three files describe the legacy system and are not a build target.
- Build order and dependencies are in `build/manifest.yaml`.
- The legacy source tree was not present in this branch; extraction used the IR under `legacy-analysis/ir/`. Schema and API files were reconstructed from IR excerpts and are partly approximate (noted inline).

## Target stack

Build on this repository's pinned stack (Vite React SPA, Nitro/H3 routes, SQLite via Drizzle in `db/`, migrations in `drizzle/`). Do not port Struts, JSP, EJB, JMS or Oracle/Cloudscape specifics; reimplement the behaviour: pages under `src/pages/`, handlers under `routes/api/`, async hand-offs as in-process or table-backed jobs.

## Suspected legacy defects needing a human decision (do not silently copy or fix)

- Plain-text passwords and clear-text card numbers; unmasked card shown on the account screen.
- Checkout attaches a hard-coded card ("1234-2334", Duke Express, 10/2001) to every order.
- Checkout totals use float arithmetic; blank required fields reaching the server are silently ignored.
- Order-complete page promises a confirmation e-mail that may not be sent; async send failures are swallowed.
- No price-versus-cost constraint; sample data contains an item priced below cost.
- Error-page mapping names a class and screen that do not exist (reachability unresolved).
- Supplier sign-in pre-filled with supplier/supplier; storefront with j2ee/j2ee.

## Suggested sequence

Follow `order` in the manifest: sign-on, customer-accounts, catalog-data-maintenance, catalog-browsing, shopping-cart, checkout, order-approval, inventory-management, order-fulfillment, order-notifications, sales-reporting, order-batch-operations.

## Conventions

- Requirement text is in SHALL form with GIVEN/WHEN/THEN scenarios; test each scenario.
- Unreviewed capabilities carry `reviewedBy: null`; do not infer approval.
