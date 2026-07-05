# Connectors

## Required connector

This plugin needs the **Revizto MCP** connector. It is a directory connector with a dynamic, per-region endpoint, so `.mcp.json` references it **by name** (name-match is treated the same as a URL match).

| Category | Server name in `.mcp.json` | Notes |
|---|---|---|
| Revizto MCP (project data) | `Revizto MCP` | The production directory-entry name for the installer's region. |

Auth is OAuth 2.1 PKCE against the regional Revizto API; the user signs in on connect. The dashboard's reads are **read-only** by default; the write tool (`update_issues`) is inert while `CONFIG.readOnly` is `true`.

## Regional endpoints

The MCP authenticates against the *regional* Revizto API. A customer in any region connects their regional MCP entry and the dashboard follows — there is no region binding in the dashboard itself (region shown in AI context is derived from the connected project's metadata).

## Admin network allowlist (Team/Enterprise)

Allow the Revizto MCP connector domain(s) and `cdn.jsdelivr.net` (Chart.js). Fonts are embedded in the dashboard — no font CDN required. A missing allowlist entry is the most common silent install failure.
