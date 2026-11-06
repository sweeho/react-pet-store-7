## 1. Data access

- [ ] 1.1 Provide the order status view (id, user, date, value, status)
- [ ] 1.2 Index orders by user and date, and workflow status by status

## 2. Reports and extract

- [ ] 2.1 Implement the nightly Finance order extract for yesterday's window
- [ ] 2.2 Implement the stuck-order report with 24-hour cutoff
- [ ] 2.3 Add the per-status order count to the aging report
- [ ] 2.4 Add the supplier/manager MISMATCH reconciliation
- [ ] 2.5 Implement the low-stock inventory report with totals

## 3. Maintenance

- [ ] 3.1 Implement the transactional 180-day order purge
- [ ] 3.2 Enforce that purge runs after extract
- [ ] 3.3 Implement the online database backup
