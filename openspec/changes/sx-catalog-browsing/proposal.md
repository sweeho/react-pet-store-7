# Proposal: catalog browsing

## Why

Recover the storefront catalog behaviour of the legacy pet store so the rebuild matches it: category, product and item navigation, paged lists, item detail, keyword search, per-locale content and prices, the category sidebar, and the catalog data structure.

## What changes

- Specifies the catalog entities and their per-locale details.
- Specifies the three catalog screens (navigation and paged lists, item detail, category sidebar).
- Specifies search, language switching, price display and list caching rules.
- Draft (no key yet): request character encoding, secondary indexes.

## Open questions

- Search case sensitivity contradicts the user guide (CAT-BR-0004).
- Item list shows list price while search and cart show unit cost (CAT-BR-0003).
