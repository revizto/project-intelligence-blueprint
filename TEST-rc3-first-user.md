# Test guide — Project Intelligence Blueprint v1.0.0-rc.3

**For:** first-user validation on Claude Cowork desktop, single region (Virginia / US-East).
**Goal:** confirm that installing as a plugin and creating the dashboard through the install skill populates the artifact's `mcp_tools` allowlist — the gate that was empty in rc.2 — and the dashboard loads live data.
**Build you're testing:** `2026-07-20.1` (shown in About and the Terms footer — check this to confirm you're on rc.3, not the cached rc.2).

Work through the steps in order. Each has an explicit expected result. If any step's result differs, stop and jump to **If it fails** at the bottom.

---

## 0. Precondition (Revizto/Jason confirms before you start)

- rc.3 is pushed to `github.com/jhowden-revizto/revizto-project-intelligence` (branch `main`).
- The file is reachable in a browser at:
  `https://github.com/jhowden-revizto/revizto-project-intelligence/blob/main/.claude-plugin/marketplace.json`

Don't start until that URL loads.

## 1. Clean the failed rc.2 state

So you're not testing a cached artifact.

1. In Claude, delete the **old** Blueprint artifact from the rc.2 attempt (the one stuck on "Connect the Revizto MCP Server").
2. If you previously added this repo as a marketplace or plugin, remove it (plugin browser → remove; or `/plugin marketplace remove revizto` if the CLI is available). We want a clean install.
3. Leave the **Revizto Virginia MCP** connector connected and signed in — do **not** remove that.

**Expected:** no Blueprint artifact open; connector still connected.

## 2. Confirm the connector answers (gate 1)

In an ordinary Claude chat (not an artifact), type:

> Using the Revizto MCP, list my licences.

**Expected:** it returns your licence(s) (e.g. your Virginia licence). This proves the connector + your account + role are good. (This already worked for you in the bug report — it confirms gate 1 is open.)

## 3. Add the marketplace and install the plugin

**Desktop plugin browser (your path):**
1. Open the plugin browser → **Add marketplace** → enter `jhowden-revizto/revizto-project-intelligence`.
2. Install **revizto-project-intelligence**.

**Or, if the `/plugin` CLI is available:**
```
/plugin marketplace add jhowden-revizto/revizto-project-intelligence
/plugin install revizto-project-intelligence@revizto
/reload-plugins
```

**Expected:** the install detail view lists **3 skills + 1 MCP server**. This is the step that was impossible in rc.2 (no `marketplace.json`).

## 4. Create the dashboard through the install skill (gate 2 — the actual test)

Open a **Cowork** session that has the plugin installed. Type exactly:

> Open the Revizto Project Intelligence Blueprint — follow the `project-intelligence-dashboard` skill.

Let it run without intervening. It will: confirm the connector, read your live connector prefix, fill `CONFIG.connectors`, and **create the artifact declaring the nine read tools** — the declaration that fills the `mcp_tools` allowlist.

**Expected:** a new Blueprint artifact opens. About/Terms footer shows build **`2026-07-20.1`**.

## 5. Accept Terms, pick your licence

1. The **Terms & Conditions** gate appears on first live load. Enter your name, tick the box, Agree. (No data is fetched until you accept.)
2. The **licence picker** appears.

**Expected:** your licence is listed with its region ("… — North America (USA)"). Pick it.

## 6. Verify success

Within one **Refresh**:

- [ ] Status pill reads **live** — not "Snapshot · demo data", not "Revizto MCP not connected".
- [ ] Licence picker shows your licence + region badge in the masthead.
- [ ] The dashboard lands on your **most-recently-active project**; the project picker lists your projects.
- [ ] Switching projects re-scores every view.
- [ ] Headline totals are exact; sampled panels say "sample of N of M".
- [ ] `06 Action anything` shows a **padlock** (correct — read-only build).

**If all boxes tick: the fix is confirmed.** Report success (see below).

---

## If it fails

Match your symptom:

**A. Dashboard shows "The Blueprint's tools aren't authorised for this artifact yet."**
This is the rc.3 message replacing the old false "please connect". It means the artifact's `mcp_tools` allowlist is *still* empty even after a native skill-run install — i.e. `create_artifact` is not declaring the tools on this desktop build. **This is the key finding we're testing for.** Do:
1. Re-open your **Revizto MCP Bridge Probe** artifact and re-run it.
2. If it still returns `Tool "…" is not in this artifact's mcp_tools allowlist`, capture: the exact message, Claude desktop version (Help → About), and a screenshot. This confirms a Revizto/Claude platform bug in the native `create_artifact` tool-declaration path — send it to Jason/Revizto.

**B. Dashboard shows "Connect the Revizto MCP Server".**
Gate 1. The connector isn't connected in this session, or `CONFIG.connectors` is empty. Re-check step 2, then re-run step 4.

**C. "Couldn't load — Reload to retry" on every view.**
A prefix mismatch. Re-run step 4 (the skill re-reads the live prefix). If it persists, note the connector's exact name and the prefix the probe reports, and send both.

**D. Licence picker is empty or your licence is missing.**
The dashboard will name the cause — read it. Likely: the account hasn't enabled the Revizto MCP in the Developer Portal, or your licence role is insufficient. Screenshot the message.

**E. Blank charts, no error (Team/Enterprise only).**
Network allowlist. Ask your Claude admin to allow the Virginia Revizto MCP domain and `cdn.jsdelivr.net` under Admin settings → Capabilities.

---

## What to report back

- Which step you reached, and whether the six checkboxes in step 6 all ticked.
- The **build stamp** you saw (should be `2026-07-20.1`).
- If it failed: which case (A–E), the exact on-screen message, and — for case A — the bridge-probe output + desktop version.
- The **artifact-runtime tool prefix** you saw (from step 2 or the probe) — we want to record the confirmed prefix form.
