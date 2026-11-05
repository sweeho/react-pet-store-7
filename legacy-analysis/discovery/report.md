# SX-0001 discovery report: Java Pet Store 1.3.2

Stage: discovery. No requirements extracted. Paths below are repo-relative.

## 1. Verdict

The legacy tree under `legacy-source/` is the full Sun Java Pet Store 1.3.2 (J2EE 1.3: EJB 2.0 CMP, MDBs, JMS, the WAF web framework, JSP). It also has DDL, seven shell batch jobs, a Control-M schedule and config that were added afterwards. It has 4 deployable applications, 18 shared components, 1 framework and 5 non-Java artefact groups. That gives **28 extraction modules** (`risk-scores.csv`) and **12 capabilities** (`capabilities.csv`).

The business logic sits in five places: the OPC message beans (approval and workflow), the supplier fulfilment facade, the storefront controller/actions with their JSPs, the DDL `CHECK` constraints, and the batch SQL. Most of the rest is plumbing: service locator, XML (de)serialisers, the async sender and the WAF controller.

## 2. Tree survey

| Area                                                       | Files                           | Notes                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `legacy-source/app/src/apps/{petstore,opc,supplier,admin}` | 117 Java, 79 JSP, descriptors   | 4 EARs                                                                                                                             |
| `legacy-source/app/src/components/*`                       | 116 Java, descriptors           | 18 components (`util/tracer` counted as `util`)                                                                                    |
| `legacy-source/app/src/waf`                                | 54 Java, 19 JSP                 | Web Application Framework: controller, flow handlers, template servlet, taglibs                                                    |
| `legacy-source/db/schema`                                  | 2 SQL                           | Cloudscape (runtime) and Oracle (reference). Their table/index/view/CHECK statements match. 20 tables, 5 indexes, 1 view, 5 CHECKs |
| `legacy-source/db/batch`                                   | 6 SQL                           | SQL run by the batch jobs                                                                                                          |
| `legacy-source/batch`                                      | 7 sh                            | One script per Control-M job                                                                                                       |
| `legacy-source/conf`                                       | `env.sh`, `petstore.properties` | Batch thresholds and a copy of the J2EE env-entry values                                                                           |
| `legacy-source/scheduler/control-m`                        | 1 XML                           | 2 folders, 7 jobs                                                                                                                  |

572 files in total. `legacy-source/README.md` refers to `docs/`, `data/` and `vortex/` (including an answer key). **None of these are in the tree.** The only document source is `legacy-analysis/sources/pdf/petstore-user-guide` (84 lines, extracted). Its claims are cross-checked in §6.

LOC counts Java, JSP, XML, SQL, sh, properties, XSL, TLD and XSD, without `build.xml` or DTDs.

## 3. Module inventory (risk-ranked)

| #   | Module                                            | LOC   | Screens | Risk   | Score | Why                                                                                                                     |
| --- | ------------------------------------------------- | ----- | ------- | ------ | ----- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | `legacy-source/app/src/apps/opc`                  | 5472  | 0       | high   | 10    | Auto-approval limits are bare literals; the order state machine runs across 4 MDBs; mail switches; admin facade queries |
| 2   | `legacy-source/app/src/apps/petstore`             | 18144 | 19      | high   | 9     | Largest module. Checkout, account forms, cart actions, populate servlet; 3 locale copies of every JSP                   |
| 3   | `legacy-source/app/src/apps/supplier`             | 3985  | 7       | high   | 9     | Ship-from-stock, partial shipment, invoicing, inventory edit, re-processing of pending orders                           |
| 4   | `legacy-source/db/schema`                         | 472   | 0       | high   | 8     | Highest-confidence invariants: NOT NULL, FK, 5 CHECKs, status enums                                                     |
| 5   | `legacy-source/app/src/components/processmanager` | 1179  | 0       | high   | 8     | Order status values and the transition API                                                                              |
| 6   | `legacy-source/app/src/components/purchaseorder`  | 2174  | 0       | high   | 8     | Order total (`float`) persisted as `po_value`                                                                           |
| 7   | `legacy-source/app/src/components/cart`           | 664   | 0       | high   | 8     | Cart total is computed from `unitCost` (see F2)                                                                         |
| 8   | `legacy-source/app/src/components/signon`         | 1417  | 0       | high   | 7     | Plain-text passwords; protected-resource filter; password-length constant redacted (F1)                                 |
| 9   | `legacy-source/db/batch`                          | 85    | 0       | high   | 7     | Purge deletes 8 tables; aging/mismatch logic; catalog checks C1 to C5                                                   |
| 10  | `legacy-source/batch`                             | 113   | 0       | high   | 7     | Exit-code contracts (4 warn / 8 fail), retention windows, populate trigger                                              |
| 11  | `legacy-source/app/src/apps/admin`                | 5533  | 8       | medium | 7     | Approve/deny UI (Swing client + servlet proxy), revenue/order charts                                                    |
| 12  | `legacy-source/app/src/components/supplierpo`     | 1736  | 0       | medium | 6     | Supplier order entity, PENDING/COMPLETED                                                                                |
| 13  | `legacy-source/app/src/components/catalog`        | 2709  | 0       | medium | 6     | Search SQL (case-insensitive LIKE across name, catid, description); two DAO implementations                             |
| 14  | `legacy-source/app/src/components/customer`       | 2218  | 0       | medium | 6     | Account, profile, customer entities and relationships                                                                   |
| 15  | `legacy-source/scheduler/control-m`               | 109   | 0       | medium | 6     | Times, dependencies, alert routing                                                                                      |
| 16  | `legacy-source/conf`                              | 112   | 0       | medium | 5     | Thresholds (180 d, 24 h, 500 units, 7 d); conflicting host names (F8)                                                   |
| 17  | `legacy-source/app/src/components/creditcard`     | 605   | 0       | medium | 5     | Card stored in clear; expiry as text                                                                                    |
| 18  | `legacy-source/app/src/components/lineitem`       | 685   | 0       | medium | 5     | Quantity / quantity shipped                                                                                             |
| 19  | `legacy-source/app/src/components/mailer`         | 677   | 0       | medium | 5     | Mail MDB                                                                                                                |
| 20  | `legacy-source/app/src/components/xmldocuments`   | 2080  | 0       | medium | 5     | Inter-application message contracts (PurchaseOrder, OrderApproval, Invoice, Mail DTDs)                                  |
| 21  | `legacy-source/app/src/waf`                       | 8540  | 0       | medium | 4     | Framework; locale change and flow handlers only. Its 19 JSPs are framework samples, not storefront screens              |
| 22  | `legacy-source/app/src/components/contactinfo`    | 1087  | 0       | low    | 4     | Entity                                                                                                                  |
| 23  | `legacy-source/app/src/components/address`        | 829   | 0       | low    | 4     | Entity                                                                                                                  |
| 24  | `legacy-source/app/src/components/uidgen`         | 606   | 0       | low    | 4     | Named counters for order ids                                                                                            |
| 25  | `legacy-source/app/src/components/asyncsender`    | 399   | 0       | low    | 3     | JMS send helper                                                                                                         |
| 26  | `legacy-source/app/src/components/servicelocator` | 658   | 0       | low    | 2     | JNDI lookup                                                                                                             |
| 27  | `legacy-source/app/src/components/encodingfilter` | 80    | 0       | low    | 2     | Request encoding filter                                                                                                 |
| 28  | `legacy-source/app/src/components/util`           | 80    | 0       | low    | 1     | Debug tracer                                                                                                            |

Screen counts:

- **petstore**: the 19 screens in `screendefinitions_en_US.xml` (ja_JP and zh_CN define the same 19).
- **supplier**: 7 JSPs.
- **admin**: 4 web pages plus 4 rich-client panels (orders view, orders approve, bar chart, pie chart).
- **opc**: `EntityCatalog.jsp` is a technical page, counted as 0.

### Sharding advice

- `apps/petstore` is 3× larger than any other module. If it must be split, split by capability, not by directory: catalog/cart, account/sign-on, checkout. Extract each JSP from the en_US copy, then **diff** `ja/` and `zh/`. The locale copies are not identical: tag counts differ on cart, category, customer, edit_customer, enter_order_information, item, product and search. Some of that may be locale-only rule drift.
- Extract `batch` + `db/batch` + `conf` + `scheduler/control-m` in one shard. Each job's rule is split across all four.
- Extract `db/schema` before or alongside every entity component. It is the tie-breaker the playbook ranks first.

## 4. Dependency summary

The full graph is in `dependency-graph.json`: 28 nodes, 88 edges. Edge kinds are `java-import`, `jms`, `ejb-remote`, `http`, `db-table-owner`, `db-read-write`, `runs-sql`, `schedules` and `servlet-filter`.

Runtime order flow (from deployment descriptors):

1. petstore → `jms/opc/OrderQueue` → OPC `PurchaseOrderMDB`. It creates the order as PENDING, then auto-approves below the locale limit.
2. admin client → `jms/opc/OrderApprovalQueue` → OPC `OrderApprovalMDB` (approve/deny).
3. OPC → `jms/supplier/PurchaseOrderQueue` → supplier `SupplierOrderMDB` → `OrderFulfillmentFacadeEJB` ships what is in stock.
4. supplier → `jms/opc/InvoiceTopic` → OPC `InvoiceMDB`. The order becomes COMPLETED when all lines are shipped.
5. OPC mail MDBs → `jms/opc/MailQueue` → `mailer`.
6. Supplier inventory edit (`RcvrRequestProcessor`) → `processPendingPO()` re-tries PENDING supplier orders.

Static hubs:

- `servicelocator` has 7 importers.
- `xmldocuments` has 10 importers.
- `petstore` → `waf` has 82 imports.
- `purchaseorder` composes contactinfo, address, creditcard and lineitem.

Nightly chain:

- 01:00 backup → 01:30 extract (gated on backup) → 01:45 aging, 01:50 low stock, Sunday 02:00 purge (each gated on extract).
- Separately: 06:00 catalog check, and a health check every 10 minutes.

## 5. Exclusions

| Excluded                                                                               | Reason                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `legacy-source/app/src/lib/jstl` (2734 lines), `lib/base64` (licence only)             | Third-party library, no application behaviour                                                                                                          |
| `build.xml`, `build.sh`, `build.bat`, `setup.*`, `*.mf` across `legacy-source/app`     | Build and packaging only. They are inside the module paths but carry no rules; extractors should skip them                                             |
| J2EE/WAF descriptor DTDs (`*.dtd` outside `components/xmldocuments/src/rsrc/schemas`)  | Standard descriptor grammars. **Not excluded:** the message DTDs in `xmldocuments/rsrc/schemas`, which are the inter-application contracts             |
| `COPYRIGHT.html`, `IMAGE_COPYRIGHT.html`, `LICENSE.html`, `legacy-source/README.md`    | Licence and packaging notes. The README is context only, not a requirement source                                                                      |
| `apps/petstore/src/docroot/populate/*.xml`, `apps/supplier/src/docroot/populate/*.xml` | Sample data. Kept in the `catalog-data-maintenance` scope only for what it shows about the load (locales, sample users); its rows are not requirements |
| `apps/*/src/sun-j2ee-ri.xml`                                                           | Vendor deployment bindings. Read for JMS/JNDI wiring (`stack_metadata`), not for behaviour                                                             |
| `apps/admin/src/client/resources/petstore_de.properties`                               | German client strings for a locale the store does not serve. Kept as evidence, not a requirement source                                                |

Missing from the tree, so not excludable but noted: `docs/`, `data/`, `vortex/`.

## 6. Findings for later stages (not requirements)

These are ambiguity and dispute candidates spotted during the survey. Extraction should confirm each one and raise it formally.

- **F1 — Secret-scanner redaction removed real values.** 73 `«REDACTED:secret-finding-N»` markers in 21 files replaced non-secret config:
  - every OPC/supplier `env-entry` value (XML validation and mail switches);
  - the catalog DAO class/database selection (`apps/petstore/src/docroot/WEB-INF/web.xml:186-213`, `components/catalog/src/ejb-jar.xml:60-67`);
  - `UserLocal.MAX_PASSWD_LENGTH` (`components/signon/src/com/sun/j2ee/blueprints/signon/user/ejb/UserLocal.java:47`).

  Several Java statements are truncated mid-line. `conf/petstore.properties` holds a copy of most switch values. It is the only remaining source and is secondary, so any rule resting on a redacted value is low-confidence at best. The password length cannot be recovered from the tree.

- **F2 — Customers are charged the supplier cost.** The item page labels `unitCost` as "Your Price" (`apps/petstore/src/docroot/item.jsp:69-70`). The cart total multiplies `unitCost` by quantity (`components/cart/src/com/sun/j2ee/blueprints/cart/ejb/ShoppingCartLocalEJB.java:141`). The DDL says `unitcost` is "the supplier cost", and the user guide calls it a "discounted price for members". The sources conflict, so this is `disputed`.
- **F3 — Auto-approval limits.** They are bare literals: `< 500` for `Locale.US` and `< 50000` for `Locale.JAPAN` (`apps/opc/src/com/sun/j2ee/blueprints/opc/ejb/PurchaseOrderMDB.java:183-190`).
  - **zh_CN orders are never auto-approved.**
  - `petstore.properties` claims the limits are ejb-jar.xml settings. They are not.
  - The user guide says an order is pending if it is "greater than $500". The code also holds an order of exactly 500, so the boundary is disputed.
- **F4 — Money precision.** The order total is a Java `float` (`components/purchaseorder/.../PurchaseOrder.java:81`). It is stored as `double` `po_value`, while catalog prices are `decimal(10,2)`. The rounding rule is undocumented.
- **F5 — Dead or broken mapping.** `mappings.xml:55` names `petstore.controller.ejb.actions.SignOffEJBAction`, but no such class exists in the tree. Reachability is unresolved.
- **F6 — Two catalog DAO implementations.** Which of `GenericCatalogDAO` and `CloudscapeCatalogDAO` is live depends on a redacted env-entry (F1). `petstore.properties` says Generic. Mark the other as `unresolved-reachability`.
- **F7 — `/Populate` is unauthenticated.** It is mapped in petstore `web.xml:154-159` with no security constraint, and batch calls it over HTTP with `forcefully=false`. Its behaviour with `forcefully=true` needs extraction. Authorisation gap.
- **F8 — Conflicting environment.** Host names differ: `env.sh` uses `psl-app01`, while `petstore.properties` and Control-M use `ps-app01`. Operational, not functional; recorded for the batch shard.
- **F9 — Order purge orphans data.** `order_purge.sql` deletes the order's contact, address and card. It never deletes the separate `supplier_order.contact_id` contact or its address. It also does not check whether a `credit_card` row is still referenced by an `account`. Needs a dispute review.
- **F10 — Aging report scope.** `order_aging.sql` also emits `MISMATCH` rows (supplier COMPLETED, OPC not). The script exits 4 on these, but the job's Control-M description mentions only stuck orders.
- **F11 — Sign-on error screen.** `signon-config.xml` names `signon_error.screen`, which resolves to `signon_failed.jsp`. Consistent, noted only to stop false positives.
- **F12 — Order and admin roles.** Supplier and admin web modules require the `administrator` role (FORM login). The OPC has no web security, and no `method-permission` was found in any `ejb-jar.xml`. Who may approve orders is enforced only by the admin web module.

## 7. Coverage and limits

- Every directory under `legacy-source/` was listed and counted. Every descriptor and every batch, SQL, config and schedule file was read in full.
- Java and JSP were sampled for discovery only: OPC MDBs, the supplier fulfilment facade, admin facade signatures, cart total, item page, catalog search SQL, and the redaction sites. Most entity and view files were not read line by line. That is extraction-stage work.
- Import edges were computed mechanically from `import` statements. Runtime edges come from `sun-j2ee-ri.xml`, `web.xml` and the scripts.
- Out of scope, noticed in the host repo: `tailwind.config.ts` exists at the repo root, which the pinned stack treats as a defect.
