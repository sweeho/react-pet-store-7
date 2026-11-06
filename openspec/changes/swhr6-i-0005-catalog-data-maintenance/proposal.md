# Catalog data maintenance

## Why

The legacy Pet Store and Supplier applications seed their own data (catalog, users, customers, supplier stock) through populate functions, and a batch SQL job checks catalog integrity. These behaviours must be preserved in the rebuild.

## What changes

- Specify storefront and supplier data population (conditional load, forced reload, redirects, bundled seed content).
- Specify the catalog item pricing storage rules, including the absence of a price-versus-cost constraint.
- Specify the catalog integrity checks (C1-C5).

## Impact

Capability `catalog-data-maintenance`. Drafted from 14 IR records; one is approved (`DATA-BR-0005`), the rest await SME decision.
