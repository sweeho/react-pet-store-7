## 1. Data model

- [ ] 1.1 Define catalog item and per-locale item detail entities with list price and unit cost (2-decimal, required)
- [ ] 1.2 Define supplier stock record keyed by item id

## 2. Storefront data load

- [ ] 2.1 Implement conditional load (skip when catalog, users and customers exist) and forced reload
- [ ] 2.2 Load seed users, customers and five categories in three locales
- [ ] 2.3 Implement redirect and error handling for the load function
- [ ] 2.4 Implement the wait page that chains storefront then supplier load

## 3. Supplier data load

- [ ] 3.1 Implement conditional and forced stock load with replace-by-item semantics
- [ ] 3.2 Seed 29 items EST-1..EST-29 at quantity 10000
- [ ] 3.3 Implement supplier wait page and redirects

## 4. Integrity checks

- [ ] 4.1 Implement checks C1 and C2 and fail the job on any finding
- [ ] 4.2 Implement checks C3, C4 and C5
- [ ] 4.3 Log total category and item counts
