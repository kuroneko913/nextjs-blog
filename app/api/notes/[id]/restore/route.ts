import { NextRequest } from "next/server";
import { requireOwner, requireSameOrigin } from "@/src/notes/auth";
import { failure, json } from "@/src/notes/http";
import { restoreNote } from "@/src/notes/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireSameOrigin(req);
    await requireOwner(req);
    return json({ note: await restoreNote(params.id) });
  } catch (error) { return failure(error); }
}
