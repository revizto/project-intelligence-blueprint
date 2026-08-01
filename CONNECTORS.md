# Connectors

## Required connector

This plugin needs the **Revizto MCP** connector, but it does **not** bundle it. The connector is a directory connector with a dynamic, per-region endpoint and OAuth sign-in, so there is no static URL to declare — and the marketplace validator rejects a plugin MCP server without a `url`. So the plugin ships **skills only**; you add the Revizto MCP connector yourself in **Customize → Connectors** (see the README install sequence, Step 5), one connection per region you use.

| Connector | How you add it | Notes |
|---|---|---|
| Revizto MCP (project data) | Customize → Connectors → add "Revizto MCP" for your region, sign in | OAuth 2.1 PKCE against the regional Revizto API. One connection per region. |

The Blueprint **opens read-only every session**; the header Read-only pill is a live per-session toggle. Switching it off enables the 06 Action write surface, and approved writes (`update_issues`, declared on the artifact at install) run through the count-first + name/reason approval pipeline. Read-only re-asserts whenever the artifact is reopened. To ship a hard read-only build, set `CONFIG.readOnly:true` and omit `update_issues` at install.

> **Two separate gates.** Connecting this connector is necessary but **not** sufficient. The dashboard artifact also has its own per-artifact `mcp_tools` allowlist, which the connector grant does **not** populate — the install-skill `create_artifact` declares the read tools into it (and only takes effect when run from an installed plugin, natively in Cowork). If the dashboard says "tools aren't authorised for this artifact," gate 2 is the empty one. See the README install sequence, Steps 4 and 8.

## Regional connections (server-first)

Each Revizto region is a separate MCP connection (see the regional server URLs in Revizto's MCP help article). Add one connection per region your organisation uses.

> **You do not do the next part by hand.** The install skill reads your connector ids and writes them into
> `CONFIG.connectors` for you. It is documented here so you can see what gets written, and for the rare
> case of configuring outside a Cowork install. Editing your own copy of `dashboard.html` and opening it
> directly will not work — the artifact tool gate is bound at `create_artifact` time (see the README,
> "How it works: two gates").

For reference, this is the shape the skill writes into `CONFIG.connectors` in `dashboard.html`:

```js
connectors:[
  {prefix:"mcp__<your-connector-id>__",env:"prod",wsHost:"ws.revizto.com",missing:[]},
  // one entry per connected region — any subset works
]
```

The dashboard is **server-first**. Each entry in `CONFIG.connectors` is one Revizto MCP server and appears as one selectable row in the **MCP Server** panel, named with the name you gave that connector in Claude. The user picks one server; the Blueprint then reads licences and projects from **that server only** — nothing is merged across servers and no connection is auto-selected. A server that is connected but unusable is shown greyed with the reason (needs sign-in, no longer registered, not authorised for this artifact, no licences visible, licences not readable).

A licence's `region` describes where that licence's data is hosted, which is **not** the same fact as which server serves it — some older licences report a region that differs from the server returning them. Region is therefore not shown against licences; the MCP Server panel reports it as per-region counts instead.

Terms acceptance is recorded **per server, on first use**. Licence and project selections are remembered per server, because a licence UUID is meaningless on a different regional instance.

If a licence can't be read, the dashboard explains the actual cause: the account hasn't enabled the Revizto MCP server (Developer Portal), your licence role is insufficient, or the licence lives on a regional instance you haven't connected.

## Finding a connector's prefix

Each connection exposes its tools with a unique `mcp__<connector-id>__` prefix — that string goes in the `prefix` field above. To read it, in the Cowork session (with the connector connected) ask Claude to *"list the Revizto MCP tool names you can call"*; the leading segment up to and including the trailing `__` (e.g. `mcp__1a2b3c4d-5e6f-7890-abcd-ef1234567890__`) is the prefix. Multiple connected regions show multiple distinct prefixes. The install skill reads these automatically; do it by hand only to verify or when configuring outside a Cowork install.

> **Note:** the dashboard routes by the `mcp__<id>__` prefix, which is per-user and derived in the artifact runtime. Configure `CONFIG.connectors` with the real per-install prefix (the install skill reads it for you). Flag it if a clearly-connected connection won't resolve.

## Admin network allowlist (Team/Enterprise)

Allow the Revizto MCP connector domain(s) and `cdn.jsdelivr.net` (Chart.js). Fonts are embedded in the dashboard — no font CDN required. A missing allowlist entry is the most common silent install failure.
