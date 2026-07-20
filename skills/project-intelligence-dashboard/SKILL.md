---
name: project-intelligence-dashboard
description: >
  This skill should be used when the user wants to "open the Revizto dashboard",
  "set up project intelligence", "show my Revizto projects", "open the Project
  Intelligence Blueprint", or just installed the Revizto Project Intelligence plugin
  and needs the dashboard created. It deploys the pre-built, read-only Project
  Intelligence Blueprint (a fixed, self-contained HTML file bundled with this plugin)
  as a Cowork artifact, pointed at the installing user's own Revizto licences.
metadata:
  version: "1.0.0-rc.5"
---

# Project Intelligence Blueprint — install action

Deploy the **pre-built** Revizto Project Intelligence Blueprint as a live Cowork artifact.

## 🚫 CRITICAL — deploy the bundled file verbatim. Do NOT build a dashboard.

The Blueprint is a **finished, approved artifact**: a single self-contained HTML file
(`assets/dashboard.html`, ≈ 879 KB, ≈ 3,857 lines) that ships inside this plugin. Your entire
job is to **copy that exact file** and **insert the user's connector prefix into one line**, then
register it as an artifact.

You must **NOT**, under any circumstances:

- author, write, generate, re-create, "rebuild", redesign, or improve a dashboard;
- summarise the file and reproduce it from memory;
- change the layout, styles, scripts, views, or any HTML/JS other than the single `CONFIG.connectors` line described below.

If you find yourself *writing HTML/CSS/JS for a dashboard*, stop — you are doing the wrong thing.
The correct action is a **byte-for-byte file copy** plus one tiny edit. A regenerated dashboard is
an automatic failure.

## Steps

**1 — Confirm a Revizto MCP connector is connected.** If `callMcpTool` is unavailable, tell the user
to add the **Revizto MCP** connector for their region (Settings → Connectors) and approve read-only
tool access, then stop. (The Blueprint still opens without one — it shows a calm "Connect the Revizto
MCP Server" first-run panel — but has nothing live to read.)

**2 — Copy the bundled dashboard verbatim into your scratch workspace.** Do not open it to reproduce
it — just copy it:

```bash
cp "$CLAUDE_PLUGIN_ROOT/skills/project-intelligence-dashboard/assets/dashboard.html" ./pi-blueprint.html
wc -c ./pi-blueprint.html   # sanity check: expect ~879000 bytes. If it's a few KB, you have the wrong file — do not proceed.
```

(If `$CLAUDE_PLUGIN_ROOT` isn't set in this environment, locate the plugin's
`skills/project-intelligence-dashboard/assets/dashboard.html` on disk and copy that. Never substitute
a hand-written file.)

**3 — Make EXACTLY ONE edit: insert the connector prefix(es) into `CONFIG.connectors`.** Near the top
of the copied file the connector array ships empty:

```js
const CONFIG={connectors:[
 /* Add ONE entry per Revizto MCP connection ... */
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-20.1"};
```

Read the installer's actual Revizto MCP tool prefix from the connected tool names in this session —
the leading `mcp__<connector-id>__` segment (e.g. `mcp__1a2b3c4d-…__list_licenses` → prefix
`mcp__1a2b3c4d-…__`). For **each** connected Revizto region, add one entry, so the array becomes:

```js
const CONFIG={connectors:[
  {prefix:"mcp__<connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
],readOnly:true,tcsVersion:"1.0",buildStamp:"2026-07-20.1"};
```

Use a single targeted find-and-replace on that one region. **Do not touch anything else in the file** —
no reformatting, no other edits. Read the real prefix; never guess it. (If you genuinely cannot obtain
a prefix, you may leave `connectors:[]` and deploy anyway — the Blueprint will show the connect CTA —
but it won't load live data, so prefer inserting the prefix.)

**4 — Register the artifact from the copied file.** Call `create_artifact` with:

- `id`: **`revizto-project-intelligence-blueprint`** (reuse this exact id; never invent a new one).
- `html_path`: the path to your copied `./pi-blueprint.html` (the file from steps 2–3 — **not** any newly authored file).
- `mcp_tools`: for **each** connected connector prefix, the nine read tools below (each fully-qualified with that `mcp__<connector-id>__` prefix). This declaration is what populates the artifact's tool allowlist — the gate that lets the dashboard read live data. Do **not** include `update_issues` (this build ships `readOnly:true`) and do **not** include `whoami`.

**5 — Verify you deployed the real thing (mandatory).** After creating, confirm the artifact is the
bundled Blueprint, not a regeneration:

- the deployed HTML is ≈ 879 KB / ≈ 3,857 lines (a dashboard you "built" will be far smaller);
- it contains `buildStamp:"2026-07-20.1"` and the six-view chrome (panel ids incl. `panel-issues`,
  `panel-health`, `panel-compare`, `panel-ask`).

If the size is wildly off or these markers are missing, you regenerated it — **discard and redo from
step 2 by copying the file.**

**6 — Hand off to the user.** Tell them the Blueprint is open; on first live load it shows the Terms
gate (accept to proceed), then a licence picker; it lands on their most-recently-active project. Point
them at the in-product **About · Terms · Tour**.

## Read tools to declare (per connected connector prefix)

list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates,
list_license_members, list_project_members, list_workflows, list_issues.

`update_issues` (the 06 Action write surface) stays **off** in this build (`CONFIG.readOnly:true`).
`whoami` is intentionally excluded ("me/my" in 06 resolves to an explicitly chosen user).
