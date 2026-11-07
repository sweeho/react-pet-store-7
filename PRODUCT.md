# Pet Store Modernisation

_PRD v10 · approved 2026-11-07 · by sweeho@gmail.com. Published from the Design Workbench — edit it there, not here._

## Summary

Replace the Java Pet Store with a new application that keeps its approved behaviour: a multilingual storefront where shoppers browse pets, fill a cart, sign on and place orders, plus the back-office flows that approve orders, ship them from supplier stock, notify customers, report on sales and run nightly order housekeeping.

## Context

The legacy system is being rebuilt. Its behaviour was extracted and approved as the specification on this initiative, which is the only source for this document. No other documents were uploaded, so there is nothing for the specification to disagree with and `divergences.yaml` is empty.

## Goals

- Restrict account, checkout and supplier inventory screens to signed-on users, with a 15 minute idle timeout for the storefront and 54 minutes for the supplier.
- Let a visitor sign up and keep contact details, address, payment card and language preferences.
- Let shoppers browse categories, products and items in English, Japanese or Chinese, with per-locale prices, and search by keyword.
- Let a visitor build a cart before signing on and turn it into a purchase order at checkout.
- Approve orders automatically below a per-locale total (en_US under 500, ja_JP under 50000) and leave the rest pending for an administrator decision.
- Ship approved orders whole line by whole line from supplier stock, keep stock never negative, and invoice what shipped.
- E-mail customers about order status, shipment and completion in their language.
- Give administrators an order list by status and revenue and quantity charts by period.
- Run nightly jobs that report stuck orders, status counts, invoice mismatches and low stock, extract and then purge old orders, and back up the order database.

## Non-goals

- Structural, technology or data-model choices of the legacy system are not requirements here.
- No capability beyond the specification is requested.

## Users

- Visitor: browses and searches the catalog and keeps a cart without signing on.
- Returning customer and new customer: sign on or sign up, maintain an account, place orders and receive e-mail.
- Administrator: decides pending orders, lists orders by status and views sales charts.
- Supplier administrator: signs in to the inventory application and updates stock.
- Operator: runs and reads the nightly order reports and jobs.

## User journeys

1. Browse and buy as a new customer: Landing page, Category list, Product list, Item detail, Cart, Sign-in screen, Sign-up form, Customer details form, Order information, Order complete.
2. Buy as a returning customer: Item detail, Cart, Sign-in screen, Order information, Order complete.
3. Change account preferences: Sign-in screen, Account screen, Account edit, Account screen.
4. Sign out: any storefront page, Signed-out message, Sign-in screen.
5. Search: any storefront page, Search results, Item detail.
6. Update stock as supplier administrator: Supplier sign-in, Supplier home, Inventory screen, Inventory updated message.
7. Review orders as administrator: Order-status view by status, Revenue and quantity charts.

## Capability map

- sign-on: authentication, protected resources, sign-out, idle timeouts and the sign-in screens for the storefront and the supplier administrator.
- customer-accounts: sign-up, customer details, address, payment card, profile preferences and account edit.
- catalog-data-maintenance: the initial seed of users, customers, categories and details.
- catalog-browsing: category, product and item browsing, search, locales, language switching and prices.
- shopping-cart: the per-session anonymous cart with add and remove lines.
- checkout: turning a cart into a purchase order, with the order information, complete and error screens.
- order-approval: automatic and administrator approve or deny decisions on pending orders.
- inventory-management: per-item stock and the supplier inventory screens.
- order-fulfillment: supplier order intake, whole-line shipment, invoicing and order status tracking.
- order-notifications: customer e-mails for status, shipment and completion, in the customer's locale.
- sales-reporting: orders listed by status, revenue and quantity charts by period, and order lookup by user and date.
- order-batch-operations: stuck-order and status-count reports, invoice mismatch, low stock, nightly extract, purge and backup.
- Site shell (from the specification; describe it in one line)

## Screens

- Landing page
- Category list, product list, item detail, category sidebar and search results
- Cart
- Storefront sign-in, sign-up and customer details form
- Account screen and account edit
- Order information, order complete and general error screen
- Signed-out message
- Supplier sign-in, supplier home and inventory screen
- Order-status view and sales charts
- Shared empty, error and loading frames

## Constraints and assumptions

- The specification's wording on locales, thresholds and timeouts is taken as stated.
- Revenue and quantity charts include orders of every status, including denied ones.
- Stuck orders are those PENDING or APPROVED and older than 24 hours.
- Finished orders (COMPLETED or DENIED) older than 180 days are purged, and only after the nightly extract has run.

## Open questions

- Capability set: the manifest lists 12 capabilities. The specification also holds a `site-shell` capability (landing page, global navigation, shared layout and state frames) that the manifest lacks. This PRD keeps the 12 manifest slugs and lists the shell's landing page and shared frames under Screens. Decide whether `site-shell` becomes a thirteenth capability.
- Change directories: the manifest points at `openspec/changes/sx-*` directories that do not exist. The approved specifications are under `openspec/changes/swhr6-i-*`, and this PRD cites those.
- Supplier session timeout is stated twice in `sign-on` (Supplier idle timeout and Supplier session expiry), both 54 minutes. Confirm they are one requirement.
- Order status view appears in both `sales-reporting` and `order-batch-operations`. Decide which capability owns it.
- Plain-text credential storage is part of the recorded legacy behaviour. Confirm the replacement is expected to keep it.

## Sources

Approved specifications under `openspec/changes/`, listed per section in `sources.yaml`. No uploaded documents.
