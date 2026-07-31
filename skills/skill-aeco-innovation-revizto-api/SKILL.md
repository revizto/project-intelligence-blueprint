---
name: skill-aeco-innovation-revizto-api
description: "Revizto REST API v5, pyRevizto, Power BI connector, MCP server, ReviztoConsole CLI, AECO API ecosystem. Requires Revizto+. Trigger for: Revizto API, pyRevizto, automation, MCP server, code, integration, API authentication, webhooks, building tools with Revizto data. Cross-ref: Revizto, integration-patterns."
---

# Revizto API & AECO Integration Patterns — Deep Skill

**Version:** 1.0
**Source:** developer.revizto.com, pyRevizto (PyPI), Revizto MCP, Revizto Academy
**Scope:** API reference, developer tools, code patterns, integration architecture, AECO ecosystem
**Persona:** Senior AECO technologist who writes code, builds automation pipelines, and integrates construction platforms
**License Requirement:** Revizto+ (API access is not available on Standard)

**Version:** 1.1 (June 2026) — Added "Building live MCP dashboards in Cowork" section, codified from the Revizto Project Intelligence / MCP Endpoints dashboard builds.

---

## Building live MCP dashboards in Cowork (codified June 2026)

Battle-tested patterns for building live, multi-project Revizto dashboards as Cowork artifacts over the MCP server. Apply these whenever building an interactive surface on the Revizto MCP.

**Connection & discovery (de-hardcode everything).**
- The ONLY deploy-time constant is the MCP connector prefix, e.g. `const CONFIG={server:"mcp__<connectorId>__"}` → `RB=CONFIG.server`. When shipped as a plugin the connector name is stable, so even this becomes fixed.
- Discover the hierarchy at runtime, never hardcode IDs: `list_accounts` → `list_licenses` → `list_projects`. Default the viewed project to the **most-recently-active** (sort by `lastActive`). Persist last licence/project in localStorage.
- Per-project context to cache on load: `list_workflows` (status/type UUIDs for writes), `list_project_members` (valid assignees), project `id` (numeric, needed by `list_issue_comments`).

**Artifact bridge.** Inside a Cowork artifact, `window.cowork.callMcpTool(name,args)` returns `{content, structuredContent, isError}` — read `r.structuredContent ?? JSON.parse(r.content[0].text)`. `window.cowork.askClaude(prompt,[data])` runs quick inference over fetched data (persona answers, briefs). Probe each tool once in chat to learn its real shape before wiring.

**Writes — human oversight is mandatory.** Every write (`update_issues`, `create_issue`, `change_issue_assignee`, `add_issue_comment`) routes through a confirmation gate (summary + affected count + required reason + actor initials) and only executes on explicit approval. Write a dated, attributed, reasoned **audit comment** into each issue via the `comment` param: `"<action>. <timestamp> UTC by <who>. Reason: <why>"`. `update_issues` also records its own diff and attributes the calling user. Offer Undo (capture prior assignee/priority before executing). Provide a per-deployment **read-only toggle** for demos.

**Safe write-probing.** To test a write endpoint without mutating, call it with a sentinel invalid `projectUuid` (`00000000-0000-0000-0000-000000000000`) — it returns `{"error":"Project does not exist"}`, proving reachability with zero mutation.

**Endpoint verification (the tester).** A test must report **verified** only on a genuine API response. Default unknown/errored/not-allowlisted tools to **Not available** — never optimistically "reachable". Distinguish: success or genuine domain/validation error = available; thrown/`not found`/`not allowed`/unrecognised = not available. Roadmap endpoints not on the connector correctly read Not available until they ship.

**Live-data hygiene (trust-critical).** No static/hardcoded/fabricated values for live insights — only titles/help/instructions may be hardcoded. On switching licence/project, **fully blank all state** (every metric AND every meta field AND caches) before/while loading; show a loading state; clear stale UI. A licence with no projects must wipe the entire dashboard to a clean empty state (blank data, hide views, "No projects in this licence" banner) — wrap `list_projects` so a permission error is treated as no-projects, not a fall-through to stale data. Re-fetch on licence/project/explicit-trigger; persona/tab switches re-render from the last live load.

**Scheduling.** A daily "brief" digest = a scheduled task whose self-contained prompt pulls live MCP data and writes a structured, drafts-only (no auto-write) summary.

Cross-ref: `skill-aeco-ops-ux-ui-design-authority` (Data-Viz Component Consistency checklist), `integration-patterns`.

---

## How to Use This Skill

This skill enables Claude to act as an expert AECO developer and integration architect. Use this knowledge to:

- Write code against the Revizto API (REST or pyRevizto)
- Design integration architectures connecting Revizto with other AECO platforms
- Build automation pipelines for issue management, team onboarding, clash reporting
- Configure the Revizto MCP server for AI-agent workflows
- Advise on broader AECO API ecosystem strategy (what connects to what, and how)
- Cross-reference with Revizto platform skills for domain context

---

## Part 1: Revizto API Overview

### Architecture
- **Protocol:** REST API over HTTPS
- **Version:** v5 (current)
- **Base URL:** `https://api.<region>.revizto.com/v5/`
- **Documentation:** developer.revizto.com
- **Authentication:** OAuth 2.0 (access token + refresh token)
- **Data format:** JSON request/response
- **License:** Requires Revizto+ subscription

### Regions
The API is region-specific. Each Revizto license is hosted in a specific region. The base URL changes per region:

| Region | API Base URL |
|--------|-------------|
| US | `https://api.us.revizto.com/v5/` |
| EU | `https://api.eu.revizto.com/v5/` |
| Asia Pacific | `https://api.ap.revizto.com/v5/` |
| Other regions | Check Workspace dropdown under your name |

Always confirm the region before making API calls — wrong region = authentication failure.

### Capability Domains

| Domain | Operations | Key Use Cases |
|--------|-----------|---------------|
| **Team Management** | Invite users, assign roles, remove members, list members | Automated onboarding/offboarding across projects |
| **Issue Operations** | Create, read, update issues; query by filter | Custom dashboards, cross-platform sync, bulk updates |
| **Clash Information** | Access clash test data, clash results, clash groups | Coordination analytics, automated reporting |
| **Log Export** | Export project activity logs | Compliance, audit trails, activity analytics |

### Rate Limits
The API enforces rate limits on calls. Check the FAQ at developer.revizto.com for current limits. Design automations with appropriate delays between calls and implement retry logic with exponential backoff.

---

## Part 2: Authentication

### OAuth 2.0 Flow
1. **Redirect user** to Revizto authorization endpoint
2. **User grants access** → Revizto returns an authorization code
3. **Exchange code for tokens** → receive access_token and refresh_token
4. **Use access_token** in API requests: `Authorization: Bearer <access_token>`
5. **Refresh when expired** → use refresh_token to get new access_token

### Token Management
- Access tokens expire (short-lived)
- Refresh tokens are longer-lived but can be revoked
- Store tokens securely — never commit to source control
- Session management available in Workspace: My Account → Active Sessions → API tab
- Signing out of an API session expires its access and refresh tokens

### pyRevizto Authentication Pattern
```python
from pyrevizto import pyRevizto

# Initialize with region
revizto = pyRevizto("us", save_token=True)

# Get tokens (first time — requires browser-based OAuth)
tokens = revizto.get_tokens(access_code="your_access_code")

# Subsequent calls use saved tokens automatically
licenses = revizto.get_current_user_licenses()
```

The `save_token=True` parameter persists tokens locally so you don't re-authenticate on every script run.

---

## Part 3: Core API Endpoints

### Licenses and Users

```python
# List licenses accessible to the authenticated user
licenses = revizto.get_current_user_licenses()

# Invite users to a license
invite_data = [
    {
        "email": "architect@example.com",
        "role": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "company": "DesignCo"
    },
    {
        "email": "engineer@example.com",
        "role": 2,
        "firstName": "John",
        "lastName": "Doe",
        "company": "StructuralPartners"
    },
]
response = revizto.invite_users_to_license(
    license_uuid="your_license_uuid",
    invite_data=invite_data
)

# Assign roles to license members
response = revizto.assign_license_roles(
    license_uuid="your_license_uuid",
    member_uuids=["member_uuid1", "member_uuid2"],
    role=2  # Role ID
)

# Remove members from license
response = revizto.remove_license_members(
    license_uuid="your_license_uuid",
    member_uuids=["member_uuid1"]
)
```

### Projects and Issues

```python
# Get all issues for a project
issues = revizto.get_project_issues(
    project_uuid="your_project_uuid"
)

# Issues are returned as JSON with full field set:
# id, title, description, status, priority, assignee,
# reporter, watchers, tags, deadline, created, updated,
# type, privacy, custom_properties, etc.
```

### Clash Data

Access clash test configurations, results, and groups. Useful for building coordination dashboards and automated reporting beyond what Power BI templates provide.

---

## Part 4: Developer Tools

### pyRevizto (Python Library)

**Installation:** `pip install pyrevizto`
**Source:** PyPI (pypi.org/project/pyrevizto/)
**Purpose:** Python wrapper that mirrors Revizto API methods — reduces boilerplate, handles token management

Key methods map directly to API endpoints:
- `get_current_user_licenses()` → list accessible licenses
- `get_project_issues(project_uuid)` → get all project issues
- `invite_users_to_license(license_uuid, invite_data)` → bulk invite
- `assign_license_roles(license_uuid, member_uuids, role)` → role assignment
- `remove_license_members(license_uuid, member_uuids)` → member removal

**When to use pyRevizto vs raw REST:** Use pyRevizto for Python scripts and automation. Use raw REST calls when building in other languages (JavaScript/TypeScript, C#, Go) or when you need fine-grained control over request parameters.

### Power BI Connector

Region-specific .mez custom connector files. Download from Revizto Workspace or Help Centre. Installs into Power BI Desktop's custom connectors folder.

**Available data tables:**

| Table | Fields | Use |
|-------|--------|-----|
| Issues | Full issue data (title, status, priority, assignee, dates, tags, etc.) | Issue analytics, resolution tracking |
| Issue Diffs | Change history per issue | Trend analysis, response time, SLA monitoring |
| Clashes | Individual clash records | Clash volume, detection trends |
| Clash groups | Grouped clash data | Coordination progress tracking |
| Clash tests | Test configurations | Test management overview |
| ProjectInfo | Project metadata | Multi-project rollups |
| Team | Member information | Workload analysis, capacity planning |

**Scheduled refresh** available in Power BI Service for automated dashboards.

### ReviztoConsole (Command-Line Tool)

Located at: `C:\Program Files\Vizerra LLC\Revizto4\Service\ReviztoConsole`

```bash
# List projects with IDs
ReviztoConsole projects

# Export issues to Excel
ReviztoConsole issues -project 12845 -export xlsx -outfile E:\temp\issues.xlsx
```

Exports include most issue tracker fields. Can be scheduled as a Windows Task for automated nightly exports. Useful when API access is not available or for quick ad-hoc data pulls.

### Revizto MCP Server

Model Context Protocol server enabling AI agents (Claude, etc.) to interact with Revizto data directly. Available as a connected MCP server.

**Capabilities when connected:**
- Query project issues and clash data
- Read team and project information
- Enable AI-driven analysis of coordination status
- Power conversational interfaces over Revizto data

**Setup:** Connect via the MCP server URL in your AI platform's MCP configuration. The server handles authentication and data access.

**Use cases:**
- "Show me all overdue issues assigned to the MEP team"
- "Summarise this week's clash resolution progress"
- "Which clash tests have the most open issues?"
- Build AI-powered coordination assistants that query live project data

### Revizto Academy — API Essentials

Free course covering API fundamentals, authentication, endpoint usage, and practical examples. Access at revizto.com/en/academy/ — no cost, self-paced. Recommended as first step for developers new to the Revizto API.

---

## Part 5: Integration Architecture Patterns

### Pattern 1: Cross-Platform Issue Sync
**Problem:** Issues raised in Revizto need to flow to a project management tool (Jira, Monday.com, Asana) for non-BIM stakeholders.

**Architecture:**
```
Revizto API ──→ Middleware (n8n / Zapier / custom) ──→ PM Tool API
     ↑                                                      │
     └──────────── Status sync back ←──────────────────────┘
```

**Implementation:**
1. Poll Revizto API for new/updated issues (or use webhooks if available)
2. Map Revizto fields to PM tool fields (status, priority, assignee)
3. Create/update tasks in PM tool
4. Sync status changes back to Revizto
5. Handle conflict resolution (which system is source of truth?)

**Key decision:** Revizto should be the source of truth for BIM-related issues. PM tool is a mirror for visibility.

### Pattern 2: Automated Team Onboarding
**Problem:** New projects require adding 50+ users across multiple Revizto projects with correct roles.

**Architecture:**
```
Team roster (CSV/Excel/HR system)
     │
     ↓
Python script (pyRevizto)
     │
     ├──→ invite_users_to_license()
     ├──→ assign_license_roles()
     └──→ Add to project teams (per project)
```

**Implementation:**
```python
import csv
from pyrevizto import pyRevizto

revizto = pyRevizto("us", save_token=True)

# Read team roster
with open("team_roster.csv") as f:
    team = list(csv.DictReader(f))

# Batch invite
invite_data = [
    {
        "email": m["email"],
        "role": int(m["role_id"]),
        "firstName": m["first_name"],
        "lastName": m["last_name"],
        "company": m["company"]
    }
    for m in team
]

response = revizto.invite_users_to_license(
    license_uuid="license_uuid_here",
    invite_data=invite_data
)
print(f"Invited {len(invite_data)} users: {response}")
```

### Pattern 3: Coordination Dashboard Pipeline
**Problem:** Weekly coordination meeting needs a live dashboard showing clash resolution progress across all discipline pairs.

**Architecture:**
```
Revizto API ──→ Python ETL ──→ Database/Data Warehouse
                                       │
                               Power BI / Custom Dashboard
```

Or simpler:
```
Revizto Power BI Connector ──→ Power BI Dashboard
                                (scheduled daily refresh)
```

**When to use each:**
- Power BI connector: standard dashboards, single project, out-of-the-box
- Custom pipeline: multi-project aggregation, custom metrics, non-Power BI consumers, data warehouse integration

### Pattern 4: AI-Powered Coordination Assistant
**Problem:** Project coordinators spend hours manually reviewing issue lists and clash results. An AI agent could triage, summarise, and recommend actions.

**Architecture:**
```
Revizto MCP Server ──→ Claude / AI Agent
                            │
                    Natural language queries
                    Automated summaries
                    Triage recommendations
```

**Implementation:** Connect the Revizto MCP server in your AI platform. The agent can then query live project data and provide contextual analysis.

### Pattern 5: Multi-Platform Data Aggregation
**Problem:** Project data lives across Revizto (BIM issues), ACC (documents), Procore (field issues), and your ERP. Leadership needs a unified view.

**Architecture:**
```
Revizto API ──┐
ACC/Forge API ─┤
Procore API ───┤──→ ETL / Integration Layer ──→ Data Warehouse ──→ BI Dashboard
ERP API ───────┘
```

**Key considerations:**
- Normalise issue schemas across platforms (different field names, status models)
- Handle different authentication methods per platform
- Schedule syncs to avoid rate limits on all platforms
- Define a master data model that maps across sources

---

## Part 6: AECO API Ecosystem Context

### Where Revizto API Fits

Revizto's API is focused on **collaboration data** — issues, clashes, teams. It does not expose 3D geometry or model data via API. For a complete AECO automation stack, you typically combine Revizto with other platform APIs:

| Platform | API Focus | Complements Revizto For |
|----------|-----------|------------------------|
| **Autodesk Platform Services (APS/Forge)** | Model data, viewing, design automation, ACC data | Extracting model properties, automated QA checks, document management |
| **Procore API** | Field management, project financials, RFIs, submittals | Site-side issue tracking, cost integration, procurement |
| **Speckle** | Open-source model data transport, real-time collaboration | Moving geometry between tools, custom model viewers, data interop |
| **IFC.js / web-ifc** | Client-side IFC parsing and viewing | Custom BIM viewers, lightweight model interrogation |
| **Trimble Connect API** | Model hosting, clash detection, field tools | Alternative coordination platform data |
| **Aconex API** | Document control, correspondence, transmittals | Document management integration |
| **BIM 360 / ACC API** | Document management, model coordination, field management | Document-centric workflows alongside Revizto's issue-centric approach |
| **Power Automate / n8n / Zapier** | Workflow automation, no-code connectors | Connecting Revizto to non-API-savvy tools and people |

### Authentication Patterns Across AECO APIs

| Platform | Auth Method | Notes |
|----------|-------------|-------|
| Revizto | OAuth 2.0 (access + refresh tokens) | Region-specific endpoints |
| APS/Forge | OAuth 2.0 (2-legged or 3-legged) | Client ID + Secret; scopes control access |
| Procore | OAuth 2.0 | App registration via Procore developer portal |
| Speckle | Personal access tokens or OAuth | Self-hosted or speckle.xyz |
| ACC/BIM 360 | OAuth 2.0 via APS | Same as Forge authentication |

### Building a Multi-API AECO Stack

**Recommended technology choices:**
- **Language:** Python (widest AECO library support — pyRevizto, Forge SDK, Speckle SDK)
- **Orchestration:** n8n (self-hosted, visual, good for non-developers) or custom Python scripts
- **Data store:** PostgreSQL or cloud equivalent for normalised project data
- **Dashboarding:** Power BI (enterprise) or Grafana/Metabase (open-source)
- **Hosting:** Cloud functions (AWS Lambda, Azure Functions) for scheduled automation
- **AI layer:** Claude with MCP servers connected to Revizto + other platforms

---

## Part 7: Best Practices

### API Usage
1. **Always check your region** — wrong region is the most common authentication failure
2. **Implement retry logic** — rate limits and transient errors are normal; use exponential backoff
3. **Cache where possible** — don't re-fetch unchanged data on every call
4. **Handle pagination** — large projects may return paginated results
5. **Secure your tokens** — use environment variables or secret managers, never hardcode
6. **Monitor API sessions** — check Active Sessions in Workspace; revoke unused sessions

### Integration Design
1. **Define source of truth** — for each data type, one system owns it; others are mirrors
2. **Idempotent operations** — design syncs to be safely re-runnable (avoid duplicates)
3. **Error handling** — log failures, alert on repeated errors, don't silently drop data
4. **Schema mapping** — document how fields map between platforms before writing code
5. **Start small** — build one integration end-to-end before tackling the full stack

### Code Organisation
1. **Separate concerns** — API client wrapper, business logic, data transformation, output
2. **Configuration over code** — project UUIDs, license UUIDs, mappings in config files
3. **Logging** — log every API call and response status for debugging
4. **Testing** — use Revizto sandbox/test projects; never test against production data
5. **Version control** — all automation scripts in Git; document setup in README

### Security
1. **OAuth tokens** — store in OS keychain, environment variables, or secret manager
2. **API keys for third-party tools** — rotate regularly; use per-integration keys where possible
3. **Network** — use HTTPS only; validate SSL certificates
4. **Access** — use minimum required permissions; create dedicated API user accounts
5. **Audit** — export project logs periodically for compliance review

---

## Part 8: Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| 401 Unauthorized | Wrong region, expired token, or wrong credentials | Verify region; refresh token; re-authenticate |
| 403 Forbidden | Insufficient permissions or Standard license | Check API access enabled on license; check user rights |
| 429 Too Many Requests | Rate limit exceeded | Implement backoff; reduce call frequency |
| Empty results | Wrong project UUID or no data matching query | Verify UUID; check filters; test in Workspace first |
| pyRevizto token error | Saved token expired or corrupted | Delete saved token file; re-authenticate |
| Power BI connector not found | .mez not installed or wrong region | Download correct region connector; install to custom connectors folder |
| MCP server not responding | Connection configuration issue | Verify MCP URL; check authentication; test connectivity |
| ReviztoConsole "project not found" | Wrong project ID or not synced locally | Run `ReviztoConsole projects` to verify available IDs |

---

## Part 9: Learning Path

For developers new to the Revizto API:

1. **Revizto Academy — API Essentials** (free, self-paced at revizto.com/en/academy/)
2. **Developer portal** — developer.revizto.com (interactive docs, try endpoints)
3. **pyRevizto quickstart** — `pip install pyrevizto`, authenticate, pull first issues
4. **Power BI template** — connect a project, explore the standard PM dashboard
5. **Build first automation** — start with a simple issue export script
6. **Design first integration** — connect Revizto to one other platform
7. **Scale** — multi-project, multi-platform, AI-powered

For the broader AECO API ecosystem:
- **APS/Forge:** tutorials.autodesk.io
- **Procore:** developers.procore.com
- **Speckle:** speckle.guide
- **IFC.js:** ifcjs.io (now part of ThatOpenCompany)
