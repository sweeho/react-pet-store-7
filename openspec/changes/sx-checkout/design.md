# Legacy implementation notes: checkout

## Screens

- Order information: `enter_order_information.jsp` (plus `ja/` and `zh/` copies), a form posting to `order.do`; fields suffixed `_a` (billing) and `_b` (shipping); values come from the signed-on customer's account contact info. Browser-side "<field> is empty." alerts come from the custom form tag's validation attribute.
- Order complete: `order_completed.jsp`, forwarded from `order.do` via `order_complete.screen`; reads the order response set in `OrderHTMLAction.doEnd`.
- Empty cart error: `cart_empty_order_error.jsp`, mapped from `ShoppingCartEmptyOrderException` in `mappings.xml`.
- General error: `general_error.jsp`. `mappings.xml` maps the petstore-package `GeneralFailureException` to `error.screen`, but the class thrown is in the waf package and no `error` screen exists. Reachability is unresolved.

## Flow

1. `OrderHTMLAction` reads `_a`/`_b` fields via `extractContactInfo`, builds a hard-coded card ("1234-2334", "Duke Express", "10/2001", comment "needs to be part of the form") and an `OrderEvent`.
2. `OrderEJBAction` (in the shopping controller bean): gets an id from `UniqueIdGeneratorEJB` using counter name "1001"; checks the cart is not empty; loops cart lines adding float unit cost x quantity; line numbers start at 0; builds the `PurchaseOrder`; sends `toXML()` through `AsyncSenderEJB` to `jms/opc/OrderQueue`; send failures are printed and swallowed; then `cart.empty()`.
3. `PurchaseOrderMDB` in OPC receives the XML, stores it and validates against the DTD only when a validation flag is on. `PurchaseOrderEJB` (CMP) creates contact, credit card and one line item per item (shipped quantity 0); a failed service lookup aborts creation.

## Constraints found only in markup or code

- Blank-field handling in `OrderHTMLAction.extractContactInfo` builds a `MissingFormDataException` into a request attribute nobody reads and returns null; `OrderEJBAction` then calls `billTo.getEmail()` on null.
- Required-ness of e-mail differs between passes (pass A: required in markup; pass B: optional in the server check). Disputed.
- Shipping country list omits China in en and ja pages, includes it in zh. The account form stores "USA" but checkout offers "United States".
- Order total is a Java `float` with no rounding; the DB column is decimal with two places.

## Data

- `purchase_order` / `lineitem` in `petstore_oracle.sql` and `petstore_cloudscape.sql` (order date epoch ms, mandatory contact and card, line quantity > 0, shipped quantity not above quantity). `counter` table: unique name up to 40 characters, integer value.
- Counter and credit-card EJBs run with transaction Required and no role restriction. Missing counter is created at 0 on first use.
- Credit card expiry month/year derived by splitting on "/"; missing/malformed gives "01"/"2010". Card fields are stored as plain text without validation.
- Service locator caches homes/queues/data sources in the web tier only; failures wrap in `ServiceLocatorException`.
