import type { NextRequest } from "next/server";
import { handle, jsonBody, respond } from "@/lib/api/admin";
import { bulkCreateResults } from "@/lib/admin/results";

export const dynamic = "force-dynamic";

/** POST /api/admin/results/bulk — `{ rows: [...] }`, all or nothing. */
export async function POST(request: NextRequest) {
  return handle(async () => respond(await bulkCreateResults(await jsonBody(request)), 201));
}
