/**
 * Build the uploadable plugin package.   node tools/package.mjs
 *
 * Produces dist/revizto-project-intelligence-v<version>.plugin — a zip of what a customer installs,
 * and nothing else. Repo scaffolding (tests, tools, CI, package.json, .git) is deliberately excluded:
 * it is how we build the thing, not part of the thing.
 *
 * It refuses to package unless the gates pass. A release asset that was never verified is exactly the
 * artefact that shipped the `_cb` outage to customers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin/plugin.json'), 'utf8')).version;
const OUT_DIR = path.join(ROOT, 'dist');
const OUT = path.join(OUT_DIR, `revizto-project-intelligence-v${version}.plugin`);

console.log('verifying before packaging…');
try {
  execFileSync(process.execPath, [path.join(ROOT, 'tools/build.mjs'), '--check'], { stdio: 'inherit' });
  execFileSync(process.execPath, [path.join(ROOT, 'tests/run.mjs')], { stdio: 'inherit' });
} catch {
  console.error('\npackage: gates failed - refusing to build a release asset. Fix, then retry.');
  process.exit(1);
}

const INCLUDE = ['.claude-plugin', 'skills', 'README.md', 'CHANGELOG.md', 'LICENSE.md', 'TERMS.md', 'CONNECTORS.md', 'SKILLS-MANIFEST.md'];
const present = INCLUDE.filter(p => fs.existsSync(path.join(ROOT, p)));

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.rmSync(OUT, { force: true });

/* `zip` ships with macOS and most Linux images but is not universal (it is absent from some minimal
   CI containers). Fall back to python3's zipfile so the release can always be cut, and say which
   path was taken - a release step that silently changes tool is a release step you cannot reproduce. */
function have(cmd) { try { execFileSync('which', [cmd], { stdio: 'pipe' }); return true; } catch { return false; } }
if (have('zip')) {
  execFileSync('zip', ['-q', '-r', '-X', OUT, ...present], { cwd: ROOT });
  console.log('packed with: zip');
} else if (have('python3')) {
  const py = [
    'import zipfile,os,sys',
    'out=sys.argv[1]; roots=sys.argv[2:]',
    'z=zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED)',
    'for r in roots:',
    '    if os.path.isfile(r): z.write(r,r); continue',
    '    for dp,dn,fn in os.walk(r):',
    '        dn[:]=[d for d in dn if d not in (".git","node_modules","dist","__pycache__")]',
    '        for f in sorted(fn):',
    '            p=os.path.join(dp,f); z.write(p,p)',
    'z.close()'
  ].join('\n');
  execFileSync('python3', ['-c', py, OUT, ...present], { cwd: ROOT, stdio: 'pipe' });
  console.log('packed with: python3 zipfile (zip not installed)');
} else {
  console.error('package: neither `zip` nor `python3` is available to build the archive.');
  process.exit(1);
}

const bytes = fs.statSync(OUT).size;
console.log(`\nwrote dist/${path.basename(OUT)}  (${bytes.toLocaleString()} bytes)`);
console.log('contents: ' + present.join(', '));
console.log('\nAttach this file to the GitHub release for v' + version + '.');
