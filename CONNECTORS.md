# Connectors

## Required connector

This plugin needs the **Revizto MCP** connector. It is a directory connector with a dynamic, per-region endpoint, so `.mcp.json` references it **by name** (name-match is treated the same as a URL match).

| Category | Server name in `.mcp.json` | Notes |
|---|---|---|
| Revizto MCP (project data) | `Revizto MCP` | The production directory-entry name for the installer's region. |

Auth is OAuth 2.1 PKCE against the regional Revizto API; the user signs in on connect. The dashboard's reads are **read-only** by default; the write tool (`update_issues`) is inert while `CONFIG.readOnly` is `true`.

> **Two separate gates.** Connecting this connector is necessary but **not** sufficient. The dashboard artifact also has its own per-artifact `mcp_tools` allowlist, which the connector grant does **not** populate — the install-skill `create_artifact` declares the read tools into it (and only takes effect when run from an installed plugin, natively in Cowork). If the dashboard says "tools aren't authorised for this artifact," gate 2 is the empty one. See the README "Install — do this as a plugin".

## Regional connections (licence-first, WS21)

Each Revizto region is a separate MCP connection (see the regional server URLs in Revizto's MCP help article). Add one connection per region your organisation uses, then list each connection's id in `CONFIG.connectors` in `dashboard.html`:

```js
connectors:[
  {prefix:"mcp__<your-connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
  // one entry per connected region — any subset works
]
```

The dashboard is **licence-first**: it probes every configured connection, aggregates the licences your Revizto user can see into one picker ("Licence name — Region"), and automatically routes each licence to the connection that serves it. The displayed region is always the licence's own Revizto region. With a single entry there is no extra UI; with several, a Connections ⓘ shows per-connection health.

If a licence can't be read, the dashboard explains the actual cause: the account hasn't enabled the Revizto MCP server (Developer Portal), your licence role is insufficient, or the licence lives on a regional instance you haven't connected.

## Finding a connector's prefix

Each connection exposes its tools with a unique `mcp__<connector-id>__` prefix — that string goes in the `prefix` field above. To read it, in the Cowork session (with the connector connected) ask Claude to *"list the Revizto MCP tool names you can call"*; the leading segment up to and including the trailing `__` (e.g. `mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__`) is the prefix. Multiple connected regions show multiple distinct prefixes. The install skill reads these automatically; do it by hand only to verify or when configuring outside a Cowork install.

> **Open item:** `.mcp.json` matches the connector **by name** while the dashboard routes by prefix. How `callMcpTool` resolves a by-name server in plugin context is not yet confirmed, so configure `CONFIG.connectors` with the real per-install prefix meanwhile. Flag it if a clearly-connected connection won't resolve.

## Admin network allowlist (Team/Enterprise)

Allow the Revizto MCP connector domain(s) and `cdn.jsdelivr.net` (Chart.js). Fonts are embedded in the dashboard — no font CDN required. A missing allowlist entry is the most common silent install failure.
