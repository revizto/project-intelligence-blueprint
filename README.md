# Revizto Project Intelligence Blueprint

Live project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork artifact. It opens **read-only** every session; read-only is a user-controlled toggle, so you can switch on write actions and push changes — reassignments, status updates and more — directly into your Revizto project database (every write runs through a count-first preview and an explicit approval step).

It follows one explicit path: **MCP Server → Licence → Project.** Each Revizto MCP server you connect is its own connection, listed by the name you gave it in Claude. You choose which server the Blueprint reads from, and every licence and project you see comes from that one server — nothing is merged across servers and nothing is guessed on your behalf. Servers that are connected but unusable are shown greyed with the reason stated. Headline totals are exact (count-first, from Revizto's own counts); detailed panels are drawn from a labelled "N of M" sample. Nothing is cached or hardcoded — every figure is re-derived live on load and on every Refresh.

**Status:** `v1.1.0` (Blueprint build `2026-07-30.2`). **This release changes the licence.** The repository is now published under the **Revizto Custom Licence** ([LICENSE.md](LICENSE.md)), replacing the MIT Licence — read [Licence](#licence) before you take a copy. No code changed: the Blueprint is unchanged from 1.0.2, and the rest of 1.1.0 and all of 1.0.3 is documentation. The 1.0.3 corrections: installation is now a single continuous eight-step sequence, the plugin is installed by pointing Claude at this GitHub repository (there is no package file), and the OAuth client-ID guidance is corrected from *re-add your connector* to *re-authorise your account*. Full version history in [CHANGELOG.md](CHANGELOG.md).

> ### ⚠️ Read this before you re-sync — 1.1.0 changes the licence
>
> The repository moves from the MIT Licence to the **Revizto Custom Licence**
> ([LICENSE.md](LICENSE.md)). No code changed with it, but **pressing Sync takes a fresh copy under the
> new terms**, so this is not routine housekeeping — read them first and decide.
>
> Rights granted under MIT for copies obtained under it are not withdrawn by this change; it governs what
> you take from 1.1.0 onward. Every release before 1.1.0 carries MIT.
>
> Nothing needs redeploying for technical reasons. The Blueprint artifact is unchanged (build
> `2026-07-30.2`), your Terms acceptance still stands, and re-running the install skill would cost you
> that acceptance and your saved selections for no gain. If you do choose to take 1.1.0, **Sync** on the
> marketplace entry and install again is all that is needed.
>
> **Coming from 1.0.0 or 1.0.1?** You do need to re-run the `project-intelligence-dashboard` skill
> (Step 8). Updating the plugin never rewrites a Blueprint you have already deployed, so until you re-run
> it you keep the older version's faults: licences assumed readable rather than verified, project lists
> silently capped at 100, archived projects mixed in with live work, and overlapping refreshes that
> surface as the connection dropping.
>
> **Note on the 1.0.2 release notes.** The 1.0.2 entry in [CHANGELOG.md](CHANGELOG.md) told you to remove
> and re-add every connector after the client-ID change. **That instruction was wrong** and is corrected
> below at Step 5 — re-authorise the account, don't rebuild a working connector.

---

# Getting started

**Getting started is eight steps, numbered 1 to 8 straight through.** It is one sequence, not two lists.

- **Steps 1–3 are prerequisites** — things that must already be true before you begin.
- **Steps 4–8 are the install itself.**

When you finish Step 3, **carry on at Step 4. Do not go back to Step 1.**

| | Step | What you do |
|---|---|---|
| **Prerequisites** | 1 | Check you have the Claude desktop app with Cowork |
| | 2 | Check you have a Revizto licence the MCP Server can read |
| | 3 | *(Team/Enterprise only)* Get the domains allowlisted |
| **Install** | 4 | Run the task on your computer, not the cloud 🔴 |
| | 5 | Connect the Revizto MCP connector |
| | 6 | Add this repository as a plugin marketplace |
| | 7 | Enable the plugin's skills 🔴 |
| | 8 | Open the Blueprint |

**Do you need a Claude administrator?** On a **personal plan**, no — not for any of the eight steps.

On **Team or Enterprise**, three things may need one, and all three are outside Steps 6–8:

- **Cowork and Skills must both be enabled for your organisation** — a one-time Owner toggle. Without it
  nothing in this sequence works, and a Personal plugin install looks blocked for no visible reason
  (Step 1).
- An admin must **allowlist the network domains** (Step 3).
- If your organisation manages your Claude account, an owner must **add the Revizto connector to the
  organisation once** before members can add it for themselves (Step 5).

Pushing the Blueprint to a whole organisation at once is a separate, admin-only path — see
[Admin / org-wide rollout](#admin--org-wide-rollout).

**Stuck at any point?** Every failure mode we know about is in [Troubleshooting](#troubleshooting) below.
If none of it fits, email **support@revizto.com** with your plugin version, the build stamp from the
Blueprint's footer, and the region you connected.

---

## Steps 1–3 · Prerequisites

### Step 1 — Check you have the Claude desktop app with Cowork

The Blueprint runs as a Cowork artifact — not in a plain chat and not on claude.ai. You need the Claude
desktop app, with Cowork available to your account.

On **Team or Enterprise**, Cowork **and Skills** must both be enabled for your organisation — a one-time
Owner toggle. This is the one prerequisite that silently breaks everything downstream: with Skills
disabled, the plugin installs, the skill list stays empty, and Step 7 has nothing to switch on.

### Step 2 — Check you have a Revizto licence the MCP Server can read

Reading a licence over the MCP needs **all three** of these to be true at once:

- **(a)** the **Revizto MCP Server** app is activated on the organisation account that owns the licence;
- **(b)** your role on that licence is **Administrator or Owner**;
- **(c)** that same account is authorised for your connector — which you add in Step 5.

**You do not have to verify these in advance, and mostly you can't.** Condition (a) is invisible from the
licence list, and (c) does not exist until Step 5. The Blueprint checks all three with a real call once
it is running, and names whichever one is missing against each licence. So treat this step as a sanity
question rather than a task: *do I administer at least one Revizto licence?* If you administer none, the
product will install correctly and then have nothing it is allowed to show you — sort the role out with
your Revizto account owner first, or email **support@revizto.com** if you are not sure who that is.

If a licence does come back blocked after install, the Troubleshooting table below has a row for each of
the three causes.

### Step 3 — *(Team/Enterprise only)* Get the domains allowlisted

**Skip this step on a personal plan.** On Team or Enterprise, your Claude admin must allow two things
under **Admin settings → Capabilities**:

- the Revizto MCP connector domain for each region you will use — `api.<region>.revizto.com`, where
  `<region>` is one of: `virginia` (North America), `canada`, `ireland` (Europe), `london` (UK),
  `frankfurt` (UAE, hosted in Germany), `saopaulo` (South America), `singapore` (SE Asia), `sydney`
  (ANZ), `tokyo` (Japan), `ksa` (KSA Premium), `zurich` (Switzerland). Your Revizto account owner can
  tell you which region your licences are on; if you are unsure, ask for all the regions your
  organisation uses — extra entries do no harm;
- `cdn.jsdelivr.net` (the charting library).

Admin turnaround is usually the slowest part of the whole install, so send this request now rather than
when you reach Step 5. A missing allowlist entry is the most common silent failure: charts render blank
with no error message.

---

## Steps 4–8 · Install

You have completed the prerequisites. **Continue here at Step 4.**

### Step 4 — Run the task on your computer, not the cloud 🔴

**This is the single most important step.** In Claude, a task runs either **on your computer** or **in
the cloud**. The Blueprint's tools are authorised to its artifact only when the install runs **locally** —
a cloud session can't bind them, and the dashboard will open but show "tools aren't authorised for this
artifact" / "Licence not accessible via MCP".

Open a **new Cowork task** in the Claude desktop app — this is where Steps 5, 7 and 8 happen. Before you
type anything into it:

- Use the **run-location control at the top-right of the Claude window** → choose **"On your computer"**
  (the header then shows a **laptop icon**, not a cloud icon).
- Optional, so you never have to think about it again: **Settings → Cowork → turn OFF "Run new tasks in
  the cloud."**

> **If a check in Step 5 or Step 7 can't see something you just added,** connectors and skills are picked
> up when a session starts. Close that task, open a new one — still on your computer — and ask again.

### Step 5 — Connect the Revizto MCP connector

Add the **Revizto MCP** connector for your region as a **custom connector**, then sign in with your Revizto account (OAuth) and approve the access it asks for. One connection per region; most customers use one.

*(Older versions of this page said "approve **read** access". The Blueprint opens read-only and reads by default, but it does declare one write tool so that the 06 Action surface can work once you deliberately unlock it — see [Trust posture](#trust-posture-the-product-is-the-trust). Approve what the connector requests.)*

In Claude: **Customize → Connectors**. If your organisation manages your Claude account, an owner must add the connector once from **Organization settings → Connectors** before members can add it.

| Field | Value |
|---|---|
| Type / transport | Streamable HTTP (remote MCP server) |
| URL | `https://api.<region>.revizto.com/mcp` — see the region list below |
| OAuth Client ID | `revizto-mcp` |
| OAuth Client Secret | leave blank |

Regions: `virginia` (North America), `canada`, `ireland` (Europe), `london` (UK), `frankfurt` (UAE, hosted in Germany), `saopaulo` (South America), `singapore` (SE Asia), `sydney` (ANZ), `tokyo` (Japan), `ksa` (KSA Premium), `zurich` (Switzerland).

> **Two things on the Revizto side** — these are conditions **(a)** and **(c)** from Step 2, and this is
> the point at which you can act on them.
>
> The **Revizto MCP Server** app must be *activated* for your organisation account. An owner or admin
> does this in Revizto under **Manage account info → Developer portal**; a standard user can only confirm
> it under **Account info → App integrations**.
>
> And if you belong to **several organisation accounts**, one connector sign-in authorises only the
> accounts covered by that authentication method. Authorise the rest in Revizto Workspace → your profile
> → **Active sessions → API**. Skipping this is the single most common reason a licence shows as
> unreadable in the Blueprint.

> ### ⚠️ Had a Revizto MCP connector before 30 July 2026? Re-authorise your account — don't re-add the connector.
>
> The Revizto MCP **OAuth client ID changed to `revizto-mcp`**. What that change reset is the
> **per-account authorisation** — not the connector. Existing connectors kept their id and generally kept
> working; what stops working is a Revizto *account* whose authorisation was granted under the old client
> ID.
>
> **Do this:** in Revizto Workspace → your profile → **Active sessions → API**, re-authorise each
> organisation account. If you have already deployed a Blueprint, press **Re-check** in its MCP Server
> panel afterwards.
>
> **Do not remove and re-add a connector that is still connected.** Re-adding mints a **new** connector
> id, and a deployed Blueprint's tool allowlist is bound to the old one — so re-adding a healthy
> connector causes the exact failure it appears to fix. Re-add **only** a connector that Claude itself
> reports as disconnected (or, if you already have a Blueprint running, one it lists as **"No longer
> registered"**). If you do re-add one, re-run the `project-intelligence-dashboard` skill (Step 8)
> afterwards so the new id is authorised for the artifact.

Confirm the connection before continuing — in the Cowork task you opened at Step 4, ask Claude: *"Check my Revizto MCP connection. Tell me which Revizto account and region you can access, then list the available Revizto tools."*

### Step 6 — Add this repository as a plugin marketplace

**There is no package to download.** The plugin is distributed from this GitHub repository and Claude
fetches it directly — there is no ZIP, no `.plugin` file, and nothing to upload from your computer. The
repository is public and Claude reads it anonymously, so you do not need a GitHub account or any repo
permission.

In Claude: **Directory → Plugins** (the Directory is reached from the Claude sidebar) → the **Personal**
tab → **+ (Add marketplace)** → enter

```
revizto/project-intelligence-blueprint
```

→ turn **"Sync automatically" OFF** → **Sync** → install **revizto-project-intelligence**.

Installing from the **Personal** tab installs it for you alone and needs no Claude admin. The install
detail should list **3 skills**, and the version should read **1.1.0**.

**"Sync automatically" must be off.** Turning it on requires the Claude GitHub App to be installed on the
repository and will fail with `github_repo_not_accessible` — which reads like a permissions problem and
isn't one. With it off, Claude reads the public repository anonymously. You re-sync by hand when a new
version ships.

> **Upgrading, not installing fresh?** Press **Sync** on the existing marketplace entry, then install
> again. If the version still reads the old number, Claude is serving a cached copy — clear the plugin
> cache (see Troubleshooting).

### Step 7 — Enable the plugin's skills 🔴

**Installing the plugin does not enable its skills.** This catches almost everyone. The plugin ships three
skills, but they arrive **switched off**, and the install action lives in one of them — so if you skip this
step, asking Claude to open the Blueprint does nothing useful: the skill never loads, no artifact is
registered, and you are left with either no dashboard at all or a hand-written imitation of one.

Under **Directory → Skills** (or the plugin's own detail pane), find and switch **on**:

- **`project-intelligence-dashboard`** — required. This is the install action.
- `skill-aeco-innovation-revizto` — optional, Revizto platform knowledge.
- `skill-aeco-innovation-revizto-api` — optional, Revizto API / MCP reference.

Only the first is needed to deploy the Blueprint. Confirm it is enabled before continuing — in your Cowork
task, ask Claude *"list your available skills"* and check `project-intelligence-dashboard` appears.

### Step 8 — Open the Blueprint

In your Cowork task (running **on your computer**, plugin installed, skill enabled), say:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

It copies the bundled dashboard verbatim, calls your Revizto read tools, and registers the artifact with those tools authorised. Then: accept the **Terms** ([LICENSE.md](LICENSE.md) — name + tick + Agree), choose your **MCP Server**, and pick your **Licence**.

If Claude instead starts *designing* a dashboard, the skill is not loaded — go back to Step 7. If the
skill **is** switched on and Claude still designs rather than copies a file, don't just repeat Step 7:
follow the matching Troubleshooting row below, which ends in a cache clear and, failing that,
**support@revizto.com**.

---

## After Step 8 — Verify (60 seconds)

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
  Blueprint deployed by an older version — re-run the skill (Step 8).

## Troubleshooting

| Symptom | Fix |
|---|---|
| **I finished the prerequisites — do I start the install at Step 1?** | **No.** The numbering runs straight through 1 to 8. Prerequisites are Steps 1–3; the install continues at **Step 4**. |
| **Where do I download the ZIP / `.plugin` file?** | There isn't one, and you don't need a GitHub account. Claude fetches the plugin from the public repository when you add it as a marketplace (Step 6). |
| **"Tools aren't authorised for this artifact" / "Licence not accessible" / "No projects"** — even after a clean install | You ran the install **in the cloud**. Re-run it **on your computer** (Step 4). This is the usual cause. |
| Marketplace add fails: `github_repo_not_accessible` / "Automatic sync on push requires the Claude GitHub App…" | "Sync automatically" was left **on**. This is not a permissions problem — the repository is public. Remove the entry and re-add with the toggle **OFF** (Step 6). |
| Adding the marketplace says it needs **admin** | You're on the **Organization** tab. Use the **Personal** tab (Step 6) — that's per-user, no admin. (Org-wide push is admin-only; see [Admin / org-wide rollout](#admin--org-wide-rollout).) |
| Plugin stuck on an old version after re-sync | Cache — clear it: quit Claude, then `chflags -R nouchg ~/.claude/plugins 2>/dev/null; rm -rf ~/.claude/plugins/cache ~/.claude/plugins/marketplaces/revizto`, reopen, re-add. On Windows delete the `cache` and `marketplaces\revizto` folders under `%USERPROFILE%\.claude\plugins\`. |
| Asking Claude to open the Blueprint does nothing, or it starts **writing/designing** a dashboard | The `project-intelligence-dashboard` skill is not enabled — do Step 7. Installing the plugin does not enable its skills. If the skill *is* enabled and Claude still designs rather than copies a file, the plugin is stale or partially installed: clear the plugin cache (row above), re-sync, re-enable, then open a **new** Cowork task and re-run. If it still happens, email **support@revizto.com** with your plugin version and the exact wording Claude replied with. |
| Skills list is empty, or Step 7 has nothing to switch on (Team/Enterprise) | **Skills** is not enabled for your organisation. It is a separate Owner toggle from Cowork (Step 1) — ask your Claude Owner to enable both. |
| Nothing here matches | Email **support@revizto.com** with your plugin version, the build stamp from the Blueprint's About panel, your region, and what you saw. |
| "Snapshot · demo data" (fictional "Riverside Medical Centre") | Not running inside a Cowork artifact created by the install skill. |
| "Revizto MCP not connected" | No Revizto MCP connector is reachable in this session — add or sign in to the connector (Step 5), then Refresh. |
| Licence picker empty / a licence missing | Check the **MCP Server** panel first — the licence may live on a different server than the one selected. The Blueprint names the cause against each server: Revizto MCP not enabled in the Developer Portal, insufficient licence role, needs sign-in, or not authorised for this artifact. |
| A licence sits under **Not readable** | Read the stated reason, which maps to the three conditions in Step 2. "Your role on this licence can't read it via the MCP" is **(b)** — you need Administrator or Owner. "This account isn't authorised for MCP yet" is **(a)** or **(c)** — see the row below. "Lives on a different regional server" means switch server in the MCP Server panel. Unreadable licences stay listed deliberately, so you can see the whole estate and what would need changing. |
| A licence shows **"This account isn't authorised for MCP yet"** | Two causes, self-service first: authorise that organisation account from Revizto Workspace → your profile → **Active sessions → API**, then press **Re-check**. One connector sign-in only covers accounts on that authentication method. If it still fails, the **Revizto MCP Server** app isn't activated on that account — an owner or admin activates it under **Manage account info → Developer portal**. |
| Connections that worked before 30 July 2026 now fail | The Revizto MCP OAuth client ID changed to `revizto-mcp`, which resets **per-account authorisation**. Re-authorise each account (Revizto Workspace → profile → **Active sessions → API**), then press **Re-check** (Step 5). **Do not remove and re-add a connector that is still connected** — that mints a new connector id and breaks the deployed artifact's tool allowlist, causing the failure it looks like it should fix. |
| A server is listed as **"No longer registered"** | That connector really has gone from Claude. Re-add it (Step 5), then re-run the `project-intelligence-dashboard` skill (Step 8) so the new connector id is authorised for the artifact. |
| A project you expect isn't in the picker | It is archived or frozen — turn on **Include archived** in the project picker. Both are excluded by default since 1.0.1 because an archived project often carries the most recent activity date and was being picked as the default. |
| Footer build stamp is older than `2026-07-30.2` | The deployed artifact predates the plugin update. Re-run the `project-intelligence-dashboard` skill (Step 8) — updating the plugin never rewrites an already-deployed Blueprint. |
| Blank charts, no error (Team/Enterprise) | A connector domain or `cdn.jsdelivr.net` isn't allowlisted — ask your Claude admin (Admin settings → Capabilities), see Step 3. |
| I added a second region's connector after installing | Re-run the `project-intelligence-dashboard` skill (Step 8) so the new connector is written into the Blueprint's server list and authorised for the artifact. |

**What re-running Step 8 costs you.** It deploys a fresh artifact, so Terms acceptance, your licence and
project selections, and the learned prompt chips are reset. Nothing in Revizto is touched. Re-run when
you have changed connectors or upgraded from 1.0.0/1.0.1 — not routinely.

Every tool call inherits your own Revizto role and project membership — the dashboard can't see or do anything you can't do in Revizto itself.

---

# Reference

Everything below is background and advanced configuration — not needed for a standard install.

## How it works: two gates

For the Blueprint to read your data, **both** must be open, and they're independent:

1. **Connector gate** — the Revizto MCP connector is connected and signed in (Step 5).
2. **Artifact tool gate** — the dashboard artifact's own `mcp_tools` allowlist authorises the read tools. Connecting the connector does **not** fill this; only the install skill's `create_artifact` does, and only when run **locally** (Step 4). This is why a cloud install, or copying the HTML file out of the plugin and opening it yourself, produces a dashboard that can't read.

## The six views

`01 Morning brief` · `02 Project checklist` · `03 Cross-project intelligence` · `04 Coordination analytics` · `05 Ask anything` · `06 Action anything` (the plain-language write surface — disabled while read-only is on, which is the default every session; toggle the header pill off to enable it).

## MCP Region & Licensing

- Every Revizto **region** is a separate MCP connection. Add one connector per region you use (most customers use one).
- The Blueprint is **server-first**: you choose which Revizto MCP server it reads from in the **MCP Server** panel, and the licences and projects you see come from that server alone. Each connected server is one row, named as you named the connector in Claude; unusable servers are greyed with the reason stated. The panel also hosts **Re-check all** and **Add connector**.
- Internally each connection is identified by its tool **prefix** (`mcp__<connector-id>__`), which is per-user. The install skill reads yours and writes it in for you — you never need to find it by hand. If you ever want to see it, ask Claude in-session: *"list the Revizto MCP tool names you can call"*; the leading `mcp__…__` segment is the prefix.

## Configuration (deploy-time constants)

**You do not need this for a normal install** — the install skill sets all of it. It is documented so you
can see exactly what gets written on your behalf. The file is `assets/dashboard.html` inside the installed
plugin; the skill copies it and edits one line. Editing your own copy and opening it directly will *not*
work — see "two gates" above.

| Constant | This build | Meaning |
|---|---|---|
| `connectors` | `[]` (skill fills it) | one entry per connected region: `{prefix, env, wsHost, missing}`. |
| `readOnly` | `false` | **not** "writes are on by default". The Blueprint always *opens* read-only and re-asserts it whenever the artifact is reopened; this constant governs whether the user is allowed to toggle that off. `false` = the toggle works. Set `true` to hard-lock read-only and disable the 06 write surface entirely. |
| `tcsVersion` | `"1.1"` | Terms version (`1.1` published the canonical Terms link). Bumping it re-prompts acceptance on every connection. |
| `buildStamp` | `"2026-07-30.2"` | shown in About / Terms footer for support. Unchanged since 1.0.2 — neither 1.0.3 nor 1.1.0 altered the artifact. |

What the skill writes for a single region:
```js
const CONFIG={connectors:[
  {prefix:"mcp__<connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:false,tcsVersion:"1.1",buildStamp:"2026-07-30.2"};
```
Two regions: a second `{prefix…}` entry. Each region's connector domain also needs the admin allowlist (Step 3).

## Admin / org-wide rollout

Steps 1–8 are **per-user (Personal)**. Pushing the Blueprint to an **entire organisation** centrally —
installed-by-default or required for all members — is a **Team/Enterprise Owner** action under
**Organization settings → Plugins**.

**Before anything else: Cowork *and* Skills must be enabled for the organisation** (a one-time Owner
toggle). Without both, no plugin works and members' Personal installs appear blocked for no reason.

There are two ways to set up an organisation marketplace, and only one of them works for this repository:

- **GitHub-synced — not available here.** Claude requires an organisation GitHub-synced marketplace to
  point at a *private* repository. This repository is public, which is precisely what lets the per-user
  install at Step 6 work with no GitHub account. Those two cannot be satisfied from one repo.
- **Manual upload — this is the path to use.** An organisation marketplace also accepts a plugin uploaded
  as a `.zip` through the admin UI, and that route does not care about repository visibility. Download
  this repository as a ZIP from GitHub and upload it as the plugin. From there the Owner gets the full
  set of controls — installed by default, required for all members, or scoped to specific groups.

  *This is the Owner packaging the public repo themselves. Revizto does not distribute a plugin file, and
  individual users never need one — Steps 1–8 remain the per-user path.*

Either way, members still complete Steps 1–5 themselves: the Revizto MCP connector is a per-user OAuth
connection, and an org-installed plugin does not create it. On Team/Enterprise the Step 3 network
allowlist is also an admin task.

See Anthropic's [Manage plugins for your organization](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization) for the admin UI and the group-scoping options.

## Trust posture (the product is the trust)

- **Count-first exact layer** — headline totals are exact; anything sampled is labelled "sample of N of M".
- **Live, never cached** — cache-busted reads, per-call timeouts, honest failure states, full reset on every licence/project/connection switch; sequence-guarded loaders.
- **Read-only by default; writes behind an explicit toggle + a full approval gate.** Opens read-only every session and re-asserts on re-show. Turning the pill off enables 06 Action; every write then runs count-first targeting → diff + sample preview → name + reason approval → audit note → reversible; staged jobs are connection-stamped. The artifact allowlist declares the nine read tools **plus `update_issues`** (never invoked except by a user-approved action). To ship a hard read-only build: `readOnly:true` + omit `update_issues` at install.
- **Your session, your permissions** — all calls run through your own authenticated MCP session; `whoami` is never declared.
- **Consent precedes access** — no live data until the [Terms](LICENSE.md) are accepted (recorded on-device, per connection).
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
README.md · CONNECTORS.md · SKILLS-MANIFEST.md · CHANGELOG.md
LICENSE.md                         the Revizto Custom Licence — also the in-app Terms text
```

## Known open items

- **Org-wide rollout works only by manual ZIP upload** — organisation *GitHub-synced* marketplaces
  require a private repository, and this one is public so that the per-user install needs no GitHub
  account. An Owner can still upload the repo as a ZIP to an org marketplace, but that copy does not
  auto-update. A private mirror would restore syncing at the cost of the anonymous per-user install.
- **"Active sessions → API" needs a screenshot.** The self-service account authorisation is the most
  common fix in this document and the hardest to follow, because the Revizto screen is named for
  sessions rather than authorisation. Pending a walkthrough in Revizto's own help.
- **Scope of the client-ID change** — confirmed on 30 July 2026 that existing connector ids survived it
  and production connections continued to authenticate, which is the basis for the re-authorise guidance
  at Step 5. Awaiting Revizto dev confirmation that this holds for every account and region.
- **Artifact-runtime prefix form** — the dashboard routes by the per-user `mcp__<id>__` prefix; record the
  exact form seen on the first native install. Secondary to the tool gate.

## Licence

**The Revizto Custom Licence — [LICENSE.md](LICENSE.md).** That file is the single governing document and
the authority; this line deliberately does not restate it. In short, and without qualifying it: the
Blueprint is an experimental demonstration made available for your own internal evaluation and
experimentation, not for production, commercial or third-party-facing use, and not to be redistributed.

**This replaced the MIT Licence at version 1.1.0.** Every release before 1.1.0 carries the MIT Licence,
and that grant stands for copies obtained under it — the change applies going forward and does not reach
back and withdraw rights already granted for earlier copies, including existing clones and forks. The
Terms previously published separately as `TERMS.md` are now this file; there is one licence document, not
two.

Note that the published tags `v1.0.0`, `v1.0.1` and `v1.0.2` remain exactly as released: MIT-licensed, and
still carrying both `LICENSE.md` and `TERMS.md`. They are not being rewritten.

Copyright © 2026 Revizto SA.
