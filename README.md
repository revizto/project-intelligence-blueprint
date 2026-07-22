# Revizto Project Intelligence Blueprint

Live project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork dashboard. It opens **read-only** every session; read-only is a user-controlled toggle, so you can switch on write actions and push changes — reassignments, status updates and more — directly into your Revizto project database (every write runs through a count-first preview and an explicit approval step). It is **licence-first**: on load it probes every Revizto MCP region you've connected, aggregates the licences your own Revizto account can see into a single picker, and lets you pick a **licence** — never a connector or a region — then lands on your most-recently-active project. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" sample. Nothing is cached or hardcoded — every figure is re-derived live on load and on every Refresh.

**Status:** `v1.0.0-rc.11` — private release candidate (build `2026-07-22.1`). Opens read-only every session with a user-controlled write toggle. Full version history in [CHANGELOG.md](CHANGELOG.md). Not for public distribution until sign-off.

---

# Install

Follow these in order. The whole install is per-user and **needs no Claude admin** (see [Admin / org-wide rollout](#admin--org-wide-rollout) if you want to push it to a whole org).

### Prerequisites

- **Claude desktop app with Cowork.** The Blueprint runs as a Cowork artifact — not in a plain chat or on claude.ai.
- **A Revizto licence the MCP Server accepts** — your organisation has enabled the Revizto MCP Server (Developer Portal) and your licence role is sufficient. Confirm with your Revizto contact.
- **(Team/Enterprise only) Admin network allowlist** — your Claude admin allows the Revizto MCP connector domain(s) + `cdn.jsdelivr.net` under Admin settings → Capabilities.

### Step 1 — Run this task on your computer (not the cloud) 🔴

**This is the single most important step.** In Claude, a task runs either **on your computer** or **in the cloud**. The Blueprint's tools are authorised to its artifact only when the install runs **locally** — a cloud session can't bind them, and the dashboard will open but show "tools aren't authorised for this artifact" / "Licence not accessible via MCP".

- Use the **run-location control at the top-right of the Claude window** → choose **"On your computer"** (the header then shows a **laptop icon**, not a cloud icon).
- Optional default: **Settings → Cowork → turn OFF "Run new tasks in the cloud."**

### Step 2 — Connect the Revizto MCP connector

**Settings → Connectors** → add the **Revizto MCP** connector for your region → sign in with your Revizto account (OAuth) → approve **read** access. (One connection per region; most customers use one.)

### Step 3 — Install the plugin (Personal scope — no admin needed)

Do **either** of these under **Directory → Plugins → Personal**:

- **Add by URL:** **+** (Add marketplace) → enter `revizto/project-intelligence-blueprint` → turn **"Sync automatically" OFF** → **Sync** → install **revizto-project-intelligence**.
- **Or upload the ZIP:** under **Local uploads**, upload the plugin package (`revizto-project-intelligence` ZIP). No GitHub needed.

Either way it installs just for you — no Claude admin required. The install detail should list **3 skills**. (Leave "Sync automatically" off — turning it on needs the Claude GitHub App on the repo and isn't required; you'll re-sync manually when a new build ships.)

### Step 4 — Open the Blueprint

In a Cowork session (running **on your computer**, plugin installed), say:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

It copies the bundled dashboard verbatim, calls your Revizto read tools, and registers the artifact with those tools authorised. Then: accept the **Terms** (name + tick + Agree), and **pick your licence**.

### Verify (60 seconds)

- Status pill reads **live** — not "Snapshot · demo data", not "Revizto MCP not connected", not "tools aren't authorised".
- The **licence picker** shows your licence with its region badge; it lands on your most-recently-active project.
- Headline totals are exact; sampled panels say "sample of N of M".
- **06 Action anything shows a padlock on first load** — correct, the Blueprint opens read-only. Toggle the **Read-only** pill off to enable writes (they run through the approval pipeline).

### Troubleshooting

| Symptom | Fix |
|---|---|
| **"Tools aren't authorised for this artifact" / "Licence not accessible" / "No projects"** — even after a clean install | You ran the install **in the cloud**. Re-run it **on your computer** (Step 1). This is the usual cause. |
| Marketplace add fails: `github_repo_not_accessible` / "Automatic sync on push requires the Claude GitHub App…" | "Sync automatically" was left **on**. Remove the entry, re-add with it **OFF** (Step 3). |
| Adding the marketplace says it needs **admin** | You're on the **Organization** tab. Use the **Personal** tab (Step 3) — that's per-user, no admin. (Org-wide push is admin-only; see [Admin / org-wide rollout](#admin--org-wide-rollout).) |
| Plugin stuck on an old version after re-sync/reinstall | Cache — clear it: quit Claude, then `chflags -R nouchg ~/.claude/plugins 2>/dev/null; rm -rf ~/.claude/plugins/cache ~/.claude/plugins/marketplaces/revizto`, reopen, re-add. (Windows: `%USERPROFILE%\.claude\plugins\`.) |
| Install starts *writing/designing* a dashboard | Wrong behaviour — it should copy a file. Stop and confirm the plugin is current, then re-run. |
| "Snapshot · demo data" (fictional "Riverside Medical Centre") | Not running inside a Cowork artifact created by the install skill. |
| Licence picker empty / a licence missing | The Blueprint names the cause: Revizto MCP not enabled in the Developer Portal, insufficient licence role, or the licence is on a region you haven't connected. |
| Blank charts, no error (Team/Enterprise) | A connector domain or `cdn.jsdelivr.net` isn't allowlisted — ask your Claude admin (Admin settings → Capabilities). |

Every tool call inherits your own Revizto role and project membership — the dashboard can't see or do anything you can't do in Revizto itself.

---

# Reference

Everything below is background and advanced configuration — not needed for a standard install.

## How it works: two gates

For the Blueprint to read your data, **both** must be open, and they're independent:

1. **Connector gate** — the Revizto MCP connector is connected and signed in (Step 2).
2. **Artifact tool gate** — the dashboard artifact's own `mcp_tools` allowlist authorises the read tools. Connecting the connector does **not** fill this; only the install skill's `create_artifact` does, and only when run **locally** (Step 1). This is why a cloud install, or cloning the folder, produces a dashboard that can't read.

## The six views

`01 Morning brief` · `02 Project checklist` · `03 Cross-project intelligence` · `04 Coordination analytics` · `05 Ask anything` · `06 Action anything` (the plain-language write surface — disabled while read-only is on, which is the default every session; toggle the header pill off to enable it).

## MCP Region & Licensing

The install skill fills the connector config for you; this is what it writes and how to do it by hand.

- Every Revizto **region** is a separate MCP connection. Add one connector per region you use (most customers use one).
- Each connection is listed by its **prefix** (`mcp__<connector-id>__`) in `CONFIG.connectors` in `dashboard.html`. The prefix is **per-user** (derived from your connector's name/id) — don't copy examples verbatim. To read it, ask Claude in-session: *"list the Revizto MCP tool names you can call"* — the leading `mcp__…__` segment is the prefix.
- The Blueprint is **licence-first**: it probes every configured connection, aggregates the licences you can see into one picker (`Licence — Region`), and routes each licence to the right connection automatically. Two+ connections add a **Connections ⓘ** health panel.

**Single region (common):**
```js
const CONFIG={connectors:[
  {prefix:"mcp__<connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:false,tcsVersion:"1.1",buildStamp:"2026-07-20.1"};
```
**Two regions:** add a second `{prefix…}` line. Add each region's connector domain to the admin allowlist too.

## Admin / org-wide rollout

Everything above is **per-user (Personal), no admin**. To push the Blueprint to an **entire organisation** centrally (installed-by-default or required for all members), a **Team/Enterprise plan Owner** uses **Organization settings → Plugins**. Two things to know for our repo:

- **Org GitHub-synced marketplaces must be a *private* repo** — public repos aren't allowed for org marketplaces (they're fine for Personal installs). For an org rollout, either use a private mirror with relative-path `source` entries, or have the Owner **upload the plugin ZIP** manually to an org marketplace (ZIP upload doesn't care about repo visibility).
- **Cowork + Skills must be enabled for the org** (a one-time Owner toggle) before any plugin works. If a user's *Personal* install is fully blocked, this is usually why.

See Anthropic's [Manage plugins for your organization](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization).

## Configuration (deploy-time constants)

One `CONFIG` object at the top of `dashboard.html`:

| Constant | This build | Meaning |
|---|---|---|
| `connectors` | `[]` (skill fills it) | one entry per connected region: `{prefix, env, wsHost, missing}`. |
| `readOnly` | `false` | the Read-only pill is a **live per-session toggle**. The Blueprint always opens read-only and re-asserts it on re-show; toggling off enables the 06 write surface. Set `true` to hard-lock read-only and disable writes. |
| `tcsVersion` | `"1.1"` | Terms version (`1.1` published the canonical Terms link). Bumping it re-prompts acceptance on every connection. |
| `buildStamp` | `"2026-07-20.1"` | shown in About / Terms footer for support. |

## Trust posture (the product is the trust)

- **Count-first exact layer** — headline totals are exact; anything sampled is labelled "sample of N of M".
- **Live, never cached** — cache-busted reads, per-call timeouts, honest failure states, full reset on every licence/project/connection switch; sequence-guarded loaders.
- **Read-only by default; writes behind an explicit toggle + a full approval gate.** Opens read-only every session and re-asserts on re-show. Turning the pill off enables 06 Action; every write then runs count-first targeting → diff + sample preview → name + reason approval → audit note → reversible; staged jobs are connection-stamped. The artifact allowlist declares the nine read tools **plus `update_issues`** (never invoked except by a user-approved action). To ship a hard read-only build: `readOnly:true` + omit `update_issues` at install.
- **Your session, your permissions** — all calls run through your own authenticated MCP session; `whoami` is never declared.
- **Consent precedes access** — no live data until Terms are accepted (recorded on-device, per connection).
- **AI answers (05 Ask)** send only the derived figures needed; project data isn't stored server-side.

Tool allowlist (per connector prefix): `list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates, list_license_members, list_project_members, list_workflows, list_issues` + `update_issues` (approved writes only).

## Demo mode

Opened outside Cowork (no `window.cowork`), the dashboard renders a clearly-labelled synthetic snapshot ("Riverside Medical Centre" / "Hillcrest Aquatic Centre", fictional people on `@example.com`). No customer data, no real identifiers — a leave-behind brochure, not intelligence.

## Runtime dependencies

Claude desktop with Cowork; the Revizto MCP connector for each region you use (read access approved); and (Team/Enterprise) the admin network allowlist for each region's connector domain(s) + `cdn.jsdelivr.net`. Fonts are embedded — no font CDN.

## Repository layout

```
.claude-plugin/plugin.json         plugin manifest
.claude-plugin/marketplace.json    one-plugin marketplace (makes it installable)
skills/
  project-intelligence-dashboard/  install action + the dashboard artifact (assets/dashboard.html)
  skill-aeco-innovation-revizto/       Revizto platform knowledge (curated)
  skill-aeco-innovation-revizto-api/   Revizto API / MCP / integration patterns (curated)
CONNECTORS.md · SKILLS-MANIFEST.md · CHANGELOG.md
```

## Known open items

- **Artifact-runtime prefix form** — the dashboard routes by the per-user `mcp__<id>__` prefix; record the exact form seen on the first native install. Secondary to the tool gate.

## Licence

Copyright © 2026 Revizto SA. All rights reserved. Private repository — not for redistribution.
