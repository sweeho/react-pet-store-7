## Why

Checkout is how a signed-on shopper turns a cart into a purchase order. The legacy Java Pet Store storefront collects billing and shipping details, assigns an order number, builds and sends the order for processing, empties the cart and confirms the order. The rules are spread across the storefront, the purchase-order, credit-card and unique-id components, and the database schema. This change records them so the rebuild can be verified against them.

## What Changes

- Specify the order-placement workflow, order total calculation and empty-cart refusal.
- Specify the three checkout screens: order information form, order-complete page and general error page.
- Specify the purchase-order, line-item and counter data rules and the order XML exchange.
- Flag legacy defects for a person to decide: hard-coded payment card, unreported blank checkout fields, float totals, unreachable error mapping.

## Impact

- Capability: checkout
- Sources: petstore storefront, purchaseorder, creditcard, uidgen, servicelocator, opc order receiver, DDL scripts.
