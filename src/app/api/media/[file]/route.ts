import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

export const dynamic = "force-dynamic";

/** Media is written outside /public because Next.js snapshots public/ at build time. */
export const MEDIA_DIR = path.join(process.cwd(), "storage", "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/**
 * Serves uploaded media. Filenames are content-addressed and strictly validated,
 * so the storage path can never be escaped via the URL.
 */
export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;

  if (!/^[A-Za-z0-9._-]+$/.test(file) || file.includes("..")) {
    return new Response("Invalid media reference", { status: 400 });
  }

  const resolved = path.join(MEDIA_DIR, file);
  if (path.dirname(resolved) !== MEDIA_DIR) {
    return new Response("Invalid media reference", { status: 400 });
  }

  let info;
  try {
    info = await stat(resolved);
  } catch {
    return new Response("Media not found", { status: 404 });
  }
  if (!info.isFile()) return new Response("Media not found", { status: 404 });

  const contentType = MIME[path.extname(file).toLowerCase()];
  if (!contentType) return new Response("Unsupported media type", { status: 415 });

  const stream = Readable.toWeb(createReadStream(resolved)) as WebReadableStream<Uint8Array>;
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "content-type": contentType,
      "content-length": String(info.size),
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
