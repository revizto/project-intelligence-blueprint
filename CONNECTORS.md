# Connectors

## Required connector

This plugin needs the **Revizto MCP** connector. It is a directory connector with a dynamic, per-region endpoint, so `.mcp.json` references it **by name** (name-match is treated the same as a URL match).

| Category | Server name in `.mcp.json` | Notes |
|---|---|---|
| Revizto MCP (project data) | `Revizto MCP` | The production directory-entry name for the installer's region. |

Auth is OAuth 2.1 PKCE against the regional Revizto API; the user signs in on connect. The dashboard's reads are **read-only** by default; the write tool (`update_issues`) is inert while `CONFIG.readOnly` is `true`.

## Regional endpoints (multi-region, WS20)

The MCP authenticates against the *regional* Revizto API — **each Revizto region is a separate MCP connector**. The dashboard binds regions in a deploy-time registry: `CONFIG.servers` in `dashboard.html` maps a region key → that region's connector prefix (`mcp__<your-connector-id>__`) + the workspace host for issue deep-links.

- **Single region (most installs):** keep one entry, set its `prefix` to your connector id. No region UI appears.
- **Multi-region estates:** add one entry per region your organisation uses (each with its own connector id). A Region dropdown appears in the toolbar; switching regions fully resets state, re-locks read-only, and re-runs the T&C acceptance for that region.
- Licences are regional: a licence unreachable from a region's MCP reports its actual cause (account authorisation, licence role, or wrong-region) rather than failing silently.

## Admin network allowlist (Team/Enterprise)

Allow the Revizto MCP connector domain(s) and `cdn.jsdelivr.net` (Chart.js). Fonts are embedded in the dashboard — no font CDN required. A missing allowlist entry is the most common silent install failure.
