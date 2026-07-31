---
name: skill-aeco-innovation-revizto
description: "Revizto platform — 3D/2D environments, issue tracking, stamps, custom workflows, clash automation, publishing, CDE integrations, Power BI, API, licensing. Trigger for: Revizto, BIM coordination platform, clash detection, stamps, dashboards, switchback, Revizto setup, what license. Cross-ref: BIM digital, NZCIC."
---

# Revizto Platform Knowledge Skill

**Version:** 1.0
**Source:** Revizto Help Centre, Revizto Academy, developer.revizto.com
**Scope:** Full platform — 3D/2D, issues, clash automation, publishing, integrations, licensing, administration
**Persona:** Seasoned AECO professional with deep hands-on Revizto expertise across complex projects

---

## How to Use This Skill

This skill enables Claude to act as an expert Revizto power user and implementation advisor. Use this knowledge to:

- Answer any question about Revizto features, workflows, configuration, and troubleshooting.
- Advise on Revizto deployment strategy for projects of any scale and complexity.
- Guide users through publishing, clash automation setup, issue workflow design, and reporting.
- Flag which features require Standard vs Revizto+ licensing.
- Cross-reference with BIM & Digital Delivery skill for ISO 19650 / CDE context.
- Cross-reference with NZCIC skill for how Revizto maps to project stages.

For deep detail on specific topics, read the relevant deep skill:
- **skill-aeco-innovation-revizto-publishing** — Authoring tool publishing, CDE, Power BI, API
- **skill-aeco-innovation-revizto-clash** — Clash test creation, settings, conditional rules, Navisworks sync
- **skill-aeco-innovation-revizto-issues** — Issue creation, stamps, custom statuses, workflows, BCF
- **skill-aeco-innovation-revizto-api** — REST API, pyRevizto, MCP server, AECO integration patterns, code examples

---

## Part 1: Platform Architecture

### Products and Interfaces

| Interface | Platform | Purpose |
|-----------|----------|---------|
| **Revizto Application** | Windows, macOS | Primary desktop application — 3D/2D viewing, issue creation, clash automation, publishing |
| **Revizto Site** | iOS, Android | Mobile/tablet field access — 3D/2D navigation, issue creation, gyroscope, walk/fly mode |
| **Revizto Workspace** | Web (ws.revizto.com) | Administration — license management, project settings, teams, issue workflows, dashboards, reports |
| **Revizto VR** | Meta/Oculus headsets | Immersive 3D walkthroughs — supported headsets listed in Help Centre |
| **Revizto API** | REST API (developer.revizto.com) | Automation — team management, issue operations, clash data, log export |
| **Power BI Connector** | Power BI Desktop | Data visualisation — issues, clashes, project analytics via custom connector (.mez) |

### Project Types

| Type | Storage | Collaboration | Clash Automation |
|------|---------|---------------|------------------|
| **Cloud** | Revizto cloud servers | Full real-time sync across all members | Supported |
| **Shared location** | Network drive / local server | Sync via shared folder — suited for restricted networks | Supported |
| **Local** | User's machine only | No sync — single user or demo only | Not supported until published to cloud/shared |

### License Tiers

| Feature | Standard | Revizto+ |
|---------|----------|----------|
| Interactive 3D models, point clouds, sheets | ✓ | ✓ |
| Sheet overlays in 3D | ✓ | ✓ |
| Real-time issue tracking | ✓ | ✓ |
| Field access (Revizto Site) | ✓ | ✓ |
| Searchable data and appearance profiles | ✓ | ✓ |
| Reporting and dashboards | ✓ | ✓ |
| **Clash automation** | ✗ | ✓ |
| **Issue location tags** | ✗ | ✓ |
| **Custom issue workflows/statuses** | ✗ | ✓ |
| **Power BI connector** | ✗ | ✓ |
| **API access** | ✗ | ✓ |
| **Advanced issue automation (IF/THEN rules)** | ✗ | ✓ |

Always flag when advising on a Revizto+ feature — users on Standard will not have access.

---

## Part 2: Core Concepts

### Key Terminology

| Term | Definition |
|------|-----------|
| **Scene** | A 3D model space within a project — can contain multiple published models |
| **Viewpoint** | A saved 3D view including camera position, section cuts, and category visibility |
| **Home viewpoint** | Default view shown when project opens or Home button is clicked |
| **Search set** | A saved selection of objects based on properties/categories — used in clash tests and appearance |
| **Stamp** | A prefilled issue template with a 3-4 character label visible in 3D/2D — for rapid, consistent issue creation |
| **Stamp template** | Defines stamp properties (prefix, default fields, category) — project-wide |
| **Stamp category** | Groups stamp templates — inherits properties to child templates |
| **Issue pin** | Visual marker showing issue location in 3D model or on sheets |
| **Issue type** | Links an issue to a workflow, determining available statuses |
| **Workflow** | A set of custom statuses (e.g., Open → In Review → Resolved → Closed) |
| **Clash test** | Defines two object selections (A and B) tested for collisions/intersections |
| **Clash group** | A logical grouping of related clashes within a test |
| **Check-out** | Exclusive lock on a clash test for editing — prevents concurrent edits |
| **Relinquish** | Release a checked-out clash test, uploading changes to cloud |
| **Switchback** | Navigation from a Revizto issue directly to the source location in Revit/Navisworks |
| **CDE integration** | Connection to external document management (ACC/BIM 360, Procore, Box) |
| **BCF** | BIM Collaboration Format — open standard for exchanging issues between BIM tools |

---

## Part 3: 3D Environment

### Navigation Modes
- **Orbit** — Rotate around a point; scroll to zoom
- **Walk/Fly** — First-person navigation with WASD/arrow keys; fly mode ignores gravity
- **Gyroscope** (Revizto Site) — Device orientation controls camera on mobile

### Key 3D Tools

**Section Cut** — Cut scene with a single plane. Drag the suction-cap helper to snap to a surface, or double-click any surface. Remembers settings in viewpoints.

**Section Box** — Select objects (Ctrl+click), then activate section cut → switch to Box mode. Creates a bounding box around selected objects. Ideal for isolating areas. Issues created from section boxes appear as axonometric views in Revit switchback.

**Viewpoints** — Save current view (camera, sections, visibility). Create via toolbar button. Home viewpoint resets to default. Viewpoints are the backbone of presentations and issue context.

**Objects Panel** — Lists objects by Revit categories. Can colour-code entire categories (not individual objects). Works in Sketch mode. Hide/show categories. Double-click any object to view its properties.

**Appearance Templates** — Saved visibility and colour-coding presets. Apply consistently across team members. Useful for discipline-specific views.

**Properties** — Double-click any object to see its data (Revit parameters, IFC properties, etc.). Selection tree shows the object's position in the model hierarchy.

---

## Part 4: 2D Environment

### Sheets
- Published from authoring tools (Revit, AutoCAD, etc.) as part of the model publish
- Organised in folders named after the source model file; folder structure preserved on re-publish
- Sheets map to 3D model via coordinates — issues placed on sheets appear in 3D and vice versa

### Sheet Overlays
- Overlay multiple sheet versions or different discipline sheets in the same view
- Useful for coordination, revision comparison, and RFI tracking
- Available in 2D|3D split mode on Revizto Site

### 2D Issue Creation
- Place issues directly on sheets with markup tools
- Issues link to both 2D location and corresponding 3D position
- Stamp issues can be placed in 2D with the 3-4 character prefix visible

---

## Part 5: Issue Tracking

### Issue Creation
Issues can be created in: 3D environment (desktop/mobile), 2D sheets, from clash automation, or via API. Each issue has: title, description, assignee, reporter, watchers, priority (Blocker/Critical/Major/Minor/Trivial/None), status, type, deadline, tags, attachments, markup, and chat history.

### Privacy
- **Public** — Visible to all project members
- **Private** — Visible only to author, assignee, reporter, watchers, and project admins

### Stamps (Quick Issue Creation)
Stamps are the power-user workflow engine. They allow pre-configured issue templates with a visible 3-character label in 3D/2D. Set up stamp categories first (group templates), then stamp templates within them. Categories can push default properties down to child templates.

**Best practice:** Design stamp taxonomies to match your project's issue types — e.g., structural (STR), mechanical (MEC), electrical (ELE), architectural (ARC), safety (SAF). Use categories for disciplines, templates for specific issue types within each discipline.

### Custom Issue Workflows [Revizto+ only]
Three components configured in Workspace (ws.revizto.com):
1. **Workflows** — Groups of statuses (e.g., "Coordination workflow", "Defects workflow")
2. **Statuses** — Individual states within a workflow (custom names, colours, icons)
3. **Issue types** — Links a workflow to a named type; determines which statuses appear on an issue

Default workflow: Open → In Progress → Solved → Closed. These can be deleted and replaced with custom statuses. Only project admins can configure. Only available in cloud/shared location projects.

### BCF (BIM Collaboration Format)
Import/export issues in BCF format for interoperability with other BIM tools (Solibri, Navisworks, etc.). Maintains 3D viewpoint and markup.

### Managing Issues in Workspace
View and edit issues via ws.revizto.com. Filter by multiple criteria, sort by unread, bulk operations. Issues cannot be created from Workspace — only from the application.

For detailed stamp setup, workflow configuration, and issue management patterns, read the skill-aeco-innovation-revizto-issues skill.

---

## Part 6: Clash Automation [Revizto+ only]

### Core Concept
A clash test defines two object selections (A and B) tested for collisions. Each object in A is tested against each object in B. Exception: "Object A requires object B" tests proximity, not collision.

### Clash Test Workflow
1. Create search sets defining object selections
2. Create clash test with Selection A and Selection B
3. Configure settings: clashing type, ignore rules, grouping, issue automation
4. Run clash detection
5. Review results — clashes grouped by configured rules
6. Sync to issue tracker — creates issues from clash groups
7. Resolve issues in collaboration with team
8. Re-run detection as models update

### Key Settings

**Clashing Types** — Collision, intersection, clearance, "Object A requires Object B" (proximity check). Type determines which settings are available.

**Ignore Rules** — Filter out known non-issues (e.g., pipes through sleeves, structural connections).

**Grouping** — How clashes are combined into groups. Groups naming controls issue titles.

**Issue Automation (Simple)** — Define default stamp template, assignee, and properties for auto-created issues.

**Issue Automation (Advanced)** [Revizto+ only] — Conditional IF/THEN/OTHERWISE rules. Each rule checks a condition on the clash group and either creates an issue from a specific template or skips. Rules processed in order — first match wins. Enables automatic classification of clashes into categories with different templates/assignees.

**Location Filters** [Revizto+ only] — Filter clashes by location before applying rules.

**Labels** — Tag clash tests for organisation. Imported labels are additive (don't overwrite).

### Access Rights
Clash test roles: Project Administrator, Clash Administrator, Test Administrator. Only users with "Create clash tests" right can create new tests. Check-out/relinquish controls concurrent editing.

### Import Settings
Import settings from one clash test to another — clashing type, ignore rules, grouping, naming, issue automation, location filters, access rights, labels. Some settings incompatible between test types.

### Navisworks Clash Sync
Sync Navisworks Clash Detective results into Revizto as issues. Requires cloud/shared location project. Models should ideally be published to Revizto for 3D viewing (not just screenshots). Options for screenshot generation: Revizto-generated (slow, poor angles) or XML report import (faster, better quality — recommended). Match tests by GUID or GUID+name (for iConstruct).

For deep clash automation configuration, read the skill-aeco-innovation-revizto-clash skill.

---

## Part 7: Publishing from Authoring Tools

### Supported Authoring Tools
Revit, Navisworks, AutoCAD, Civil 3D, Plant 3D, ArchiCAD, Rhino, Inventor, plus IFC and point cloud import. All plug-ins Windows only (macOS unsupported for plug-ins).

### General Publishing Principles
- Publish models and sheets from the authoring tool via the Revizto plug-in
- First publish creates the scene; re-publish overwrites the destination scene completely
- Missing models in a re-publish are deleted from Revizto
- Sheets published to folders named after the source file; folder structure preserved on re-publish
- Deleted sheets in the source are NOT deleted from Revizto
- Can publish entire view or current selection only

### Publishing Scheduler
Schedule automated publishing for off-hours (Revit, Navisworks, AutoCAD). Configured via plug-in menu: Revizto 5 > Revizto Scheduler.

### Key Limitations (Common Across Tools)
- Line weight and patterns generally not supported
- Texture patterns may not publish or may be distorted
- Some geometry types not supported depending on tool
- Objects in multiple Revit appearance filters may have incorrect colours

### Switchback
Navigate from a Revizto issue directly to the corresponding location in the source authoring tool. Works for both 3D (opens model at location) and 2D (opens sheet). Enabled via the Revizto plug-in.

For detailed per-tool publishing workflows and troubleshooting, read the skill-aeco-innovation-revizto-publishing skill.

---

## Part 8: Integrations and Ecosystem

### CDE Integrations (Documents)
Connect Revizto to external document management via the Docs toolbar button:
- **Autodesk Construction Cloud (ACC) / BIM 360** — Requires ACC Account Administrator to authorise the Revizto app. Live connection to project documents.
- **Procore** — Integration process differs from other platforms; requires separate configuration.
- **Box** — Connect to Box folders for document access within Revizto.

Documents imported become accessible within Revizto. Live connection auto-updates as source documents change. All project team members must be added to the integration platform.

### Power BI [Revizto+ only]
Custom Power BI connector (.mez file) pulls data directly from Revizto: issues, clashes, clash groups, clash tests, project info, team data. Two standard dashboard templates: PM Dashboard (issue history/analytics) and Codifying Coordination (coordination insights). Scheduled refresh available. Region-specific connector files — match to your Revizto server region.

### API [Revizto+ only]
REST API at developer.revizto.com. Capabilities: team management, issue CRUD, clash data access, log export. Authentication via OAuth. Free Revizto Academy course: API Essentials.

### Third-Party Integrations
- BCF import/export for Solibri, Navisworks, etc.
- n8n / automation platform integration possible via API
- Revizto MCP server available for AI-agent integration

---

## Part 9: Workspace Administration

### Project Management (ws.revizto.com)
- **Editing projects** — Name, description, settings
- **Managing teams** — Add/remove members, assign roles and access levels
- **Archiving** — Archive inactive projects; restore when needed
- **Versions** — View project version history
- **Logs** — Export project activity logs
- **Project templates** — Save stamp templates, tags, filters, dashboards, reports, search sets, user rights as a reusable template. Import settings from template to new projects.

### License Management
- **Roles in the license** — License Administrator, Member
- **Managing slots** — Monitor active users vs available slots
- **Sessions** — View/manage active sessions across application, workspace, and API
- **Activity monitoring** — Track member activity and usage

### Access Levels
Project-level access rights control what each member can do. Key rights include: create/edit issues, create clash tests, sync Navisworks clashes, manage teams, publish models, manage stamps, administer project. Access levels configured per user or role in Workspace.

---

## Part 10: Dashboards and Reporting

### Dashboards
Configure project dashboards in Workspace with charts showing issue status, resolution rates, assignment distribution, clash progress, and more. Dashboard presets store chart configurations — share across team or use as templates.

### Reports
Generate reports from issue data. Shared issue filter presets enable consistent reporting across team. Combine with Power BI for advanced analytics.

### Best Practice: Reporting Strategy
- Set up stamp templates with rich metadata at project start (discipline, zone, priority, trade)
- Configure shared filter presets for common views (by discipline, by status, overdue)
- Use dashboards for weekly coordination meetings
- Connect Power BI for executive-level programme reporting across multiple projects

---

## Part 11: Revizto in Project Delivery

### When to Use Revizto (by NZCIC Stage)

| Stage | Revizto Use |
|-------|-------------|
| **Stage 2 (Concept)** | Model viewing, early design review, viewpoint sharing |
| **Stage 3 (Preliminary)** | Inter-discipline coordination issues, sheet overlays for comparison |
| **Stage 4 (Developed)** | Full clash automation setup, systematic coordination, stamp workflows |
| **Stage 5 (Detailed)** | Clash resolution tracking, consent documentation review, BCF exchange |
| **Stage 6 (Procurement)** | Model access for tenderers, issue tracking for tender queries |
| **Stage 7 (Construction)** | Site issue tracking (Revizto Site), RFI management, defect logging, progress photos |
| **Stage 8 (Post Completion)** | Defects tracking, snagging, handover documentation review |

### Implementation Checklist
1. Confirm license tier (Standard or Revizto+)
2. Set up Workspace project with correct region
3. Define access levels and team roles
4. Create project template (stamps, tags, filters, dashboards)
5. Configure stamp categories and templates per discipline
6. Set up CDE integration if using ACC/Procore/Box
7. Publish models from authoring tools
8. Configure clash tests (Revizto+)
9. Train team on desktop and Revizto Site
10. Establish reporting cadence (dashboards + Power BI if available)

---

## Troubleshooting Patterns

Common issues and resolutions:

- **Plug-in not showing** — Check supported versions list; reinstall Revizto; restart authoring tool
- **Duplicate sheets on re-publish** — Check sheet mapping rule (GUID vs name); see Publishing Revit troubleshooting
- **Colours wrong after publish** — Objects in multiple Revit appearance filters; ensure one filter per object
- **Clash sync creates duplicates** — Check match-by settings (GUID vs name); ensure consistent clash grouping
- **Can't edit clash test** — Check if checked out by another user; contact them or use force relinquish (admin only)
- **Custom statuses not available** — Requires Revizto+; configure in Workspace Issue Workflows tab; only cloud/shared projects
- **Power BI connector not found** — Manually install .mez file; confirm correct region connector
- **CDE documents not visible** — Team members must be added to integration platform (ACC/Procore/Box)
- **Switchback not working** — Ensure plug-in installed; model must be linked to same Revizto project
