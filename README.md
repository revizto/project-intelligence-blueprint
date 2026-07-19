# Revizto Project Intelligence Blueprint

Live, read-only project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork dashboard. It is **licence-first**: on load it probes every Revizto MCP region you have connected, aggregates the licences your own Revizto account can see into a single picker, and lets you pick a **licence** — never a connector or a region — then lands on your most-recently-active project. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" representative sample. Nothing is cached, assumed or hardcoded — every figure is re-derived live from the MCP on load and on every Refresh.

**Status: v1.0.0-rc.2 — private release candidate (build `2026-07-17.9`).** Production deep-links (`ws.revizto.com`), read-only by default, ships with an empty connector set and a synthetic demo snapshot. Not for public distribution until sign-off.

> **New in rc.2 (was the "unreleased" work after rc.1):** the connector model changed. rc.1 used a single `CONFIG.server` prefix that the installer rewrote. rc.2 is **licence-first / connector-agnostic**: you list one entry per connected region in `CONFIG.connectors`, and the Blueprint routes each licence to the connection that serves it automatically. If you deployed rc.1, re-read [MCP Region & Licensing](#mcp-region--licensing-setup-read-this-first) — the setup step is different.

---

## The six views

`01 Morning brief` · `02 Project checklist` · `03 Cross-project intelligence` · `04 Coordination analytics` · `05 Ask anything` · `06 Action anything` (the plain-language write surface — **disabled in this build**, see [Configuration](#configuration-deploy-time-constants)).

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

---

## Before you start (prerequisites)

1. **Claude desktop app with Cowork.** The dashboard runs as a Cowork artifact — it does **not** work in a plain Claude chat or on claude.ai. Opened outside Cowork it shows a clearly-labelled synthetic demo, not your data.
2. **A Revizto licence the MCP Server accepts.** A licence can authenticate successfully and still be refused by the MCP. For a licence to return live data, two Revizto-side conditions must both be true: the account has **enabled the Revizto MCP Server in the Developer Portal**, and your **licence role is sufficient**. Confirm this with your Revizto contact *before* deploying. This is entitlement, not a bug in the dashboard — and the Blueprint tells you which of these is missing (see [Troubleshooting](#troubleshooting)).
3. **Your own Revizto account** with membership of the projects you want to see. The dashboard can only ever show what your Revizto role already allows.
4. **(Claude Team/Enterprise only) Admin network allowlist.** Your Claude admin must allow the Revizto MCP connector domain(s) for each region you connect, plus `cdn.jsdelivr.net` (charts library), under Admin settings → Capabilities. If this is missed the dashboard fails silently — see [Troubleshooting](#troubleshooting).

---

## MCP Region & Licensing setup (read this first)

This is the one part of deployment that needs a human decision, so it is spelled out end to end. It is short.

### How the licence-first model works (30-second version)

- Every Revizto **region** (Ireland, USA, Australia, UK, …) is a **separate MCP connection**, each with its own regional URL and its own OAuth sign-in.
- You add a connection for **each region your organisation uses** — most customers use exactly one.
- You then list each connection's **id** in `CONFIG.connectors` (one line each). That is the entire configuration.
- At runtime the Blueprint probes every listed connection, collects every licence your account can see across all of them, and shows **one licence picker** labelled `Licence name — Region`. You pick a licence; it routes to the right connection for you. The masthead shows that licence's own region as a badge. With two or more connections a **Connections ⓘ** panel shows per-connection health.

You never map a licence to a region by hand, and you never bake a region into config — the Blueprint derives each licence's region from Revizto live.

### Step 1 — Add the Revizto MCP connector(s)

In Claude: **Settings → Connectors** (or the connector directory) → add the **Revizto MCP** connector for **each region you use**. When prompted, sign in with your own Revizto account (OAuth 2.1 PKCE) and approve **read** access. The dashboard holds no credentials, tokens or URLs — all authentication lives in these connectors.

Regional server URLs are listed in Revizto's MCP help article; add one connection per region. If your whole organisation is on one region, you add exactly one.

### Step 2 — Find each connector's prefix

Each connection exposes its tools with a unique prefix of the form `mcp__<connector-id>__`. You need that prefix for Step 3.

**Reliable method (works today):** in the Cowork session with the connector(s) connected, ask Claude:

> List the Revizto MCP tool names you can call.

Claude will show tool names such as `mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__list_licenses`. The part up to and including the trailing double-underscore is the prefix:

```
mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__
```

If you connected more than one region, you will see more than one distinct prefix — note them all. (The install skill in Step 4 does this same read for you automatically; this manual method is here so you can verify or configure by hand.)

> ⚠️ **Open item — needs Revizto/packaging confirmation.** `.mcp.json` references the connector **by name** (`"Revizto MCP"`), while the dashboard routes by the `mcp__<id>__` prefix. How `callMcpTool` resolves a by-name server in plugin context (name-based prefix vs host-resolved id) is not yet confirmed. Until it is, configure `CONFIG.connectors` with the real per-install prefix as above. This is the single packaging unknown — flag it if a connection that is clearly connected still won't resolve.

### Step 3 — List each connection in `CONFIG.connectors`

Open `skills/project-intelligence-dashboard/assets/dashboard.html` and find, near the top of the inline script:

```js
const CONFIG={connectors:[
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-17.9"};
```

Add **one entry per connected region**. You only ever set `prefix`; leave the rest at these defaults unless you have a specific reason:

| Field | Set it to | Notes |
|---|---|---|
| `prefix` | your `mcp__<connector-id>__` from Step 2 | the only value that is per-install |
| `env` | `"prod"` | `"stage"` only for a staging tenant |
| `wsHost` | `"ws.revizto.com"` | host for "Open in Revizto" deep-links; change only for a non-production tenant |
| `missing` | `[]` | list read tools a region's MCP build lacks (rare); leave empty unless you know a gap |

**Worked example A — single region (the common case):**

```js
const CONFIG={connectors:[
  {prefix:"mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-17.9"};
```

One entry → no extra chrome. The Blueprint behaves exactly like a classic single-region build; the licence picker just lists the licences on that region.

**Worked example B — two regions (e.g. Ireland + Australia):**

```js
const CONFIG={connectors:[
  {prefix:"mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
  {prefix:"mcp__9f8e7d6c-5b4a-3210-fedc-ba9876543210__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-17.9"};
```

Two entries → the picker aggregates licences from both, each labelled with its own region, and a **Connections ⓘ** appears. Adding a third region later is one more line — no code change.

> Add each region's connector domain to the admin allowlist too (prerequisite 4).

### Step 4 — Let the install skill do Steps 2–3 for you (recommended)

Rather than editing by hand, in Cowork say:

> Open the Revizto Project Intelligence Blueprint — follow `skills/project-intelligence-dashboard/SKILL.md`

Claude will confirm the connector(s) are connected, read the real prefix(es) from the session, populate `CONFIG.connectors`, and create the Cowork artifact (id `revizto-project-intelligence-blueprint`) declaring only the nine read tools for each connected prefix. Use the manual Steps 2–3 to verify or when configuring outside a Cowork install.

### Step 5 — First run: accept Terms, pick a licence

On first live load the Blueprint presents the **Terms & Conditions** gate — no project data is fetched until you accept (consent precedes access). Acceptance is recorded on-device, **per connection**, with your name and a UTC timestamp; it only re-prompts on a Terms version bump or when you add a new connection. Then the licence picker appears — pick your licence and the dashboard scores every view against your most-recently-active project on it.

---

## Getting started — quick path

1. **Connect** the Revizto MCP connector(s) for your region(s), sign in, approve read access (Region & Licensing Step 1).
2. **Get** this package: install it as a plugin, or `git clone <this-repo-url>` and select the folder as your Cowork working folder.
3. **Create** the dashboard — say: *"Open the Revizto Project Intelligence Blueprint — follow `skills/project-intelligence-dashboard/SKILL.md`"*. The skill fills in `CONFIG.connectors` from your live connectors and opens the artifact.
4. **Accept** the Terms, **pick** your licence.
5. **Verify** (below).

### Verify (60 seconds)

- The status pill reads **live**, not "Snapshot · demo data" (demo = no connector reachable) and not "Revizto MCP not connected" (setup incomplete).
- The **licence picker** lists your licence(s), each showing its own region; the masthead badge matches the selected licence's region.
- The project picker shows **your** projects and landed on your most-recently-active one; switching projects re-scores every view.
- **06 Action anything shows disabled with a padlock.** Correct — this build ships read-only by design.
- Figures reconcile: headline totals are exact; any sampled panel says "sample of N of M" on the card.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Snapshot · demo data" + fictional "Riverside Medical Centre" / "Hillcrest Aquatic Centre" | Not running inside Cowork | Open as a Cowork artifact (quick-path Step 3) |
| Calm "Revizto MCP not connected" first-run panel | No connector connected, or `CONFIG.connectors` is empty | Connect the Revizto MCP (Region Step 1); populate `CONFIG.connectors` (Region Step 3, or re-run the install skill) |
| Loads, then "Couldn't load — Reload to retry" on every view | Tool calls failing: usually a `CONFIG.connectors` prefix doesn't match a connected connector | Re-check the prefix (Region Step 2) or re-run the install skill; confirm the nine read tools were declared for that connector prefix on the artifact |
| Licence picker is empty / a licence is missing | The MCP couldn't read that licence | The Blueprint states the actual cause: account **hasn't enabled the Revizto MCP in the Developer Portal**, **insufficient licence role**, or the licence is on a **region you haven't connected**. Fix the named cause; add the missing region's connector if that's it |
| "direct API access is forbidden" | The MCP refuses that licence/region outright | Entitlement issue — contact Revizto; no dashboard-side fix |
| Blank charts, no error, on Team/Enterprise | A region's connector domain or `cdn.jsdelivr.net` not allowlisted | Claude admin: Admin settings → Capabilities → network allowlist (one entry per connected region) |
| A project you expect is missing | Your Revizto account isn't a member of it, or it's on another licence | Fix membership in Revizto; switch licence in the picker |
| "Open in Revizto" links don't resolve | Deep-links point at `ws.revizto.com` (production); your tenant is elsewhere | Expected on non-production tenants; set that connection's `wsHost` in `CONFIG.connectors` |

Every tool call inherits your own Revizto role and project membership — the dashboard cannot see or do anything you can't do in Revizto itself.

---

## Configuration (deploy-time constants)

One `CONFIG` object at the top of the dashboard script:

| Constant | This build | Meaning |
|---|---|---|
| `connectors` | `[]` (you fill it in) | one entry per connected Revizto MCP region: `{prefix, env, wsHost, missing}`. See [Region & Licensing Step 3](#step-3--list-each-connection-in-configconnectors). This replaces rc.1's single `server` prefix. |
| `readOnly` | `true` | the 06 Action write surface is disabled AND the header Read-only pill is locked (checked, immutable, with an explainer tooltip). Enabling writes is a deploy-time decision: set `readOnly:false` and declare `update_issues` on the artifact. In write-enabled builds the pill becomes a live toggle. |
| `tcsVersion` | `"1.0"` | Terms & Conditions version. Bumping it re-prompts acceptance on every connection. |
| `buildStamp` | `"2026-07-17.9"` | shown in About and the Terms footer for support/traceability. |

> `CONFIG.server` and `CONFIG.wsHost` still exist as **legacy mirrors** of the *currently-selected* connection, so older code paths keep working; they are retargeted automatically when you switch licence/connection. Do not configure them directly — configure `CONFIG.connectors`.

---

## Trust posture (the product is the trust)

- **Count-first exact layer.** Headline totals come from exact counts; anything sampled is labelled "sample of N of M" on the card itself.
- **Live, never cached.** Cache-busted reads, per-call timeouts, honest failure states ("Couldn't load — Reload to retry"), full state reset on every licence/project/connection switch. Loaders are sequence-guarded, so no stale response from a prior selection can repopulate state after a switch.
- **Read-only by default, in two independent layers.** The inner layer is `CONFIG.readOnly:true`, which disables the write surface and locks the header pill (re-asserted at every open and on re-show). The outer layer is the artifact's declared tool list — this build declares only the nine read tools per connector, so even a tampered page cannot write: the Cowork host refuses any undeclared tool. Enabling writes per engagement means deliberately changing both (set `readOnly:false`, declare `update_issues`). When enabled, every write is count-first-targeted, previewed with a diff and sample, approval-gated (name + reason required), audit-noted and reversible; staged jobs are connection-stamped and never resume on a different connection.
- **Your session, your permissions.** All calls run through the user's own authenticated MCP session. No escalation is possible; `whoami` is not in the allowlist.
- **Consent precedes access.** No live project data is fetched until Terms are accepted; acceptance is recorded on-device per connection.
- **AI answers** (05 Ask) send only the derived figures needed for the question to the model; project data is not stored server-side.

Tool allowlist (per connected connector prefix): `list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates, list_license_members, list_project_members, list_workflows, list_issues` (+ `update_issues`, gated as above).

## Demo mode

Opened outside Cowork (no `window.cowork`), the dashboard renders a clearly-labelled synthetic snapshot (two sample projects — "Riverside Medical Centre" and "Hillcrest Aquatic Centre" — with fictional people on `@example.com`). It contains no customer data, no Revizto staff, and no real project identifiers. Useful as a leave-behind; it is a brochure, not intelligence.

## Runtime dependencies

- Claude desktop with Cowork (provides `callMcpTool` / `askClaude`).
- The Revizto MCP connector for each region you use, with read access approved.
- Team/Enterprise admin network allowlist: each region's Revizto MCP connector domain(s) + `cdn.jsdelivr.net` (Chart.js). Fonts are embedded — no font CDN.

## Known open items

- **By-name connector resolution.** See the flagged open item under [Region & Licensing Step 2](#step-2--find-each-connectors-prefix). `.mcp.json` references the connector by name; the dashboard routes by `mcp__<id>__` prefix. Until by-name resolution in plugin context is confirmed, configure `CONFIG.connectors` with the real per-install prefix.
- **Terms & Conditions URL.** The in-text link to the canonical Revizto MCP Server Terms is a **placeholder** pending the final URL. Publishing it will come with a `tcsVersion` bump (which re-prompts acceptance on every connection).

## Licence

Copyright © 2026 Revizto SA. All rights reserved. Private repository — not for redistribution.
