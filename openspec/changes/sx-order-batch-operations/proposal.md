# Order batch operations

## Why

The legacy store runs nightly database batch jobs: a Finance order extract, a stuck-order aging report, a low-stock report, a retention purge and a database backup. Their behaviour exists only in SQL scripts and must be preserved in the rebuild.

## What changes

- Specify the order status view and supporting indexes.
- Specify the daily Finance extract, the aging and reconciliation report, the inventory report, the retention purge (ordered after the extract) and the backup.
