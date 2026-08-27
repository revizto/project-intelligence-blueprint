# Releasing

The plugin ships as a single self-contained HTML asset with no runtime build, which is how three
defects of the same shape reached customers (WS28d, WS35, WS36). The gates below are the substitute
for a build pipeline. **Do not skip them** — `tools/package.mjs` will refuse to produce a release
asset if they fail, and that refusal is the point.

---

## Prerequisites

`git`, and **Node 20+** for the local gates and the packager. Check with `node -v && npm -v`. If
`npm: command not found`, Node is not installed — see "Releasing without Node locally" at the bottom,
which is a supported path, not a workaround.

Every command below assumes you are **in the repo**:

```bash
cd ~/Developer/project-intelligence-blueprint
```

## 0 · Before you start

Everything that states the version must already agree: `.claude-plugin/plugin.json`,
`.claude-plugin/marketplace.json`, `SKILL.md` frontmatter, the `README.md` package name and
install-detail line, and the top `CHANGELOG.md` heading — which must also quote the `buildStamp`
that the shipped `dashboard.html` actually contains.

You do not have to check these by hand. Gate 6 does it:

```bash
npm run verify
```

## 1 · Regenerate the manifest, then verify

If `dashboard.html` changed at all — even one character — the manifest is stale until you rebuild it.

```bash
node tools/build.mjs      # regenerate assets/manifest.json from the asset
npm run verify            # manifest --check + all six gates
```

Expect `48 passed, 0 failed`. Anything red stops the release. The gates are:

| Gate | Catches |
|---|---|
| 1 SYNTAX | the inline script no longer parses |
| 2 CONTRACT | an argument reaching the wire that `ARG_CONTRACT` does not declare |
| 3 TAXONOMY | a failure classified as the wrong kind, or blaming the wrong party |
| 4 HYGIENE | a defect we have already shipped once coming back |
| 5 MANIFEST | the install guard no longer describing the file beside it |
| 6 VERSION | the version or build stamp disagreeing between files |

## 2 · Commit

```bash
git add -A
git commit -m "v1.0.4 — remove the _cb cache-bust, add an outbound argument contract, generated guards"
```

## 3 · Push the branch and let CI verify

```bash
git push origin main
```

CI (`.github/workflows/verify.yml`) runs the same gates. **Wait for it to go green before tagging.**

Tagging is a public act — a tag is what the release points at and what customers install from — so it
comes *after* verification, not before. If CI fails following a local pass, something is
machine-specific; investigate it rather than retrying until it happens to work.

## 4 · Tag, once CI is green

Tags are `vMAJOR.MINOR.PATCH` and must match `plugin.json`.

```bash
git tag -a v1.0.4 -m "v1.0.4 — the _cb outage; argument contract; guards that cannot go stale"
git push origin v1.0.4
```

## 5 · Build the uploadable package

```bash
node tools/package.mjs
```

Produces `dist/revizto-project-intelligence-v1.0.4.plugin` — the plugin only. Repo scaffolding
(`tests/`, `tools/`, `.github/`, `package.json`, `.git`) is deliberately excluded: it is how we build
the thing, not part of the thing. `dist/` is gitignored; the package is a release asset, not a repo
file.

## 6 · Create the GitHub release

On <https://github.com/revizto/project-intelligence-blueprint/releases> → **Draft a new release**:

- **Tag** — `v1.0.4` (the one you just pushed; do not let GitHub create a new one)
- **Title** — `v1.0.4 — the _cb outage; argument contract; guards that cannot go stale`
- **Body** — paste the `1.0.4` section of `CHANGELOG.md`
- **Attach** — `dist/revizto-project-intelligence-v1.0.4.plugin`
- Publish as the **latest** release

## 7 · Tell customers what they must actually do

Updating the plugin does **not** update a Blueprint already deployed — the artifact contains the code
it was built from. This is the single most-missed step, and for 1.0.4 it is not optional: a 1.0.3
artifact carries the `_cb` defect and cannot be repaired in place.

Every customer must:

1. **Update the plugin.** Marketplace users: Directory → Plugins → the `revizto` marketplace →
   **Sync** (auto-sync is off by design), then update. Package users: remove the old entry first,
   then upload the new `.plugin` — otherwise Claude keeps serving the cached copy.
2. **Re-run the `project-intelligence-dashboard` skill** to redeploy the Blueprint artifact.
3. **Approve the tool authorisations** when asked. Unchanged from 1.0.3.

Point them at the CHANGELOG for why. The symptom to quote is *"Connected · licences not readable"* —
that is what they saw, and it is what they will search for.

## 8 · Verify a real install

Do not take the release on trust. On a machine that is not yours:

1. Install from the marketplace (or the uploaded package). The install detail must list **3 skills**
   at version **1.0.4**.
2. Run the skill in a **local** session, not a cloud one — the `mcp_tools` allowlist only binds
   locally (see SKILL.md's prerequisite).
3. The Blueprint must reach the Terms gate → licence picker, **not** "tools aren't authorised".
4. Confirm the artifact reports `state=ready` with a non-zero licence count in the console, and that
   no `[WS37]` contract warning and no red banner appears.

---

## Releasing without Node locally

You do not need Node on your machine to cut a release, provided **something** ran the gates. CI runs
them on every push, so the sequence is simply: commit → push `main` → **wait for CI green** → tag →
push tag → release. Steps 1 and 5 are the only ones that need Node, and both have an alternative:

- **Step 1 (manifest + verify).** Skip locally; CI's `node tools/build.mjs --check` will fail the push
  if the manifest is stale, which is the same protection a beat later. The one thing you lose is the
  fast local loop — you find out in CI instead of in your terminal.
- **Step 5 (the `.plugin` package).** The asset for a given commit is deterministic, so it can be
  built anywhere the gates pass — including by an assistant session with the repo mounted. Verify
  whatever you were handed before attaching it:

  ```bash
  shasum -a 256 dist/revizto-project-intelligence-v1.0.4.plugin   # compare to the stated hash
  unzip -l  dist/revizto-project-intelligence-v1.0.4.plugin       # 19 entries, 3 skills, no tests/tools
  ```

**Install Node anyway when you get a moment** — the local loop is worth having, and it is the
difference between catching a stale manifest in two seconds and catching it in a CI run.

```bash
brew install node          # if you have Homebrew
node -v && npm -v          # expect v20+ / v10+
```

No Homebrew: use the macOS installer from <https://nodejs.org> (LTS), then reopen Terminal. If
`node -v` works but `npm` does not, you are probably on an nvm install that your shell profile is not
loading — `source ~/.nvm/nvm.sh` for the current shell, then fix your `~/.zshrc`.

## If you only change `dashboard.html`

The short loop:

```bash
node tools/build.mjs && npm run verify && node tools/package.mjs
```

Then bump the version everywhere gate 6 checks, add a CHANGELOG entry quoting the new `buildStamp`,
and start again at step 2.
