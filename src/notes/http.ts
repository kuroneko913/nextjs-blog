import { NextRequest, NextResponse } from "next/server";
import { NoteError } from "./model";

export function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export function failure(error: unknown) {
  if (error instanceof NoteError) return json({ error: error.message }, error.status);
  // Do not log user content or credentials.
  console.error("Experiment notes request failed:", error instanceof Error ? error.name : "UnknownError");
  return json({ error: "接続できませんでした。入力は消さずに、しばらくしてからお試しください。" }, 503);
}

export async function readJson(req: NextRequest, maxBytes = 65536): Promise<unknown> {
  if (!req.headers.get("content-type")?.startsWith("application/json")) throw new NoteError(415, "送信形式が無効です。");
  const reader = req.body?.getReader();
  if (!reader) throw new NoteError(400, "入力内容がありません。");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new NoteError(413, "入力内容が大きすぎます。"); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new NoteError(400, "入力内容を読み取れませんでした。"); }
}
