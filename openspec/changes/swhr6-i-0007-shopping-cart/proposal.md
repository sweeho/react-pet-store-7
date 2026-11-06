# Shopping cart: recovered specification

## Why

The legacy storefront lets every visitor build a cart before signing on. This change records that behaviour so the rebuild can be verified against it.

## What changes

- Adds the shopping-cart capability: add, remove and update cart lines, per-session anonymous carts, non-numeric quantity handling, and the cart screen.

## Impact

- Capability: shopping-cart (new).
- Open points for an SME: effect of quantity 0 or negative values (decided in the cart component outside the extracted module); repeat-add behaviour; anonymous access is inferred, not stated.
