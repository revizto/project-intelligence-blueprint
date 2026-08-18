# Revizto Project Intelligence Blueprint

Live project intelligence over the **Revizto MCP Server**, delivered as a Claude Cowork artifact.

It follows one explicit path: **MCP Server → Licence → Project.** Each Revizto MCP server you connect is
its own connection, named as you named it in Claude. You choose which server the Blueprint reads from,
and every licence and project you see comes from that one server — nothing is merged across servers and
nothing is guessed on your behalf.

Headline totals are exact, taken from Revizto's own counts. Detailed panels are drawn from a sample and
always labelled "N of M". Nothing is cached or bundled: every figure is read live, and where there is
nothing to read the Blueprint says so rather than showing anything else.

The Blueprint **opens read-only every session**. Read-only is a toggle you control — switch it off and
the write surface becomes available, so you can push reassignments, status changes and more into your
Revizto project. Every write runs count-first targeting, a diff preview, and an explicit approval step.

**Status:** `v1.0.3` (build `2026-08-18.1`). Version history in [CHANGELOG.md](CHANGELOG.md).

> ### Upgrading? Re-run the install skill.
>
> Updating the plugin does **not** update a Blueprint you have already deployed — the artifact still
> contains the code it was built from. Re-run the `project-intelligence-dashboard` skill (Step 5).
>
> **1.0.3 adds two tool authorisations per server**, so you will be asked to approve them:
> `list_accounts`, without which no licence can be discovered at all, and `update_issues` for the write
> surface.

---

# Install

Five steps, per-user, **no Claude admin required**.

### Prerequisites

- **Claude desktop app with Cowork.** The Blueprint runs as a Cowork artifact — not in a plain chat and
  not on claude.ai.
- **A Revizto licence the MCP Server accepts.** Three things must all be true: the Revizto MCP Server app
  is activated on the organisation account, your licence role is Administrator or Owner, and that account
  is authorised for your connector. The Blueprint verifies each licence with a real call and tells you
  which one is missing.
- **(Team/Enterprise only) Admin network allowlist** — your Claude admin allows the Revizto MCP connector
  domain(s) and `cdn.jsdelivr.net` under **Admin settings → Capabilities**.

### Step 1 — Run this task on your computer, not the cloud 🔴

**The single most important step.** A Claude task runs either on your computer or in the cloud. Reading
your data needs two independent gates open: the connector must be signed in (Step 2), *and* the artifact's
own tool allowlist must authorise the tools. Only the install skill fills that second gate, and only when
it runs **locally** — a cloud session cannot bind it, and the dashboard opens but shows "tools aren't
authorised for this artifact".

Use the run-location control at the top-right of the Claude window → **"On your computer"** (the header
then shows a laptop icon, not a cloud icon). To make it the default: **Settings → Cowork → turn off "Run
new tasks in the cloud."**

### Step 2 — Connect the Revizto MCP connector

Add the **Revizto MCP** connector for your region as a custom connector under **Customize → Connectors**,
then sign in with your Revizto account and approve the tool access it requests. One connector per region;
most customers use one. If your organisation manages your Claude account, an owner must add the connector
once from **Organization settings → Connectors** before members can add it.

| Field | Value |
|---|---|
| Type / transport | Streamable HTTP (remote MCP server) |
| URL | `https://api.<region>.revizto.com/mcp` |
| OAuth Client ID | `revizto-mcp` |
| OAuth Client Secret | leave blank |

Regions: `virginia` (North America), `canada`, `ireland` (Europe), `london` (UK), `frankfurt` (UAE, hosted
in Germany), `saopaulo` (South America), `singapore` (SE Asia), `sydney` (ANZ), `tokyo` (Japan), `ksa`
(KSA Premium), `zurich` (Switzerland).

> **If you belong to several Revizto organisation accounts**, one connector sign-in authorises only the
> accounts covered by that sign-in. Authorise the rest from Revizto Workspace → your profile →
> **Active sessions → API**. This is the most common reason a licence shows as unreadable. The Blueprint
> lists every account it could not use, with Revizto's own explanation against each.

Confirm before continuing — ask Claude: *"Check my Revizto MCP connection. Which Revizto account and
region can you access?"*

### Step 3 — Install the plugin

**Add the marketplace by URL.** **+** → `revizto/project-intelligence-blueprint` → turn **"Sync
automatically" off** → **Sync** → install **revizto-project-intelligence**.

**Or upload the package.** If you were supplied `revizto-project-intelligence-v1.0.3.plugin` (also
attached to the GitHub release), use **Directory → Plugins → Personal → Local uploads**. No repository
access needed.

Either way the install detail should list **3 skills** at version **1.0.3**.

> **Upgrading?** Remove the old entry before installing the new one, or Claude keeps serving the cached
> version.

### Step 4 — Enable the plugin's skills 🔴

**Installing the plugin does not enable its skills.** They arrive switched off, and the install action is
one of them — so skipping this step means asking Claude to open the Blueprint does nothing.

Under **Directory → Skills**, switch on:

- **`project-intelligence-dashboard`** — required. This is the install action.
- `skill-aeco-innovation-revizto` — optional, Revizto platform knowledge.
- `skill-aeco-innovation-revizto-api` — optional, Revizto API and MCP reference.

Confirm with *"list your available skills"* before continuing.

### Step 5 — Open the Blueprint

In a Cowork session running on your computer, say:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

It copies the bundled dashboard, calls your Revizto tools, and registers the artifact with those tools
authorised. Then accept the **Terms**, choose your **MCP Server**, and pick your **Licence**.

If Claude starts *designing* a dashboard instead, the skill is not enabled — go back to Step 4.

### Verify

- The status pill reads **live**.
- The **MCP Server** control names the server you are reading from. Each row shows its licence count, and
  any accounts it could not use are summarised on one line you can expand.
- The **Licence** picker groups licences into **Readable**, **Checking…** and **Not readable**, with a
  reason against every unreadable one.
- The project picker lists live projects only; archived and frozen work appears under **Include
  archived**, tagged when it does.
- **06 Action anything shows a padlock on first load.** Correct — toggle the **Read-only** pill off to
  enable writes.
- About / footer reads build **`2026-08-18.1`**.

### Troubleshooting

| Symptom | Fix |
|---|---|
| "Tools aren't authorised for this artifact" / "Licence not accessible" / no projects | You ran the install **in the cloud**. Re-run it on your computer (Step 1). This is the usual cause. |
| Asking Claude to open the Blueprint does nothing, or it starts **designing** one | The `project-intelligence-dashboard` skill is not enabled (Step 4). It should copy a file, never author one. |
| Build stamp older than `2026-08-18.1` | The deployed artifact predates the plugin update. Re-run the skill (Step 5). |
| Marketplace add fails: `github_repo_not_accessible`, or a prompt about the Claude GitHub App | "Sync automatically" was left **on**. Remove the entry and re-add with it off (Step 3). |
| Adding the marketplace says it needs **admin** | You are on the **Organization** tab. Use **Personal** — per-user, no admin. |
| Plugin stuck on an old version after reinstall | Cache. Quit Claude, then `chflags -R nouchg ~/.claude/plugins 2>/dev/null; rm -rf ~/.claude/plugins/cache ~/.claude/plugins/marketplaces/revizto`, reopen and re-add. On Windows: `%USERPROFILE%\.claude\plugins\`. |
| A licence sits under **Not readable** | Read the stated reason. A role problem needs Administrator or Owner. "This account isn't authorised for MCP yet" is fixed under Step 2. "Lives on a different regional server" means switch server in the MCP Server panel. Unreadable licences stay listed deliberately, so you can see the whole estate. |
| Licence picker empty, or a licence missing | Check the **MCP Server** panel first — the licence may live on another server, or its account may be one of the unavailable ones listed against that server. |
| A server lists accounts it could not use | Expand the line for Revizto's explanation per account. Usually the Revizto MCP Server app is not activated on that account (an owner or admin does this under **Manage account info → Developer portal**), or the account is not covered by your connector sign-in (Step 2). |
| A project you expect isn't listed | It is archived or frozen — turn on **Include archived**. |
| Connector fails, or shows "no longer registered" | Re-add it with client ID `revizto-mcp` and a blank secret (Step 2), then re-run the skill — re-adding mints a new connector id and the artifact's allowlist is bound to the old one. As a stopgap you can paste the new id into the **Add** box in the MCP Server panel and press **Re-check**, but only a re-run restores the allowlist. |
| Blank charts, no error (Team/Enterprise) | A connector domain or `cdn.jsdelivr.net` is not allowlisted — ask your Claude admin. |
| Opened the HTML file directly and it shows only a connect prompt | Expected. The Blueprint has no bundled or sample data; outside Cowork there is nothing to read. |

Every call inherits your own Revizto role and project membership — the Blueprint cannot see or do
anything you cannot do in Revizto itself.

---

# Reference

## The six views

`01 Morning brief` · `02 Project checklist` · `03 Cross-project intelligence` · `04 Coordination
analytics` · `05 Ask anything` · `06 Action anything` — the write surface, disabled while read-only is on.

## Configuration

One `CONFIG` object at the top of `dashboard.html`:

| Constant | Ships as | Meaning |
|---|---|---|
| `connectors` | `[]` | One entry per connected region, `{prefix, env, wsHost, missing}`. The install skill fills this with your own `mcp__<connector-id>__` prefixes; connections can also be added at runtime from the MCP Server panel. |
| `readOnly` | `false` | The Read-only pill is a live per-session toggle. The Blueprint opens read-only regardless; this constant only controls whether the toggle can be turned off. Set `true` to hard-lock read-only and disable writes entirely. |
| `tcsVersion` | `"1.1"` | Terms version. Bumping it re-prompts acceptance on every connection. |
| `buildStamp` | `"2026-08-18.1"` | Shown in About and the Terms footer, for support. |

## Trust posture

- **Nothing is skipped silently.** Accounts the MCP cannot use, and accounts that accept the request then
  refuse the read, are both listed against their server in Revizto's own wording.
- **Live, never cached.** Cache-busted reads, per-call timeouts, honest failure states, and a full reset
  on every licence, project or server switch. No bundled, sample or demonstration data exists in the build.
- **Your session, your permissions.** All calls run through your own authenticated MCP session. `whoami`
  is never declared.
- **Consent precedes access.** No live data until Terms are accepted, recorded on-device, per connection.
- **AI answers (05 Ask)** send only the derived figures needed; project data is not stored server-side.

Tool allowlist, per connector: `list_accounts, list_licenses, list_license_members, list_projects,
list_project_members, list_workflows, list_issues, list_sheets, list_clash_tests, list_stamp_templates`
plus `update_issues`, which is only ever invoked by a write you have approved.

## Org-wide rollout

Per-user installs need no admin. To push the Blueprint to an entire organisation, a Team/Enterprise Owner
uses **Organization settings → Plugins**, with Cowork and Skills enabled for the org first. See
[Manage plugins for your organization](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization).

## Repository layout

```
.claude-plugin/plugin.json         plugin manifest
.claude-plugin/marketplace.json    one-plugin marketplace
skills/
  project-intelligence-dashboard/  install action + assets/dashboard.html
  skill-aeco-innovation-revizto/       Revizto platform knowledge
  skill-aeco-innovation-revizto-api/   Revizto API / MCP reference
CHANGELOG.md · CONNECTORS.md · SKILLS-MANIFEST.md · TERMS.md · LICENSE.md
```

## Licence

See [LICENSE.md](LICENSE.md).
