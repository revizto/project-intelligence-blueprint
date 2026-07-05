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

## Getting started — exact steps

### Before you start (prerequisites)

1. **Claude desktop app with Cowork.** The dashboard runs as a Cowork artifact — it does not work in a plain Claude chat or on claude.ai. Opened outside Cowork it shows a clearly-labelled synthetic demo, not your data.
2. **A Revizto licence the MCP Server accepts.** Confirm with your Revizto contact that the Revizto MCP is available for your licence and region *before* installing. A licence can authenticate successfully and still be refused by the MCP ("direct API access is forbidden") — this is a Revizto-side entitlement, not a bug in the dashboard.
3. **Your own Revizto account** with membership of the projects you want to see. The dashboard can only ever show what your Revizto role already allows.
4. **(Claude Team/Enterprise only) Admin network allowlist.** Your Claude admin must allow the Revizto MCP connector domain(s) and `cdn.jsdelivr.net` (charts library) under Admin settings → Capabilities. If this is missed the dashboard fails silently — see Troubleshooting.

### Step 1 — Connect the Revizto MCP

1. In Claude, add the **Revizto MCP** connector for your region (Settings → Connectors, or via the connector directory).
2. When prompted, sign in with your own Revizto account (OAuth 2.1 PKCE). The dashboard itself holds no credentials, tokens or URLs — all authentication lives in this connector.
3. Approve **read** access to the tools when asked.

### Step 2 — Get this package

Either install it as a plugin (when distributed as one), or clone this repository and open the folder in a Cowork session:

```
git clone <this-repo-url>
```

In Cowork, select the cloned folder as your working folder so Claude can read the files.

### Step 3 — Create the dashboard

Say to Claude in Cowork:

> Open the Revizto dashboard — follow skills/project-intelligence-dashboard/SKILL.md

Claude will then, per that skill: confirm the connector is connected, **detect your connector's tool prefix and rewrite `CONFIG.server` in the dashboard HTML to match** (the prefix is unique per install — this step is required, not optional), and create the Cowork artifact declaring only the nine read tools.

### Step 4 — Verify (60 seconds)

- The source line (top right) reads **live**, not "Snapshot · demo data". Snapshot means no connector was reachable.
- The project picker shows **your** projects, and the dashboard landed on your most-recently-active one.
- Switching projects re-scores every view.
- **06 Action anything shows disabled with a padlock.** Correct — this build ships read-only by design.
- Figures reconcile: headline totals are exact; any sampled panel says "sample of N of M" on the card.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Snapshot · demo data" + fictional "Riverside Medical Centre" | Not running inside Cowork, or the connector isn't connected | Open as a Cowork artifact (Step 3); connect the Revizto MCP (Step 1) |
| Loads, then "Couldn't load — Reload to retry" on every view | Tool calls failing: usually the `CONFIG.server` prefix doesn't match your connector | Re-run Step 3 so the install skill rewrites the prefix; confirm the nine read tools were declared on the artifact |
| "This licence isn't accessible via the MCP Server" | The MCP refuses your licence/region ("direct API access is forbidden") | Entitlement issue — contact Revizto; no dashboard-side fix |
| Blank charts, no error, on Team/Enterprise | `cdn.jsdelivr.net` or the connector domain not allowlisted | Claude admin: Admin settings → Capabilities → network allowlist |
| A project you expect is missing | Your Revizto account isn't a member of it, or it's on another licence | Fix membership in Revizto; switch licence in the dashboard header |
| "Open in Revizto" links don't resolve | Deep-links point at `ws.revizto.com` (production); your tenant is elsewhere | Expected on non-production tenants; edit `CONFIG.wsHost` for your environment |

Every tool call inherits your own Revizto role and project membership — the dashboard cannot see or do anything you can't do in Revizto itself.

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
