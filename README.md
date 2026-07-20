# Revizto Project Intelligence Blueprint

Live, read-only project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork dashboard. It is **licence-first**: on load it probes every Revizto MCP region you have connected, aggregates the licences your own Revizto account can see into a single picker, and lets you pick a **licence** — never a connector or a region — then lands on your most-recently-active project. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" representative sample. Nothing is cached, assumed or hardcoded — every figure is re-derived live from the MCP on load and on every Refresh.

**Status: v1.0.0-rc.9 — private release candidate (build `2026-07-20.1`).** Public repo (required for the desktop install path), production deep-links (`ws.revizto.com`), **opens read-only every session with a user-controlled write toggle**, ships with an empty connector set and a synthetic demo snapshot. Not for public distribution until sign-off.

> **rc.9 — the Read-only pill is now a working toggle, and writes are enabled behind it.** rc.8 hard-locked the pill on. rc.9 sets `CONFIG.readOnly:false` so the pill is a **live per-session toggle**, and the install declares `update_issues` so that when a user switches read-only **off**, real changes to Revizto can be made — every one of them still governed by the full count-first + name/reason + preview + confirm **approval pipeline** (unchanged). Safety defaults are deliberate: the Blueprint **opens read-only every session** and **re-asserts read-only whenever the artifact is reopened/re-shown**; turning writes on is an explicit, per-session action.

> **rc.8 — confirmed working end to end.** The full chain is verified live: marketplace → plugin → verbatim deploy → tool allowlist bound → licence/region discovered → live project data. The one non-obvious requirement, now proven, is that the install **must run in a session on your computer, not in the cloud** — see the critical step below.

## 🔴 CRITICAL FIRST STEP — run the install ON YOUR COMPUTER, not in the cloud

**This is the single most important step. Skip it and the Blueprint will open but show "tools aren't authorised for this artifact" / "Licence not accessible via MCP" / "No projects" — even with everything else perfect.**

In Claude, each task runs either **on your computer** (local) or **in the cloud** (Anthropic's servers). The Blueprint's read tools are bound to its artifact only when the install's `create_artifact` runs **locally** — a cloud session registers the artifact through a bridge that cannot bind the tool allowlist.

Before you run the install:

- Use the **run-location control at the top-right of the Claude window** and choose **"On your computer"**. The window then shows a **laptop/computer icon** (local); a **cloud icon** means it's still cloud — switch it.
- To make it the default: **Settings → Cowork → turn OFF "Run new tasks in the cloud."**

You'll know it worked when, after the install, the header pill reads **Live** and the licence/project populate — not "Licence not accessible via MCP". (Confirmed on a local session: build `2026-07-20.1`, licence "… — North America (USA)", live project data.)

> **rc.6 — the install skill now *calls* the read tools before declaring them, so the artifact allowlist actually binds.** rc.5 deployed the real Blueprint but it opened on "tools aren't authorised for this artifact yet": the Cowork `create_artifact` tool only adds a tool to the artifact's allowlist if that tool was **actually called in the same session**, and the skill declared the nine read tools without calling them first. rc.6 has the skill call each read tool once (which also verifies the licence is MCP-accessible) and then declare all nine in `create_artifact`'s `mcp_tools` — so the allowlist populates and the dashboard can read live data.

> **rc.5 — the install skill now deploys the bundled dashboard verbatim.** The dashboard is a finished ~879 KB HTML artifact bundled in the plugin; the install skill must *copy* it and insert your connector prefix, not author one. rc.4's skill wording let Claude "rebuild" a dashboard from scratch instead. rc.5 rewrites the skill as a strict copy-don't-author recipe (copy the file → edit only the `CONFIG.connectors` line → register via `create_artifact` `html_path` → verify size/build stamp). If you see Claude *designing or writing* a dashboard during install, stop and re-run — it should be copying a file.

> **rc.4 — the marketplace now installs.** rc.3 could not be added as a marketplace: Cowork's server-side validator rejected the plugin with `MCP server 'Revizto MCP' must have a 'url' field`. The plugin had bundled the Revizto MCP connector in `.mcp.json` with no URL (it's a regional, OAuth, user-added connector — there is no static URL to give). Fix: the plugin **no longer bundles the connector**. It ships skills only; you add the Revizto MCP connector yourself in Settings → Connectors (a prerequisite, Install Step 1). Nothing in the working flow depended on the plugin declaring it — the artifact's tool allowlist comes from the install skill's `create_artifact`, and the connector comes from your own connection.
>
> **Carried from rc.3 (still in this build):** the package ships `.claude-plugin/marketplace.json` so it installs as a plugin; the install skill's `create_artifact` declares the read tools **into the artifact's `mcp_tools` allowlist** (the gate that was empty in rc.2's failed install); and the dashboard surfaces an allowlist error with an actionable message instead of a false "please connect". **If you tried rc.2 or rc.3, remove the old marketplace entry and re-add rc.4 — do not just clone the folder.**

---

## The one thing to understand first: two separate gates

For the Blueprint to read your data, **both** of these must be open. They are independent:

1. **Connector gate** — the Revizto MCP connector is connected and signed in (Settings → Connectors). This is per-connector.
2. **Artifact tool gate** — the dashboard artifact's own `mcp_tools` allowlist lists the read tools. This is per-artifact, and **connecting the connector does not fill it.** The *only* reliable way to fill it is to create the dashboard through the **install skill inside a Cowork session with this plugin installed** — that create step declares the tools.

Cloning the repo and "selecting the folder", or creating the artifact through the cloud/remote path, opens gate 1 but **not** gate 2 — you'll get the dashboard, but every live call is refused and (in rc.3) it tells you the tools aren't authorised. So: **install as a plugin.**

---

## The six views

`01 Morning brief` · `02 Project checklist` · `03 Cross-project intelligence` · `04 Coordination analytics` · `05 Ask anything` · `06 Action anything` (the plain-language write surface — **disabled while read-only is on**, which is the default every session; toggle the header pill off to enable it, see [Configuration](#configuration-deploy-time-constants)).

## Repository layout

```
.claude-plugin/plugin.json                          plugin manifest
.claude-plugin/marketplace.json                     one-plugin marketplace (makes it installable)
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

### Step 0 — Run this task on your computer (not the cloud)

Before anything else, switch the session to run **on your computer** (top-right run-location control → "On your computer"; laptop icon, not cloud). This is mandatory — see [the critical step above](#-critical-first-step--run-the-install-on-your-computer-not-in-the-cloud).

### Step 1 — Connect the Revizto MCP connector(s)

In Claude: **Settings → Connectors** → add the **Revizto MCP** connector for **each region you use** (most customers use one). Sign in with your own Revizto account (OAuth 2.1 PKCE) and approve **read** access. The dashboard holds no credentials — all authentication lives in these connectors. Keep them connected throughout install.

### Step 2 — Add the marketplace and install the plugin

**Desktop plugin browser:** open the plugin browser → **Add marketplace** → enter `jhowden-revizto/revizto-project-intelligence` → **turn "Sync automatically" OFF** → **Sync** → install **revizto-project-intelligence**.

> 🔴 **Turn "Sync automatically" OFF — this is required, not optional.** Leaving it on makes Claude set up auto-update-on-push, which needs the **Claude GitHub App** installed on this repository; without it the add fails with `github_repo_not_accessible` ("Automatic sync on push requires the Claude GitHub App…"). With the toggle **off**, Claude reads the public repo anonymously — no GitHub App, no interaction with your other connected repos, and you stay in control of updates. When a new build ships, re-open the marketplace and click **Sync/Update** once, manually.

**Or, if the `/plugin` CLI is available:**

```
/plugin marketplace add jhowden-revizto/revizto-project-intelligence
/plugin install revizto-project-intelligence@revizto
/reload-plugins
```

The install detail view should list **3 skills** (the plugin ships skills only; the Revizto MCP connector is the one you added yourself in Step 1, not bundled by the plugin). (Cloning the repo and selecting the folder is for inspecting or editing the code only — it will **not** authorise the artifact's tools, so it can't produce a working live dashboard. Use the plugin path.)

### Step 3 — Create the dashboard through the install skill

In a Cowork session with the plugin installed, say:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

The skill **copies the bundled `dashboard.html` verbatim** (it does not author or rebuild a dashboard — the Blueprint is a finished ~879 KB file), inserts your live connector prefix into the one `CONFIG.connectors` line, and registers the Cowork artifact (id `revizto-project-intelligence-blueprint`) **declaring the nine read tools plus `update_issues`** — this is the step that populates the artifact's `mcp_tools` allowlist (gate 2). The Blueprint opens read-only; `update_issues` is only ever invoked by a user-approved 06 action after they toggle read-only off.

> If you watch Claude *designing or writing HTML for a dashboard* during this step, something is wrong — stop and re-run. The correct behaviour is a file copy plus a one-line edit. (This was rc.4's failure, fixed in rc.5.)

### Step 4 — First run: accept Terms, pick a licence

On first live load the Blueprint presents the **Terms & Conditions** gate — no project data is fetched until you accept (consent precedes access). Acceptance is recorded on-device, **per connection**, with your name and a UTC timestamp; it only re-prompts on a Terms version bump or when you add a new connection. Then the licence picker appears — pick your licence and every view scores against your most-recently-active project on it.

### Verify (60 seconds)

- The status pill reads **live** — not "Snapshot · demo data" (not running in Cowork) and not "Revizto MCP not connected" (a gate is still closed).
- The **licence picker** lists your licence(s), each showing its own region; the masthead badge matches the selected licence's region.
- The project picker shows **your** projects and landed on your most-recently-active one; switching projects re-scores every view.
- **06 Action anything shows disabled with a padlock on first load.** Correct — the Blueprint opens read-only every session. Toggle the **Read-only** pill off to enable 06 Action (writes then run through the approval pipeline).
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

> ⚠️ **Runtime caveat.** The dashboard executes in the **Cowork artifact runtime**, not the chat session; the prefix the artifact uses is not guaranteed identical to the chat-session prefix. This is a *secondary* concern — the artifact tool allowlist (gate 2) is enforced *before* any prefix is evaluated, so an unauthorised tool fails first and the dashboard now says so. Confirm the exact artifact-runtime prefix form during your first native install and record it here.

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
| Adding the marketplace fails: `github_repo_not_accessible` / "Automatic sync on push requires the Claude GitHub App…" | "Sync automatically" was left **on** — auto-update needs the Claude GitHub App on the repo | Remove the entry, re-add with **"Sync automatically" OFF** (Install Step 2). Manual sync reads the public repo anonymously — no GitHub App needed |
| Adding the marketplace fails: generic "Marketplace sync failed. Check the repository URL" | Server-side validation rejected the plugin (e.g. pre-rc.4 builds) or the repo isn't public | Use rc.4+; confirm the repo is public. The real cause is in `~/Library/Logs/Claude/claude.ai-web.log` (search `MARKETPLACE_ERROR`) |
| "Snapshot · demo data" + fictional "Riverside Medical Centre" / "Hillcrest Aquatic Centre" | Not running inside Cowork | Open as a Cowork artifact created by the install skill (Install Step 3) |
| **"The Blueprint's tools aren't authorised for this artifact yet"** / "Licence not accessible via MCP" / "No projects" — even after a clean install | Gate 2: the artifact's `mcp_tools` allowlist is empty. Two causes: **(a)** the install ran in a **cloud** Cowork session (`cse_…`) — the cloud→desktop bridge can't bind the allowlist; **(b)** the read tools were declared without being called in-session | **(a) Re-run the install in a LOCAL session** (on your computer — computer/laptop icon, not the cloud icon). This is the usual cause and the real fix. **(b)** Use rc.6+ so the skill calls each of the nine read tools before declaring them. Delete the empty artifact and re-run. (Connecting the connector alone never authorises the artifact's tools.) |
| Calm "Revizto MCP not connected" first-run panel | Gate 1: no connector connected, or `CONFIG.connectors` empty and none reachable | Connect the Revizto MCP (Install Step 1); create via the skill so `CONFIG.connectors` is filled |
| "Couldn't load — Reload to retry" on every view | Tool calls failing — a `CONFIG.connectors` prefix doesn't match a tool the artifact can call | Re-create via the install skill (it reads the live prefix and declares the tools); or verify the prefix (Region → Finding a connector's prefix) |
| Licence picker empty / a licence missing | The MCP couldn't read that licence | The Blueprint states the cause: account **hasn't enabled the Revizto MCP in the Developer Portal**, **insufficient licence role**, or the licence is on a **region you haven't connected**. Fix the named cause; add the missing region's connector if that's it |
| "direct API access is forbidden" | The MCP refuses that licence/region outright | Entitlement — contact Revizto; no dashboard-side fix |
| Blank charts, no error, on Team/Enterprise | A region's connector domain or `cdn.jsdelivr.net` not allowlisted | Claude admin: Admin settings → Capabilities → network allowlist (one entry per connected region) |
| A project you expect is missing | Your account isn't a member, or it's on another licence | Fix membership in Revizto; switch licence in the picker |
| "Open in Revizto" links don't resolve | Deep-links point at `ws.revizto.com` (production); your tenant is elsewhere | Expected on non-production tenants; set that connection's `wsHost` in `CONFIG.connectors` |

Every tool call inherits your own Revizto role and project membership — the dashboard cannot see or do anything you can't do in Revizto itself.

### Stuck on an old plugin version (clear the cache)

If the plugin keeps showing an **old version** after we've published a newer one — and re-syncing the marketplace, or uninstalling and reinstalling the plugin, doesn't change it — Claude is reading a **cached** copy. (Known issue: the plugin cache doesn't always refresh, anthropics/claude-code#17361.) The plugin cache and marketplace registry live on disk under `~/.claude/plugins/`; you must clear them.

Verify first that the new version is actually published: open `https://github.com/jhowden-revizto/revizto-project-intelligence/blob/main/.claude-plugin/marketplace.json` in a browser and check the `"version"`. If that's the version you want but the app shows an older one, it's a cache — clear it:

**macOS**

1. **Quit Claude completely** (⌘Q — not just the window).
2. In **Terminal**:

   ```bash
   chflags -R nouchg ~/.claude/plugins 2>/dev/null   # clear macOS lock flags that block deletion (harmless if none)
   rm -rf ~/.claude/plugins/cache                     # the cached plugin files
   rm -rf ~/.claude/plugins/marketplaces/revizto      # the cloned marketplace copy
   ```

   To fully reset the registry as well, delete the `revizto` entry from `~/.claude/plugins/known_marketplaces.json` (or delete that file to reset every marketplace — they rebuild when re-added). If `~/.claude/plugins` doesn't exist, locate the cache with `find ~/Library -ipath "*laude*plugins*" -name known_marketplaces.json 2>/dev/null` and clear the `cache` folder beside it.
3. **Reopen Claude** → Settings → Plugins → **Add ▾ → Add marketplace** → `jhowden-revizto/revizto-project-intelligence` → **Sync automatically OFF** → **Sync**.
4. **Confirm the version now matches GitHub** before installing, then install.

**Windows:** the equivalent path is `%USERPROFILE%\.claude\plugins\` — quit Claude, delete the `cache` and `marketplaces\revizto` folders there (and the `revizto` entry in `known_marketplaces.json`), reopen, and re-add the marketplace.

---

## Configuration (deploy-time constants)

One `CONFIG` object at the top of the dashboard script:

| Constant | This build | Meaning |
|---|---|---|
| `connectors` | `[]` (skill fills it) | one entry per connected Revizto MCP region: `{prefix, env, wsHost, missing}`. See [MCP Region & Licensing](#mcp-region--licensing-the-connector-id-detail). |
| `readOnly` | `false` | the header Read-only pill is a **live per-session toggle**. The Blueprint always opens read-only (and re-asserts read-only when the artifact is re-shown); switching the pill off enables the 06 Action write surface for that session. Real writes also require `update_issues` on the artifact allowlist (declared at install). Set `readOnly:true` to hard-lock the pill on and disable writes entirely. |
| `tcsVersion` | `"1.0"` | Terms & Conditions version. Bumping it re-prompts acceptance on every connection. |
| `buildStamp` | `"2026-07-20.1"` | shown in About and the Terms footer for support/traceability. |

> `CONFIG.server` and `CONFIG.wsHost` still exist as **legacy mirrors** of the currently-selected connection, retargeted automatically on switch. Configure `CONFIG.connectors`, not these.

---

## Trust posture (the product is the trust)

- **Count-first exact layer.** Headline totals come from exact counts; anything sampled is labelled "sample of N of M" on the card itself.
- **Live, never cached.** Cache-busted reads, per-call timeouts, honest failure states, full state reset on every licence/project/connection switch. Loaders are sequence-guarded, so no stale response from a prior selection repopulates state after a switch.
- **Read-only by default, writes behind an explicit toggle and a full approval gate.** The Blueprint **opens read-only every session** (`READONLY` starts on regardless of `CONFIG`) and **re-asserts read-only whenever the artifact is reopened/re-shown** — writes are never the default and never sticky. Turning the header pill **off** is a deliberate, per-session action that enables the 06 Action write surface. Every write then runs through the full pipeline: count-first targeting, a diff + sample preview, a name + reason approval modal, an audit note, and reversibility; staged jobs are connection-stamped and never resume on a different connection. The artifact's `mcp_tools` allowlist is the outer security boundary — this build declares the nine read tools **plus `update_issues`** so approved writes can execute; `update_issues` is never invoked except by a user-approved 06 action. To ship a hard read-only build instead, set `CONFIG.readOnly:true` (locks the pill on) and omit `update_issues` at install.
- **Your session, your permissions.** All calls run through the user's own authenticated MCP session. No escalation; `whoami` is not in the allowlist.
- **Consent precedes access.** No live data is fetched until Terms are accepted; acceptance is recorded on-device per connection.
- **AI answers** (05 Ask) send only the derived figures needed for the question to the model; project data is not stored server-side.

Tool allowlist (per connected connector prefix): `list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates, list_license_members, list_project_members, list_workflows, list_issues` + `update_issues` (declared so approved writes execute when read-only is toggled off; never invoked except by a user-approved 06 action). `whoami` is never declared.

## Demo mode

Opened outside Cowork (no `window.cowork`), the dashboard renders a clearly-labelled synthetic snapshot (two sample projects — "Riverside Medical Centre" and "Hillcrest Aquatic Centre" — fictional people on `@example.com`). No customer data, no Revizto staff, no real project identifiers. A leave-behind brochure, not intelligence.

## Runtime dependencies

- Claude desktop with Cowork (provides `callMcpTool` / `askClaude`).
- The Revizto MCP connector for each region you use, with read access approved.
- Team/Enterprise admin network allowlist: each region's Revizto MCP connector domain(s) + `cdn.jsdelivr.net` (Chart.js). Fonts are embedded — no font CDN.

## Known open items

- **Native allowlist declaration (being verified by first-user testing).** rc.3 ships `marketplace.json` so the install-skill `create_artifact` path can declare the nine read tools into the artifact's `mcp_tools` allowlist. Confirm on the current desktop build that a plugin-install + skill-run install actually populates the allowlist (the dashboard should reach the licence picker within one Refresh). If it still shows "tools aren't authorised for this artifact" after a proper plugin install, the create path isn't declaring tools on that build — capture it as a Revizto platform issue.
- **Artifact-runtime prefix form.** The dashboard routes by the `mcp__<id>__` prefix, which is per-user and derived in the artifact runtime. Record the exact prefix form observed during the first native install. Secondary to the allowlist (gate 2 fails first). (The plugin no longer declares the connector, so the old "by-name `.mcp.json` resolution" question is moot — the connector is added by the user in Settings → Connectors.)
- **Terms & Conditions URL.** The in-text link to the canonical Revizto MCP Server Terms is a **placeholder** pending the final URL; publishing it will bump `tcsVersion` (re-prompting acceptance on every connection).

## Licence

Copyright © 2026 Revizto SA. All rights reserved. Private repository — not for redistribution.
