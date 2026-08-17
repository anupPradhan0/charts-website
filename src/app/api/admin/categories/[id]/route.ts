import { notFound, okPrivate } from "@/lib/api/http";
import { handle, jsonBody, respond } from "@/lib/api/admin";
import { deleteCategory, getAdminCategory, updateCategory } from "@/lib/admin/categories";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/categories/:id */
export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    const row = await getAdminCategory(id);
    return row ? okPrivate({ data: row }) : notFound(`No category with id "${id}"`);
  });
}

/** PATCH /api/admin/categories/:id */
export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    return respond(await updateCategory(id, await jsonBody(request)));
  });
}

/** DELETE /api/admin/categories/:id — refused while results still reference it. */
export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    return respond(await deleteCategory(id));
  });
}
