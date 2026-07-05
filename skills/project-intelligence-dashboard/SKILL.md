---
name: project-intelligence-dashboard
description: >
  This skill should be used when the user wants to "open the Revizto dashboard",
  "set up project intelligence", "show my Revizto projects", "run the project
  intelligence showcase", or just installed the Revizto Project Intelligence plugin
  and needs the dashboard created. It deploys the live, read-only Project Intelligence
  dashboard as a Cowork artifact pointed at the installing user's own discovered
  Revizto licence and project.
metadata:
  version: "1.0.0-rc.1"
---

# Project Intelligence Dashboard — install action

Deploy the Revizto Project Intelligence dashboard as a live Cowork artifact for the user.

## When this runs

Trigger on first install of the plugin, or when the user asks to open / set up / re-create the dashboard.

## Steps

1. Confirm the Revizto MCP connector is connected. If `callMcpTool` is unavailable, tell the user to connect the **Revizto MCP** connector (their region) and approve read-only tool access, then stop.
2. Read the bundled dashboard HTML at `${CLAUDE_PLUGIN_ROOT}/skills/project-intelligence-dashboard/assets/dashboard.html`. It is a self-contained artifact: embedded fonts, Chart.js via the allowed CDN, no hardcoded licence/project IDs — it discovers the user's own licence and most-recently-active project at runtime.
3. **Reconcile the connector prefix.** The dashboard calls tools via `CONFIG.server` (an `mcp__<connector>__` prefix near the top of the inline script). Determine the installer's actual Revizto MCP tool prefix (from the connected tool names visible in the session) and, if it differs, rewrite the `CONFIG.server` value in the HTML before creating the artifact. Do not guess — read the real prefix.
4. Create the Cowork artifact from that HTML (`create_artifact`), id `revizto-project-intelligence-showcase`, declaring only the read tools listed below. Do **not** enable write tools — this build ships `readOnly:true`.
5. Tell the user the dashboard is open and will load their own project automatically; point them at the in-product "About / Trust" panel for data handling.

## Read tools the dashboard uses (declare exactly these)

list_licenses, list_projects, list_sheets, list_clash_tests, list_stamp_templates,
list_license_members, list_project_members, list_workflows, list_issues.

`update_issues` (the 06 Action write surface) stays **off** in this build (`CONFIG.readOnly:true`);
enabling it per engagement requires governance sign-off — writes are count-first-targeted,
previewed, approval-gated and reversible.
