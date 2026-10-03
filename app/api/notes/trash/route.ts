import { NextRequest } from "next/server";
import { requireOwner } from "@/src/notes/auth";
import { failure, json } from "@/src/notes/http";
import { listDiscardedNotes } from "@/src/notes/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireOwner(req);
    return json(await listDiscardedNotes(req.nextUrl.searchParams.get("cursor")));
  } catch (error) { return failure(error); }
}
