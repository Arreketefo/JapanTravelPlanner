# Security policy

## Supported versions

Security fixes are applied to the current default branch and latest tagged
release.

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials, session
cookies, personal itineraries, booking references or expense data.

Use GitHub's **Security → Report a vulnerability** flow when available. If
private vulnerability reporting is not enabled, contact the maintainer through
the GitHub profile and share only enough information to establish a private
reporting channel.

Please include the affected commit, a reproduction using synthetic data, the
likely impact and any mitigation already tested.

## Deployment requirements

- Set unique `APP_USERNAME`, `APP_PASSWORD` and `SESSION_SECRET` values.
- Use HTTPS so secure session cookies are enforced.
- Do not use the local fallback credentials in production.
- Treat the in-memory store as ephemeral and unsuitable for sensitive data.
- Run `npm audit --omit=dev` before deployment.
