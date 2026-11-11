# Changelog

All notable changes to the RomaTech ORM test app are documented in this file.
The app is private (not published to npm).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.1.0] - 2026-11-11

### Security
- Mass assignment: `PUT /users/:id` and `PUT /products/:id` copied the whole request body onto the entity (`Object.assign`), so a client could change the `id`; only the editable fields are copied now.
- `POST`/`PUT` validate every field before touching the entity: names and e-mails must be non-empty strings, `price` a finite number >= 0, `age`/`stock` whole numbers >= 0. Values such as `"abc"`, `-1` or objects were stored as `NaN` or `"[object Object]"`; they now get 400.
- The 500 handler no longer returns internal error messages to clients (they are logged).
- The container runs as the `node` user instead of root.

### Fixed
- Each `AppDbContext` created its own `MemoryProvider`, so the controllers never saw the seeded data (`GET /users` returned `[]`). One provider is shared by the process.
- `GET /products/search` was captured by `/products/:id` (400 "Invalid id"); the route is declared first.
- `POST` without `id` created a record without id, and duplicate ids were accepted; the id is generated when missing and a duplicate gets 409.
- Dockerfile: `npm ci` failed in the image because `.npmrc` (`legacy-peer-deps`, needed while `@romatech/orm-providers-memory@2.0.0` declares a `^1.2.0` peer of the core) was not copied; the runtime image also lacked `src/`, so the OpenAPI document would be empty. Both are copied now; Node 22 (Node 20 is end-of-life).
- `package-lock.json` re-synced with `package.json`; `npm audit --omit=dev` reports the remaining advisories of `@romatech/swagger@2.0.0` only.

### Changed
- `npm test` builds first (`pretest`) and includes a test that starts the real `dist/server.js`; it is reported as TODO while the installed `@romatech/swagger` is 2.0.0 (see the README).
- `engines.node` is `>=20`; `.nvmrc` is 22.

### Known issues
- The app needs `@romatech/swagger` 3.0.0 (not yet published) to start. Verified locally with a package built from the 3.0.0 release branch: all 6 tests pass, including the real server.
- `@romatech/swagger` does not document the decorator-based controllers, so the MCP endpoint exposes only `rag_search`.
- `/mcp` and the write endpoints have no authentication or rate limit (demo app).
