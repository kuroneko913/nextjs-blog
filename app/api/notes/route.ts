import { NextRequest } from "next/server";
import { requireOwner, requireSameOrigin } from "@/src/notes/auth";
import { failure, json, readJson } from "@/src/notes/http";
import { parseNote } from "@/src/notes/model";
import { listNotes, saveNote } from "@/src/notes/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try { return json(await listNotes(req.nextUrl.searchParams.get("cursor"))); }
  catch (error) { return failure(error); }
}

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    requireOwner(req);
    const result = await saveNote(parseNote(await readJson(req)));
    return json(result, result.created ? 201 : 200);
  } catch (error) { return failure(error); }
}
