# Proposal: sign-on

## Why

The legacy Java Pet Store gates the storefront account and checkout screens, and the supplier inventory application, behind a user name and password. The rebuild must keep these rules, including the quirks recorded as findings.

## What changes

- Specify credential storage, authentication and session outcome.
- Specify protected-resource gating, remember-user-name, sign-out and idle timeouts.
- Specify the storefront sign-in screen, storefront header and supplier sign-in screen.

## Impact

Extracted from legacy-source; no target-system change is proposed here. Plain-text passwords, pre-filled sample credentials and unchecked roles are recorded as legacy behaviour for the Business Owner to decide on.
