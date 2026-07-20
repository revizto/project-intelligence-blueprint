# Revizto Project Intelligence Blueprint

Live, read-only project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork dashboard. It is **licence-first**: on load it probes every Revizto MCP region you have connected, aggregates the licences your own Revizto account can see into a single picker, and lets you pick a **licence** — never a connector or a region — then lands on your most-recently-active project. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" representative sample. Nothing is cached, assumed or hardcoded — every figure is re-derived live from the MCP on load and on every Refresh.

**Status: v1.0.0-rc.3 — private release candidate (build `2026-07-20.1`).** Production deep-links (`ws.revizto.com`), read-only by default, ships with an empty connector set and a synthetic demo snapshot. Not for public distribution until sign-off.

> **rc.3 — what changed and why it matters for install.** rc.2's first live install failed with a misleading "Connect the Revizto MCP Server" panel *even though the connector was connected*. Root cause: a Cowork artifact has its **own per-artifact tool allowlist** (`mcp_tools`), separate from the connector grant, and it was empty — so every call was refused, and the dashboard mis-reported that as "not connected." rc.3 fixes this two ways: **(1)** the package now ships `.claude-plugin/marketplace.json`, so it installs as a proper plugin — and the install skill's `create_artifact` is what declares the read tools **into the artifact allowlist** (the step that was missing); **(2)** the dashboard now surfaces the allowlist error with an actionable message instead of the "please connect" dead-end. **If you deployed rc.2, install rc.3 as a plugin (below) — do not just clone the folder.**

---

## The one thing to understand first: two separate gates

For the Blueprint to read your data, **both** of these must be open. They are independent:

1. **Connector gate** — the Revizto MCP connector is connected and signed in (Settings → Connectors). This is per-connector.
2. **Artifact tool gate** — the dashboard artifact's own `mcp_tools` allowlist lists the read tools. This is per-artifact, and **connecting the connector does not fill it.** The *only* reliable way to fill it is to create the dashboard through the **install skill inside a Cowork session with this plugin installed** — that create step declares the tools.

Cloning the repo and "selecting the folder", or creating the artifact through the cloud/remote path, opens gate 1 but **not** gate 2 — you'll get the dashboard, but every live call is refused and (in rc.3) it tells you the tools aren't authorised. So: **install as a plugin.**

---

## The six views

`01 Morning brief` · `02 Project checklist` · `03 Cross-project intelligence` · `04 Coordination analytics` · `05 Ask anything` · `06 Action anything` (the plain-language write surface — **disabled in this build**, see [Configuration](#configuration-deploy-time-constants)).

## Repository layout

```
.claude-plugin/plugin.json                          plugin manifest
.claude-plugin/marketplace.json                     one-plugin marketplace (makes it installable)
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
2. **A Revizto licence the MCP Server accepts.** A licence can authenticate and still be refused by the MCP. For live data, two Revizto-side conditions must both hold: the account has **enabled the Revizto MCP Server in the Developer Portal**, and your **licence role is sufficient**. Confirm with your Revizto contact *before* deploying. The Blueprint names which of these is missing (see [Troubleshooting](#troubleshooting)).
3. **Your own Revizto account** with membership of the projects you want to see. The dashboard can only ever show what your Revizto role already allows.
4. **(Claude Team/Enterprise only) Admin network allowlist.** Your Claude admin must allow the Revizto MCP connector domain(s) for each region you connect, plus `cdn.jsdelivr.net` (charts), under Admin settings → Capabilities. A missing entry causes a silent failure — see [Troubleshooting](#troubleshooting).

---

## Install — do this as a plugin

This is the path that opens **both** gates. Follow it in order.

### Step 1 — Connect the Revizto MCP connector(s)

In Claude: **Settings → Connectors** → add the **Revizto MCP** connector for **each region you use** (most customers use one). Sign in with your own Revizto account (OAuth 2.1 PKCE) and approve **read** access. The dashboard holds no credentials — all authentication lives in these connectors. Keep them connected throughout install.

### Step 2 — Add the marketplace and install the plugin

**Desktop plugin browser:** open the plugin browser → **Add marketplace** → `jhowden-revizto/revizto-project-intelligence` → install **revizto-project-intelligence**.

**Or, if the `/plugin` CLI is available:**

```
/plugin marketplace add jhowden-revizto/revizto-project-intelligence
/plugin install revizto-project-intelligence@revizto
/reload-plugins
```

The install detail view should list **3 skills + 1 MCP server**. (Cloning the repo and selecting the folder is for inspecting or editing the code only — it will **not** authorise the artifact's tools, so it can't produce a working live dashboard. Use the plugin path.)

### Step 3 — Create the dashboard through the install skill

In a Cowork session with the plugin installed, say:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

The skill reads the bundled `dashboard.html`, fills `CONFIG.connectors` from your live connector(s), and creates the Cowork artifact (id `revizto-project-intelligence-blueprint`) **declaring the nine read tools** — this is the step that populates the artifact's `mcp_tools` allowlist (gate 2). It ships read-only; it does not declare `update_issues`.

### Step 4 — First run: accept Terms, pick a licence

On first live load the Blueprint presents the **Terms & Conditions** gate — no project data is fetched until you accept (consent precedes access). Acceptance is recorded on-device, **per connection**, with your name and a UTC timestamp; it only re-prompts on a Terms version bump or when you add a new connection. Then the licence picker appears — pick your licence and every view scores against your most-recently-active project on it.

### Verify (60 seconds)

- The status pill reads **live** — not "Snapshot · demo data" (not running in Cowork) and not "Revizto MCP not connected" (a gate is still closed).
- The **licence picker** lists your licence(s), each showing its own region; the masthead badge matches the selected licence's region.
- The project picker shows **your** projects and landed on your most-recently-active one; switching projects re-scores every view.
- **06 Action anything shows disabled with a padlock.** Correct — this build ships read-only.
- Figures reconcile: headline totals are exact; any sampled panel says "sample of N of M" on the card.
- **Negative check (optional):** if a tool isn't authorised for the artifact, rc.3 shows a "tools aren't authorised for this artifact" message that names the fix — **not** a bare "please connect".

---

## MCP Region & Licensing (the connector-id detail)

The install skill (Install Step 3) fills `CONFIG.connectors` for you. This section explains what it writes and how to do it by hand for verification or a manual deployment.

### How the licence-first model works (30-second version)

- Every Revizto **region** (Ireland, USA, Australia, UK, …) is a **separate MCP connection**, each with its own regional URL and OAuth sign-in.
- You add a connection for **each region your organisation uses** — most customers use exactly one.
- Each connection is listed by its **id** in `CONFIG.connectors` (one line each). That is the entire configuration.
- At runtime the Blueprint probes every listed connection, collects every licence your account can see across all of them, and shows **one licence picker** labelled `Licence name — Region`. You pick a licence; it routes to the right connection automatically. With two or more connections a **Connections ⓘ** panel shows per-connection health.

You never map a licence to a region by hand, and you never bake a region into config — the Blueprint derives each licence's region from Revizto live.

### Finding a connector's prefix

Each connection exposes its tools with a unique prefix of the form `mcp__<connector-id>__`. **This prefix is derived from *your* connector's name/id — it is per-user and per-connection, so do not copy the examples below verbatim.** Renaming your connector, or connecting a different region, changes it.

To read it, in the Cowork session (connector connected) ask Claude:

> List the Revizto MCP tool names you can call.

You'll see names like `mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__list_licenses`; the part up to and including the trailing `__` is the prefix. Multiple connected regions show multiple distinct prefixes. The install skill reads these automatically — use this only to verify or to configure by hand.

> ⚠️ **Runtime caveat.** The dashboard executes in the **Cowork artifact runtime**, not the chat session; the prefix the artifact uses is not guaranteed identical to the chat-session prefix, and `.mcp.json` references the connector **by name** (`"Revizto MCP"`) rather than by id. rc.3 makes this a *secondary* concern — the artifact tool allowlist (gate 2) is enforced *before* any prefix is evaluated, so an unauthorised tool fails first and the dashboard now says so. Confirm the exact artifact-runtime prefix form during your first native install and record it here.

### Configure `CONFIG.connectors` by hand (only if not using the skill)

Open `skills/project-intelligence-dashboard/assets/dashboard.html` and find, near the top of the inline script:

```js
const CONFIG={connectors:[
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-20.1"};
```

Add **one entry per connected region**. You only ever set `prefix`; leave the rest at these defaults unless you have a reason:

| Field | Set it to | Notes |
|---|---|---|
| `prefix` | your `mcp__<connector-id>__` (per-install) | the only value that is per-install; don't copy the examples |
| `env` | `"prod"` | `"stage"` only for a staging tenant |
| `wsHost` | `"ws.revizto.com"` | host for "Open in Revizto" deep-links; change only for a non-production tenant |
| `missing` | `[]` | list read tools a region's MCP build lacks (rare); leave empty unless you know a gap |

**Worked example A — single region (the common case):**

```js
const CONFIG={connectors:[
  {prefix:"mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-20.1"};
```

One entry → no extra chrome; the picker just lists that region's licences.

**Worked example B — two regions (e.g. Ireland + Australia):**

```js
const CONFIG={connectors:[
  {prefix:"mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
  {prefix:"mcp__9f8e7d6c-5b4a-3210-fedc-ba9876543210__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-20.1"};
```

Two entries → the picker aggregates licences from both, each labelled with its own region, and a **Connections ⓘ** appears. Add each region's connector domain to the admin allowlist too (prerequisite 4).

> A hand-edited artifact still needs its `mcp_tools` allowlist populated (gate 2) — that comes from the install-skill `create_artifact`, not from editing `CONFIG`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Snapshot · demo data" + fictional "Riverside Medical Centre" / "Hillcrest Aquatic Centre" | Not running inside Cowork | Open as a Cowork artifact created by the install skill (Install Step 3) |
| **"The Blueprint's tools aren't authorised for this artifact yet"** | Gate 2: the artifact's `mcp_tools` allowlist is empty — usually the dashboard was cloned/selected or created via the cloud/remote path, which doesn't declare tools | **Install as a plugin and create the dashboard through the install skill** (Install Steps 2–3). Connecting the connector alone does not authorise the artifact's tools |
| Calm "Revizto MCP not connected" first-run panel | Gate 1: no connector connected, or `CONFIG.connectors` empty and none reachable | Connect the Revizto MCP (Install Step 1); create via the skill so `CONFIG.connectors` is filled |
| "Couldn't load — Reload to retry" on every view | Tool calls failing — a `CONFIG.connectors` prefix doesn't match a tool the artifact can call | Re-create via the install skill (it reads the live prefix and declares the tools); or verify the prefix (Region → Finding a connector's prefix) |
| Licence picker empty / a licence missing | The MCP couldn't read that licence | The Blueprint states the cause: account **hasn't enabled the Revizto MCP in the Developer Portal**, **insufficient licence role**, or the licence is on a **region you haven't connected**. Fix the named cause; add the missing region's connector if that's it |
| "direct API access is forbidden" | The MCP refuses that licence/region outright | Entitlement — contact Revizto; no dashboard-side fix |
| Blank charts, no error, on Team/Enterprise | A region's connector domain or `cdn.jsdelivr.net` not allowlisted | Claude admin: Admin settings → Capabilities → network allowlist (one entry per connected region) |
| A project you expect is missing | Your account isn't a member, or it's on another licence | Fix membership in Revizto; switch licence in the picker |
| "Open in Revizto" links don't resolve | Deep-links point at `ws.revizto.com` (production); your tenant is elsewhere | Expected on non-production tenants; set that connection's `wsHost` in `CONFIG.connectors` |

Every tool call inherits your own Revizto role and project membership — the dashboard cannot see or do anything you can't do in Revizto itself.

---

## Configuration (deploy-time constants)

One `CONFIG` object at the top of the dashboard script:

| Constant | This build | Meaning |
|---|---|---|
| `connectors` | `[]` (skill fills it) | one entry per connected Revizto MCP region: `{prefix, env, wsHost, missing}`. See [MCP Region & Licensing](#mcp-region--licensing-the-connector-id-detail). |
| `readOnly` | `true` | the 06 Action write surface is disabled AND the header Read-only pill is locked. Enabling writes is a deploy-time decision: set `readOnly:false` AND declare `update_issues` on the artifact. |
| `tcsVersion` | `"1.0"` | Terms & Conditions version. Bumping it re-prompts acceptance on every connection. |
| `buildStamp` | `"2026-07-20.1"` | shown in About and the Terms footer for support/traceability. |

> `CONFIG.server` and `CONFIG.wsHost` still exist as **legacy mirrors** of the currently-selected connection, retargeted automatically on switch. Configure `CONFIG.connectors`, not these.

---

## Trust posture (the product is the trust)

- **Count-first exact layer.** Headline totals come from exact counts; anything sampled is labelled "sample of N of M" on the card itself.
- **Live, never cached.** Cache-busted reads, per-call timeouts, honest failure states, full state reset on every licence/project/connection switch. Loaders are sequence-guarded, so no stale response from a prior selection repopulates state after a switch.
- **Read-only by default, in two independent layers.** Inner: `CONFIG.readOnly:true` disables the write surface and locks the header pill (re-asserted at every open and on re-show). Outer: the artifact's declared `mcp_tools` allowlist — this build declares only the nine read tools per connector, so even a tampered page cannot write; the Cowork host refuses any undeclared tool. (This same allowlist is gate 2 above — it's the security boundary, which is why it is strict by default.) Enabling writes means deliberately changing both. When enabled, every write is count-first-targeted, previewed with a diff and sample, approval-gated (name + reason required), audit-noted and reversible; staged jobs are connection-stamped and never resume on a different connection.
- **Your session, your permissions.** All calls run through the user's own authenticated MCP session. No escalation; `whoami` is not in the allowlist.
- **Consent precedes access.** No live data is fetched until Terms are accepted; acceptance is recorded on-device per connection.
- **AI answers** (05 Ask) send only the derived figures needed for the question to the model; project data is not stored server-side.

Tool allowlist (per connected connector prefix): `list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates, list_license_members, list_project_members, list_workflows, list_issues` (+ `update_issues`, gated as above).

## Demo mode

Opened outside Cowork (no `window.cowork`), the dashboard renders a clearly-labelled synthetic snapshot (two sample projects — "Riverside Medical Centre" and "Hillcrest Aquatic Centre" — fictional people on `@example.com`). No customer data, no Revizto staff, no real project identifiers. A leave-behind brochure, not intelligence.

## Runtime dependencies

- Claude desktop with Cowork (provides `callMcpTool` / `askClaude`).
- The Revizto MCP connector for each region you use, with read access approved.
- Team/Enterprise admin network allowlist: each region's Revizto MCP connector domain(s) + `cdn.jsdelivr.net` (Chart.js). Fonts are embedded — no font CDN.

## Known open items

- **Native allowlist declaration (being verified by first-user testing).** rc.3 ships `marketplace.json` so the install-skill `create_artifact` path can declare the nine read tools into the artifact's `mcp_tools` allowlist. Confirm on the current desktop build that a plugin-install + skill-run install actually populates the allowlist (the dashboard should reach the licence picker within one Refresh). If it still shows "tools aren't authorised for this artifact" after a proper plugin install, the create path isn't declaring tools on that build — capture it as a Revizto platform issue.
- **By-name connector resolution / artifact-runtime prefix.** `.mcp.json` references the connector by name; the dashboard routes by `mcp__<id>__` prefix, which is per-user. Record the exact artifact-runtime prefix form during the first native install. Secondary to the allowlist (gate 2 fails first).
- **Terms & Conditions URL.** The in-text link to the canonical Revizto MCP Server Terms is a **placeholder** pending the final URL; publishing it will bump `tcsVersion` (re-prompting acceptance on every connection).

## Licence

Copyright © 2026 Revizto SA. All rights reserved. Private repository — not for redistribution.
