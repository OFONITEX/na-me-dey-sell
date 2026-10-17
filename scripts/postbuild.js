import fs from "fs";
import path from "path";

const outDir = path.resolve(process.cwd(), "out");

// Cloudflare Pages SPA handling:
// If 404.html is present in the root of out/, Cloudflare Pages serves it with a 404 status.
// Removing 404.html tells Cloudflare Pages that the site is an SPA, serving index.html with 200 OK for any dynamic event slug.
const html404 = path.join(outDir, "404.html");
if (fs.existsSync(html404)) {
  fs.unlinkSync(html404);
  console.log("✓ Removed out/404.html so Cloudflare Pages routes all dynamic event slugs to index.html with 200 OK");
}

const dir404 = path.join(outDir, "404");
if (fs.existsSync(dir404)) {
  fs.rmSync(dir404, { recursive: true, force: true });
  console.log("✓ Removed out/404 directory");
}
