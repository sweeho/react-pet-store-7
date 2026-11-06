# Legacy implementation notes: shopping cart

## Cart operations

- `cart.do` is mapped to `CartHTMLAction` in `mappings.xml` and forwards to `cart.screen`. `action=purchase` builds `CartEvent.ADD_ITEM`, `action=remove` builds `DELETE_ITEM`, `action=update` builds `UPDATE_ITEMS` from every `itemQuantity_<itemId>` request parameter.
- `CartEJBAction` (in `ShoppingControllerEJB`, transaction attribute Required) calls `addItem`, `deleteItem` and `updateItemQuantity` on the stateful `ShoppingCart` component.
- Quantity parsing: `new Integer(value)` with `NumberFormatException` replaced by 0 (CartHTMLAction.java:107-117). The effect of 0 or negative values, and of a repeat add, is decided in `components/cart`, which this extraction did not cover.

## Session scope

- `PetstoreComponentManager.sessionCreated` stores a `ShoppingCartLocal` (via `ShoppingClientFacadeLocalEJB.getShoppingCart`) in session attribute `cart`.
- `signon-config.xml` protects only `customer.screen`, `customer.do`, `enter_order_information.screen`, `signon_welcome.screen`. Cart pages are absent from the list, so anonymous access is inferred.

## Screen notes

- Rendered by `cart.jsp` (en, with ja and zh copies). The quantity input is a text field with maxlength 10 named `itemQuantity_<id>`; the line price is `item.unitCost`; the total is `cart.subTotal` (no tax or shipping). Check Out links to `enter_order_information.screen`, which is a sign-on protected resource.
- Add to Cart links in `product.jsp` / `item.jsp` / `search.jsp` call `cart.do?action=purchase&itemId=...`.

## Overlaps

Pass B records CART-REQ-0001, CART-REQ-0002, CART-BR-0003, CART-SCR-0004 and CART-REQ-0005 restate pass A records CART-BR-0001, CART-BR-0002, CART-SCR-0003 and CART-BR-0004 and are folded into the same requirements. Pass A rates the cart screen high confidence, pass B medium.
