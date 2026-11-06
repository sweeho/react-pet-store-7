# Design notes: legacy implementation of order notifications

## User interface

No screen records were extracted for this capability; its user interface is unspecified. E-mail bodies are the only customer-visible output and are covered as requirements.

## Legacy implementation

- Order status: `MailOrderApprovalMDB` (queue `jms/opc/MailOrderApprovalQueue`), switch env-entry `param/SendApprovalMail`, stylesheet `OrderApproval_<locale>.xsl`.
- Shipment: `MailInvoiceMDB` subscribes to topic `jms/opc/InvoiceTopic` independently of `InvoiceMDB`; switch `param/SendConfirmationMail`; `PartialInvoice_<locale>.xsl`. It cannot tell whether an order is complete, so the final shipment yields both a shipment e-mail and a completed e-mail.
- Completed: `MailCompletedOrderMDB` (queue `jms/opc/MailCompletedOrderQueue`, fed by InvoiceTD), switch `param/SendCompletedOrderMail`; locale taken from `PurchaseOrder.getLocale()`, other MDBs use `LocaleUtil`.
- Hand-off: transition delegates send `Mail.toXML()` to `jms/opc/MailQueue`, consumed by `MailerMDB` (outside this shard).
- Locale: `MailContentXDE.getStyleSheetPath` appends `_<locale>`; missing resource throws `FormatterException`, rethrown as `EJBException`, so the message rolls back and is redelivered. `LocaleUtil` returns null for strings without `_` and mis-parses variants.
- Switch default values are redacted in `ejb-jar.xml` and cannot be read.
- Async sender: `AsyncSenderEJB.sendAMessage`, transaction Required, unchecked permission; caller of it is not seen in the module, so its tie to order e-mails is inferred.
- Service locator: web variant is a static singleton with a synchronized-map cache (not for URL/boolean/string entries); EJB variant has no cache. Filed under both checkout and order-notifications as closest fit.
- Suspected defects: unsupported locale blocks the whole approval batch; zh_CN templates show dollar prices; web locator singleton failure only printed; `getBoolean` NPE on null; async sender swallows close errors.
