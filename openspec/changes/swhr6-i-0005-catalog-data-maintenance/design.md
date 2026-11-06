# Legacy implementation notes: catalog-data-maintenance

## Storefront populate

- `PopulateServlet` (petstore) checks `catalogPopulator.check`, `customerPopulator.check` and `userPopulator.check`; if not all hold data, or force is set, it drops/creates tables and SAX-parses `populate/Populate-UTF8.xml` using SQL from `populate/PopulateSQL.xml`. User and customer populators remove an existing bean with the same id before creating.
- Servlet is mapped in `web.xml` without a security constraint; it invalidates the session and redirects to the success page or the referer.
- `populating.jsp` shows the wait message and calls the storefront load, then the supplier load with the same force flag.

## Supplier populate

- `PopulateServlet` (supplier) and `InventoryPopulator` load stock from the supplier `Populate-UTF8.xml`: 29 items EST-1..EST-29, quantity 10000. Non-numeric or missing quantity loads as 0. Unreadable existing stock is treated as empty.
- Supplier `populating.jsp` shows its own wait message and returns to the storefront home.

## Data model

- Item and per-locale item detail tables in `PopulateSQL.xml` / `db/schema/petstore_oracle.sql`. The schema has no list price >= unit cost check (line ~230); both passes agree.

## Batch integrity

- `db/batch/catalog_check.sql` runs C1-C5. `order_purge.sql`, `inventory_report.sql`, `order_aging.sql` and `ps_order_aging_report.sh` were cited as traces for CDM-REQ-0003 but concern other jobs; the SME should confirm the capability assignment.

## Noted conflicts

- C3 flags list price below unit cost while the schema allows it: not a contradiction (check is reporting only), but whether it is a data defect is a Business Owner decision.
- Record key `CDM-REQ-0001` is used by two different records (supplier load and category/product integrity check).

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The wait pages (`populating.jsp`) appear only as workflow records and are captured as behaviour requirements.
