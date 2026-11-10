# Frontend Fixes and Verification Notes

## Changes made

- Fixed product catalog query-state synchronization: missing `search`, `brand`, `sort`, and `filter` query parameters now reset their corresponding state instead of retaining stale values.
- Catalog URL updates now include the bestseller filter and replace the previous query state so removed filters do not linger in the URL.
- Added an `/orders` page and route so the footer Orders link no longer falls through to the home route.
- Added a distinct `/checkout` page instead of rendering the cart page at that URL.
- Removed simulated checkout success and cart clearing. The checkout placeholder clearly says no order or payment was created and preserves the cart.
- Replaced the stale starter-template app test with assertions for the actual app shell (`router-outlet` and cart-toast host).
- Removed persistence of registered passwords to localStorage and added cleanup of the legacy `yourstore_registered_users` key.
- Removed fake token strings from demo users. Demo registration now keeps credentials in memory only for the current page session.

## Important limitations

- Authentication remains a frontend demo, not secure production authentication. Browser-side state and route guards can be modified by a user. A backend auth API must validate credentials, issue real sessions/tokens, and enforce permissions before real customer accounts or protected data are used.
- Checkout and payments are intentionally placeholders until a backend order API and payment gateway are integrated. No fake order success is shown and cart contents are not cleared.
- Static relative-import and local-image-path validation passed.
- `npm ci` did not finish in this environment before the execution timeout, so Angular production build, unit tests, and browser end-to-end flows could not be verified here. Run the commands below in an environment with working npm registry access.

## Verification commands

```bash
npm ci
npm run build
npm test
```

After those pass, manually verify the home page, product search and filters, product detail, login/register demo flow, cart persistence, checkout placeholder, and Orders page at desktop and mobile widths.
