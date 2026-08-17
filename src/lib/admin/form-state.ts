import type { FieldErrors } from "./schemas";

/**
 * The shape `useActionState` carries between a form and its server action.
 *
 * Kept out of `app/admin/actions.ts` because a `"use server"` module may only
 * export async functions — `IDLE` is a value, so it lives here instead.
 */

export interface FormState {
  status: "idle" | "error";
  /** A translation key. The form resolves it, so errors are localized. */
  message?: string;
  fieldErrors?: FieldErrors;
}

export const IDLE: FormState = { status: "idle" };

/** One row of the bulk-entry form. */
export interface BulkRowInput {
  categoryId: string;
  value: string | null;
  publishedDate: string;
  publishedTime: string;
  status: string;
}
