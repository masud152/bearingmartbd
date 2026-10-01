import "server-only";
import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, unlink } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

export type MediaStorage = {
  put(key: string, body: ReadableStream, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata: { contentType: string }; writeHttpMetadata(headers: Headers): void; httpEtag: string } | null>;
  delete(key: string): Promise<void>;
};

function mediaRoot() {
  const root = process.env.MEDIA_ROOT;
  if (!root) throw new Error("MEDIA_ROOT is required for file storage.");
  return resolve(root);
}

function safePath(key: string) {
  const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("Invalid media key.");
  const file = resolve(mediaRoot(), normalized);
  if (!file.startsWith(`${mediaRoot()}${sep}`)) throw new Error("Invalid media path.");
  return file;
}

function contentType(key: string) {
  const extension = extname(key).toLowerCase();
  return ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" } as Record<string, string>)[extension] ?? "application/octet-stream";
}

export const mediaStorage: MediaStorage = {
  async put(key, body) {
    const destination = safePath(key);
    await mkdir(dirname(destination), { recursive: true });
    await pipeline(Readable.fromWeb(body as never), createWriteStream(destination, { flags: "wx" }));
  },
  async get(key) {
    const file = safePath(key);
    try { await access(file); } catch { return null; }
    const type = contentType(key);
    return {
      body: Readable.toWeb(createReadStream(file)) as ReadableStream,
      httpMetadata: { contentType: type },
      httpEtag: `W/\"${key}\"`,
      writeHttpMetadata(headers) { headers.set("content-type", type); },
    };
  },
  async delete(key) {    try { await unlink(safePath(key)); } catch (error) { if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error; }  },};
