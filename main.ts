// Deal Drop: the entry program for black-friday-deal-finder-01 (Node 22,
// standard library only).
//
// The site lives in app/ beside this file: plain static files a browser
// opens at app/index.html, its deals in its own data.js, nothing loaded over
// the network. This program hands it in: it copies app/ and screenshots/
// into the output directory and writes output/dossier.json, the summary the
// judge reads, built with the vendored make.fun library.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output directory itself is never removed or re-permissioned: only the
// entries this program puts inside it are replaced, and every file it writes
// is left readable (mode 0644) with directories at 0755.

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Make sure the output directory exists; never delete it or touch its mode.
mkdirSync(out, { recursive: true });

// Replace only what this program owns inside the output directory, so a
// stale file from an earlier run can never ride along.
for (const name of ["app", "screenshots", "dossier.json"]) {
  const target = join(out, name);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}

cpSync(join(here, "app"), join(out, "app"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

// Leave every output readable by the collector, which runs as another user:
// files 0644, directories 0755. Only entries inside the output directory
// are touched, never the directory itself.
function fixModes(path) {
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      chmodSync(full, 0o755);
      fixModes(full);
    } else {
      chmodSync(full, 0o644);
    }
  }
}
fixModes(out);
