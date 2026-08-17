import { notFound, okPrivate } from "@/lib/api/http";
import { handle, jsonBody, respond } from "@/lib/api/admin";
import { deleteResult, getAdminResult, updateResult } from "@/lib/admin/results";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/results/:id */
export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    const row = await getAdminResult(id);
    return row ? okPrivate({ data: row }) : notFound(`No result with id "${id}"`);
  });
}

/** PATCH /api/admin/results/:id */
export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    return respond(await updateResult(id, await jsonBody(request)));
  });
}

/** DELETE /api/admin/results/:id */
export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    return respond(await deleteResult(id));
  });
}
