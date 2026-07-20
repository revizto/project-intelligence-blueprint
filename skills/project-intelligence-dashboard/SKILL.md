---
name: project-intelligence-dashboard
description: >
  This skill should be used when the user wants to "open the Revizto dashboard",
  "set up project intelligence", "show my Revizto projects", "open the Project
  Intelligence Blueprint", or just installed the Revizto Project Intelligence plugin
  and needs the dashboard created. It deploys the live, read-only Project Intelligence
  Blueprint as a Cowork artifact that discovers the installing user's own Revizto
  licences (across every connected region) and most-recently-active project.
metadata:
  version: "1.0.0-rc.3"
---

# Project Intelligence Blueprint — install action

Deploy the Revizto Project Intelligence Blueprint as a live Cowork artifact for the user.
The build is **licence-first**: the user picks a *licence*, never a connector or region. The
dashboard probes every configured Revizto MCP connection, aggregates the licences the user can
see into one picker ("Licence name — Region"), and resolves the serving connection automatically.

## When this runs

Trigger on first install of the plugin, or when the user asks to open / set up / re-create the
dashboard.

## Steps

1. **Confirm a Revizto MCP connector is connected.** If `callMcpTool` is unavailable, tell the
   user to add the **Revizto MCP** connector for their region (Settings → Connectors) and approve
   read-only tool access, then stop. The dashboard will still open in this state — it shows a calm
   "Connect the Revizto MCP Server to enable live project intelligence" first-run panel rather than
   an error — but it has nothing live to read until a connection exists.

2. **Read the bundled dashboard HTML** at
   `${CLAUDE_PLUGIN_ROOT}/skills/project-intelligence-dashboard/assets/dashboard.html`.
   It is a self-contained artifact: embedded fonts, Chart.js via the allowed CDN, no hardcoded
   licence/project IDs. It discovers the user's own licences and most-recently-active project at
   runtime.

3. **Populate `CONFIG.connectors` — one entry per connected Revizto MCP region.** Near the top of
   the inline script the release ships an **empty** connector set:

   ```js
   const CONFIG={connectors:[
   ],readOnly:true,tcsVersion:"1.0",buildStamp:"..."};
   ```

   For **each** Revizto MCP connection the user has added to this AI tool, read its actual tool
   prefix from the connected tool names visible in this session — the leading `mcp__<connector-id>__`
   segment (e.g. `mcp__1a2b3c4d-…__list_licenses` → prefix `mcp__1a2b3c4d-…__`). Add one entry:

   ```js
   connectors:[
     {prefix:"mcp__<connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
     // …one line per connected region; any subset works
   ]
   ```

   Do **not** guess the id — read the real prefix from the session. One entry behaves exactly like a
   single-region build (no extra UI); several add a Connections ⓘ health panel. Regions and labels
   are **not** baked in — the app derives each licence's region from Revizto at runtime, so you never
   set a region here. `missing:[]` lists any read tools a given region's MCP build does not expose
   (leave empty unless you know a specific gap). See `CONNECTORS.md` for finding the connector id.

4. **Create the Cowork artifact** from that HTML (`create_artifact`), id
   **`revizto-project-intelligence-blueprint`**, declaring for **each** connected connector the read
   tools listed below (each tool prefixed with that connector's own `mcp__<connector-id>__`). Do
   **not** enable write tools — this build ships `readOnly:true`.

   > **This declaration is load-bearing.** The `mcp_tools` you declare here become the artifact's
   > tool allowlist — the gate the Cowork runtime checks on every call. If it is empty the dashboard
   > can't read anything and shows "tools aren't authorised for this artifact." Connecting the
   > connector does **not** fill this allowlist; only this `create_artifact` declaration does, and it
   > only takes effect when run natively in a Cowork session with the plugin installed (the cloud/remote
   > artifact path cannot declare `mcp_tools`). So this skill must run from an installed plugin.

5. **Tell the user the Blueprint is open.** On first live load it presents the Terms & Conditions
   gate (acceptance is recorded per connection, on-device); after they accept, it aggregates their
   licences into the picker and lands on their most-recently-active project. Point them at the
   in-product **About · Terms · Tour** for data handling and a guided walkthrough.

## Read tools the dashboard uses (declare exactly these, per connector prefix)

list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates,
list_license_members, list_project_members, list_workflows, list_issues.

`update_issues` (the 06 Action write surface) stays **off** in this build (`CONFIG.readOnly:true`);
enabling it per engagement is a deploy-time decision requiring governance sign-off — writes are
count-first-targeted, previewed, approval-gated and reversible. Do not declare `whoami` (excluded by
design; "me/my" in 06 resolves to an explicitly chosen user).
