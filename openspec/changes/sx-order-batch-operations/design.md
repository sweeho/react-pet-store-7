# Design notes (legacy implementation)

## User interface

No screen records were extracted for this capability; its user interface is unspecified. All behaviour is batch/SQL driven.

## Legacy implementation

- Scripts under `legacy-source/db/batch/` are Derby `ij` SQL files with parameters bound by wrapper shell scripts (`ps_*.sh`): `order_extract.sql`, `order_aging.sql`, `inventory_report.sql`, `order_purge.sql`, `db_backup.sql`.
- Extract uses `SYSCS_EXPORT_QUERY`; the shell script renames output to `orders_YYYYMMDD.csv`. Inner join to `order_manager` drops orders without a manager row.
- Aging cutoff (24h), low-stock threshold (`PS_LOW_STOCK_QTY`) and retention (180 days, `PS_ORDER_RETENTION_DAYS`) are set in `conf/env.sh`, not in the SQL; values not confirmed.
- Inventory report joins descriptions only for `en_US`, so items without one are silently omitted.
- Purge uses a session temporary table, deletes children before parents, one COMMIT. Inner join to `contact_info` means orders lacking a contact are never purged. The "after extract" ordering is only a comment; the SQL does not enforce it.
- Backup path `/var/petstore/backup` is a hard-coded literal; dated-folder move is in the shell script (not read).
- View `v_order_status` and indexes `ix_po_user`, `ix_po_date`, `ix_order_manager_status` are in `db/schema/petstore_oracle.sql`.
