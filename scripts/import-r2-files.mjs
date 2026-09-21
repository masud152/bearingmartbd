import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

const [manifestPath, sourceRoot] = process.argv.slice(2);
const mediaRoot = process.env.MEDIA_ROOT;
if (!manifestPath || !sourceRoot || !mediaRoot) throw new Error("Usage: MEDIA_ROOT=/private/media node scripts/import-r2-files.mjs <approved-r2-manifest.json> <r2-export-directory>");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const keys = Array.isArray(manifest.keys) ? manifest.keys : manifest;
if (!Array.isArray(keys)) throw new Error("Manifest must be an array or { keys: [...] }");
const targetRoot = resolve(mediaRoot);
for (const key of keys) {
  if (typeof key !== "string" || !key || key.includes("\0")) throw new Error("Invalid object key");
  const source = resolve(sourceRoot, key);
  const target = resolve(targetRoot, key);
  if (relative(resolve(sourceRoot), source).startsWith("..") || relative(targetRoot, target).startsWith("..")) throw new Error(`Unsafe object key: ${key}`);
  try { await stat(target); throw new Error(`Refusing to overwrite existing media: ${key}`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  await stat(source);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}
console.log(`Imported ${keys.length} R2 objects without overwriting existing files.`);
