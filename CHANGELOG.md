# Changelog

## 1.0.0-rc.1 — 2026-07-06 (WS10 package)

First packaged release candidate, from the WS1–WS9 showcase build (feature-complete, QA/QC'd 2026-07-05: F1 persona narratives live-derived, F2 sharing cadence on publish date, F3 90-day-flow loading state, view titles aligned).

- `CONFIG` flipped for release: `wsHost` → `ws.revizto.com` (production deep-links), `readOnly` → `true` (write surface off by default).
- Snapshot fallback fully scrubbed: synthetic demo project ("Riverside Medical Centre — demo"), fictional people on `@example.com`, no staff emails, no stage licence/project identifiers; AI context region derived from live metadata instead of a literal.
- Bundled curated skills: `skill-aeco-innovation-revizto`, `skill-aeco-innovation-revizto-api`.
- Plugin scaffold refreshed from the 2026-06 stage dry-run (`.mcp.json` by-name production entry; manifest, connectors and README rewritten for release posture).

Known open item: by-name connector-prefix resolution for `CONFIG.server` in plugin context (see README).
