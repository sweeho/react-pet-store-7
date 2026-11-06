## 1. Notification triggers
- [ ] 1.1 Send order-status e-mail on approval or denial, gated by its switch
- [ ] 1.2 Send shipment e-mail per supplier invoice, gated by its switch
- [ ] 1.3 Send completed-order e-mail when an order becomes COMPLETED, gated by its switch
- [ ] 1.4 Read the three switches from configuration by name

## 2. E-mail content
- [ ] 2.1 Build locale templates for en_US, ja_JP, zh_CN and the default
- [ ] 2.2 Implement approved/denied wording and English subjects
- [ ] 2.3 Define behaviour for an unsupported locale
- [ ] 2.4 Render shipment and completed line tables 

## 3. Delivery
- [ ] 3.1 Hand each e-mail to the mail service as recipient, subject and HTML body
- [ ] 3.2 Implement the asynchronous message hand-off with failure reporting

## 4. Resource lookup
- [ ] 4.1 Resolve named resources with a single wrapped error type
- [ ] 4.2 Decide caching rules for resources versus configuration entries
