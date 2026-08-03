# Contributing

## Development

```bash
cp .env.example .env
npm ci
npm run ci
```

## Pull request checklist

1. Keep TypeScript strict and add tests for new validation or authentication behavior.
2. Run `npm run ci` and `npm audit --omit=dev`.
3. Keep examples synthetic; never add real travel plans, credentials or session data.
4. Document every new environment variable in `.env.example` and `README.md`.
5. Preserve the separation between the storage interface and its implementation.
6. Do not add a map until suggestions contain real, deterministic coordinates.

Security vulnerabilities must follow [`SECURITY.md`](SECURITY.md), not a public
issue.
