# Order notifications

## Why

Recover the customer e-mail behaviour of the legacy Java Pet Store order pipeline (order status, shipment, order completed), the asynchronous message hand-off it relies on, and the resource-lookup helper it shares with checkout.

## What changes

- Specify three customer e-mails, each gated by its own configuration switch.
- Specify locale-specific rendering, wording, subjects and the missing-locale failure.
- Specify the hand-off of every e-mail to a separate mail service, and the async-send service.
- Specify named-resource lookup, caching and error wrapping (draft; overlaps checkout).

## Impact

Capability `order-notifications`. No screens were extracted.
