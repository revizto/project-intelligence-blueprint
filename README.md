# Revizto Project Intelligence Blueprint

Live project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork artifact. It opens **read-only** every session; read-only is a user-controlled toggle, so you can switch on write actions and push changes — reassignments, status updates and more — directly into your Revizto project database (every write runs through a count-first preview and an explicit approval step).

It follows one explicit path: **MCP Server → Licence → Project.** Each Revizto MCP server you connect is its own connection, listed by the name you gave it in Claude. You choose which server the Blueprint reads from, and every licence and project you see comes from that one server — nothing is merged across servers and nothing is guessed on your behalf. Servers that are connected but unusable are shown greyed with the reason stated. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" sample. Nothing is cached or hardcoded — every figure is re-derived live on load and on every Refresh.

**Status:** `v1.0.2` (build `2026-07-30.2`). Covers licence and project resolution, connection stability, sample honesty, and the Revizto MCP **OAuth client ID change to `revizto-mcp`**. Opens read-only every session with a user-controlled write toggle. Full version history in [CHANGELOG.md](CHANGELOG.md).

> ### ⚠️ Upgrading to 1.0.2 — action required
>
> Updating the plugin does **not** update a Blueprint you have already deployed. The artifact you are
> using was built from the previous version and still contains its code.
>
> **Re-run the `project-intelligence-dashboard` skill** to deploy this version. The tool authorisations are
> unchanged — the same ten tools per server — so there is nothing new to approve. If you re-added a
> connector for the new client ID, the re-run is mandatory: a re-added connector has a new id, and the old
> artifact's allowlist is bound to the old one.
>
> Coming from 1.0.0 you also keep its faults until you re-run: licences assumed readable rather than
> verified, project lists silently capped at 100, archived projects mixed in with live work, and
> overlapping refreshes that surface as the connection dropping.


---

# Install

Follow these in order. The whole install is per-user and **needs no Claude admin** (see [Admin / org-wide rollout](#admin--org-wide-rollout) if you want to push it to a whole org).

### Prerequisites

- **Claude desktop app with Cowork.** The Blueprint runs as a Cowork artifact — not in a plain chat or on claude.ai.
- **A Revizto licence the MCP Server accepts** — the Revizto MCP Server app is activated on the organisation account (Developer portal), your licence role is Administrator or Owner, and *that account* is authorised for your connector (Step 2). Reading a licence over the MCP needs all three; the Blueprint verifies each licence with a real call and tells you which one is missing.
- **(Team/Enterprise only) Admin network allowlist** — your Claude admin allows the Revizto MCP connector domain(s) + `cdn.jsdelivr.net` under Admin settings → Capabilities.

### Step 1 — Run this task on your computer (not the cloud) 🔴

**This is the single most important step.** In Claude, a task runs either **on your computer** or **in the cloud**. The Blueprint's tools are authorised to its artifact only when the install runs **locally** — a cloud session can't bind them, and the dashboard will open but show "tools aren't authorised for this artifact" / "Licence not accessible via MCP".

- Use the **run-location control at the top-right of the Claude window** → choose **"On your computer"** (the header then shows a **laptop icon**, not a cloud icon).
- Optional default: **Settings → Cowork → turn OFF "Run new tasks in the cloud."**

### Step 2 — Connect the Revizto MCP connector

Add the **Revizto MCP** connector for your region as a **custom connector**, then sign in with your Revizto account (OAuth) and approve **read** access. One connection per region; most customers use one.

In Claude: **Customize → Connectors**. If your organisation manages your Claude account, an owner must add the connector once from **Organization settings → Connectors** before members can add it.

| Field | Value |
|---|---|
| Type / transport | Streamable HTTP (remote MCP server) |
| URL | `https://api.<region>.revizto.com/mcp` — see the region table below |
| OAuth Client ID | `revizto-mcp` |
| OAuth Client Secret | leave blank |

Regions: `virginia` (North America), `canada`, `ireland` (Europe), `london` (UK), `frankfurt` (UAE, hosted in Germany), `saopaulo` (South America), `singapore` (SE Asia), `sydney` (ANZ), `tokyo` (Japan), `ksa` (KSA Premium), `zurich` (Switzerland).

> **Two prerequisites on the Revizto side.** The **Revizto MCP Server** app must be *activated* for your organisation account — an owner or admin does this under **Manage account info → Developer portal**; standard users can only confirm it under **Account info → App integrations**. And if you belong to **several organisation accounts**, one connector sign-in authorises only the accounts covered by that authentication method. Authorise the rest from Revizto Workspace → your profile → **Active sessions → API**. Skipping this is the single most common reason a licence shows as unreadable in the Blueprint.

> ### ⚠️ Already had a connector before 30 July 2026? Re-add it.
>
> The Revizto MCP **OAuth client ID changed to `revizto-mcp`**. Connectors created with the previous client
> ID stop authorising. Remove and re-add each Revizto MCP connector with the values above.
>
> Re-adding mints a **new connector id**, and the Blueprint's tool authorisations are bound to the old one —
> so after re-adding you must **re-run the `project-intelligence-dashboard` skill** (Step 5). You can also
> paste the new id into the **Add** box in the Blueprint's MCP Server panel and press **Re-check** as a
> stopgap, but a full re-run is what restores the tool allowlist.

Confirm the connection before continuing — ask Claude: *"Check my Revizto MCP connection. Tell me which Revizto account and region you can access, then list the available Revizto tools."*

### Step 3 — Install the plugin package (Personal scope — no admin needed)

**Recommended: upload the package.** Under **Directory → Plugins → Personal → Local uploads**, upload
`revizto-project-intelligence-v1.0.2.plugin` (the package supplied to you). No GitHub access needed, and
it carries the bundled dashboard asset — which is the part the install skill copies.

**Alternative: add the marketplace by URL.** **+** (Add marketplace) → enter
`revizto/project-intelligence-blueprint` → turn **"Sync automatically" OFF** → **Sync** → install
**revizto-project-intelligence**. Requires access to the private repo.

Either way it installs just for you — no Claude admin required. The install detail should list **3 skills**,
and the version should read **1.0.2**. (Leave "Sync automatically" off — turning it on needs the Claude
GitHub App on the repo and isn't required; you re-upload or re-sync manually when a new build ships.)

> **Upgrading, not installing fresh?** Remove the old entry first, then upload the new package —
> Claude will otherwise keep serving the cached older version. If the version still reads the old number after
> a re-upload, clear the plugin cache (see Troubleshooting).

### Step 4 — Enable the plugin's skills 🔴

**Installing the plugin does not enable its skills.** This catches almost everyone. The plugin ships three
skills, but they arrive **switched off**, and the install action lives in one of them — so if you skip this
step, asking Claude to open the Blueprint does nothing useful: the skill never loads, no artifact is
registered, and you are left with either no dashboard at all or a hand-written imitation of one.

Under **Directory → Skills** (or the plugin's own detail pane), find and switch **on**:

- **`project-intelligence-dashboard`** — required. This is the install action.
- `skill-aeco-innovation-revizto` — optional, Revizto platform knowledge.
- `skill-aeco-innovation-revizto-api` — optional, Revizto API / MCP reference.

Only the first is needed to deploy the Blueprint. Confirm it is enabled before continuing — ask Claude
*"list your available skills"* and check `project-intelligence-dashboard` appears.

### Step 5 — Open the Blueprint

In a Cowork session (running **on your computer**, plugin installed, skill enabled), say:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

It copies the bundled dashboard verbatim, calls your Revizto read tools, and registers the artifact with those tools authorised. Then: accept the **Terms** (name + tick + Agree), choose your **MCP Server**, and pick your **Licence**.

If Claude instead starts *designing* a dashboard, the skill is not loaded — go back to Step 4.

### Verify (60 seconds)

- Status pill reads **live** — not "Snapshot · demo data", not "Revizto MCP not connected", not "tools aren't authorised".
- The **MCP Server** control names the server you are reading from; the **Licence** picker below it lists that server's licences and lands on your most-recently-active project.
- The licence picker groups licences into **Readable**, **Checking…** and **Not readable**, and every
  unreadable one states its reason. A licence is verified with a real call, never assumed — so the
  Blueprint should never open on one it cannot read.
- The project picker lists **live projects only**; archived and frozen work appears only when you turn on
  **Include archived**, and is tagged when it does. A licence with more than 100 projects lists all of them.
- Headline totals are exact; sampled panels say "sample of N of M" against the right total.
- **06 Action anything shows a padlock on first load** — correct, the Blueprint opens read-only. Toggle the **Read-only** pill off to enable writes (they run through the approval pipeline).
- Footer / About reads build **`2026-07-30.2`**. If it reads an earlier stamp you are looking at a
  Blueprint deployed by an older version — re-run the skill (Step 5).

### Troubleshooting

| Symptom | Fix |
|---|---|
| **"Tools aren't authorised for this artifact" / "Licence not accessible" / "No projects"** — even after a clean install | You ran the install **in the cloud**. Re-run it **on your computer** (Step 1). This is the usual cause. |
| Marketplace add fails: `github_repo_not_accessible` / "Automatic sync on push requires the Claude GitHub App…" | "Sync automatically" was left **on**. Remove the entry, re-add with it **OFF** (Step 3). |
| Adding the marketplace says it needs **admin** | You're on the **Organization** tab. Use the **Personal** tab (Step 3) — that's per-user, no admin. (Org-wide push is admin-only; see [Admin / org-wide rollout](#admin--org-wide-rollout).) |
| Plugin stuck on an old version after re-sync/reinstall | Cache — clear it: quit Claude, then `chflags -R nouchg ~/.claude/plugins 2>/dev/null; rm -rf ~/.claude/plugins/cache ~/.claude/plugins/marketplaces/revizto`, reopen, re-add. (Windows: `%USERPROFILE%\.claude\plugins\`.) |
| Install starts *writing/designing* a dashboard | Wrong behaviour — it should copy a file. Stop and confirm the plugin is current, then re-run. |
| "Snapshot · demo data" (fictional "Riverside Medical Centre") | Not running inside a Cowork artifact created by the install skill. |
| Licence picker empty / a licence missing | Check the **MCP Server** panel first — the licence may live on a different server than the one selected. The Blueprint names the cause against each server: Revizto MCP not enabled in the Developer Portal, insufficient licence role, needs sign-in, or not authorised for this artifact. |
| A licence sits under **Not readable** | Read the stated reason. "Your role on this licence can't read it via the MCP" needs an Administrator or Owner role. "MCP not enabled for this account" is a Developer Portal setting on that licence's Revizto account — invisible in the licence list, so it can only be found by the check the Blueprint now runs. "Lives on a different regional server" means switch server in the MCP Server panel. Unreadable licences stay listed deliberately, so you can see the whole estate and what would need changing. |
| A project you expect isn't in the picker | It is archived or frozen — turn on **Include archived** in the project picker. Both are excluded by default since 1.0.1 because an archived project often carries the most recent activity date and was being picked as the default. |
| Footer build stamp is older than `2026-07-30.2` | The deployed artifact predates the plugin update. Re-run the `project-intelligence-dashboard` skill (Step 5) — updating the plugin never rewrites an already-deployed Blueprint. |
| Asking Claude to open the Blueprint does nothing, or it starts **designing** a dashboard | The `project-intelligence-dashboard` skill is not enabled. Installing the plugin does not enable its skills — do Step 4. |
| A licence shows **"This account isn't authorised for MCP yet"** | Two causes, self-service first: authorise that organisation account from Revizto Workspace → your profile → **Active sessions → API**, then press **Re-check**. One connector sign-in only covers accounts on that authentication method. If it still fails, the **Revizto MCP Server** app isn't activated on that account — an owner or admin activates it under **Manage account info → Developer portal**. |
| Connections that worked before 30 July 2026 now fail or show **"no longer registered"** | The Revizto MCP OAuth client ID changed to `revizto-mcp`. Re-add each connector (Step 2), then re-run the skill (Step 5) — re-adding mints a new connector id, and the artifact's tool allowlist is bound to the old one. |
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
- The Blueprint is **server-first**: you choose which Revizto MCP server it reads from in the **MCP Server** panel, and the licences and projects you see come from that server alone. Each connected server is one row, named as you named the connector in Claude; unusable servers are greyed with the reason stated. The panel also hosts **Re-check all** and **Add connector**.

**Single region (common):**
```js
const CONFIG={connectors:[
  {prefix:"mcp__<connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:false,tcsVersion:"1.1",buildStamp:"2026-07-30.2"};
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
| `buildStamp` | `"2026-07-30.2"` | shown in About / Terms footer for support. |

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
