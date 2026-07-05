# Revizto Project Intelligence

Live, read-only project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork dashboard. On install it discovers the connected user's own Revizto licence and most-recently-active project — no IDs to enter, no configuration file. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" representative sample. Nothing is cached, assumed or hardcoded — every figure is re-derived live from the MCP on load and on every Refresh.

**Status: v1.0.0-rc.1 — private release candidate.** Production deep-links (`ws.revizto.com`), read-only by default, synthetic demo snapshot. Not for public distribution until sign-off.

## The six views

01 Morning brief · 02 Project checklist · 03 Cross-project intelligence · 04 Coordination analytics · 05 Ask anything · 06 Action anything (the write surface — disabled in this build, see Configuration).

## Repository layout

```
.claude-plugin/plugin.json                          plugin manifest
.mcp.json                                           Revizto MCP connector reference (by name)
skills/
  project-intelligence-dashboard/                   install action + the dashboard artifact
    SKILL.md
    assets/dashboard.html                           the self-contained dashboard (single file)
  skill-aeco-innovation-revizto/                    Revizto platform knowledge (curated copy)
  skill-aeco-innovation-revizto-api/                Revizto API / MCP / integration patterns (curated copy)
CONNECTORS.md                                       connector + admin allowlist notes
SKILLS-MANIFEST.md                                  what ships, what never ships
CHANGELOG.md
```

## Install

1. Connect the **Revizto MCP** connector for your region in Claude (OAuth 2.1 PKCE — you sign in with your own Revizto account; the dashboard holds no credentials).
2. Install this plugin. The `project-intelligence-dashboard` skill creates the dashboard as a Cowork artifact on first run, or on "open the Revizto dashboard".
3. The dashboard discovers your licence and lands on your most-recently-active project. Every tool call inherits your own Revizto role and project membership — it cannot see or do anything you can't.

## Configuration (deploy-time constants)

One `CONFIG` object at the top of the dashboard script:

| Constant | This build | Meaning |
|---|---|---|
| `server` | per-install connector prefix | the MCP tool-name prefix (see Known open item) |
| `readOnly` | `true` | the 06 Action write surface is disabled; enabling it is a deliberate deploy-time edit, not a runtime toggle |
| `wsHost` | `ws.revizto.com` | host for issue deep-links into the Revizto workspace |

## Trust posture (the product is the trust)

- **Count-first exact layer.** Headline totals come from exact counts; anything sampled is labelled "sample of N of M" on the card itself.
- **Live, never cached.** Cache-busted reads, per-call timeouts, honest failure states ("Couldn't load — Reload to retry"), full state reset on every licence/project switch.
- **Read-only by default.** The tool allowlist is nine read tools plus `update_issues`; with `readOnly:true` the write path is inert. When enabled per engagement, every write is count-first-targeted, previewed with a diff, approval-gated and reversible.
- **Your session, your permissions.** All calls run through the user's own authenticated MCP session. No escalation is possible.
- **AI answers** (05 Ask) send only the derived figures needed for the question to the model; project data is not stored server-side.

Tool allowlist: `list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates, list_license_members, list_project_members, list_workflows, list_issues` (+ `update_issues`, gated as above).

## Demo mode

Opened outside Cowork (no `window.cowork`), the dashboard renders a clearly-labelled synthetic snapshot ("Riverside Medical Centre — demo", fictional people on `@example.com`). It contains no customer data, no Revizto staff, and no real project identifiers. Useful as a leave-behind; it is a brochure, not intelligence.

## Runtime dependencies

- Claude desktop with Cowork (provides `callMcpTool` / `askClaude`).
- The Revizto MCP connector for the user's region, with read access approved.
- Team/Enterprise admin network allowlist: the Revizto MCP connector domain(s) + `cdn.jsdelivr.net` (Chart.js). Fonts are embedded — no font CDN.

## Known open item

`CONFIG.server` carries an `mcp__<connector-id>__` prefix that is assigned per install. `.mcp.json` references the connector **by name**; how `callMcpTool` resolves a by-name server in plugin context (name-based prefix vs host-resolved id) is unconfirmed. Until confirmed, the install skill reconciles `CONFIG.server` against the installer's actual connector prefix. This is the one packaging engineering unknown.

## Licence

Copyright © 2026 Revizto SA. All rights reserved. Private repository — not for redistribution.
