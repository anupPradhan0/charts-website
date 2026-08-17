"use server";

import { redirect } from "next/navigation";
import { UnauthorizedError, signIn, setSessionCookie, signOut } from "@/lib/admin/auth";
import {
  createCategory,
  deleteCategory,
  setCategoryActive,
  updateCategory,
} from "@/lib/admin/categories";
import {
  bulkCreateResults,
  createResult,
  deleteResult,
  updateResult,
} from "@/lib/admin/results";
import type { Outcome } from "@/lib/admin/schemas";
import type { BulkRowInput, FormState } from "@/lib/admin/form-state";

/**
 * Server actions for the admin panel.
 *
 * These are a thin translation layer: FormData in, service call, redirect or
 * error state out. Validation, authorization and every database write live in
 * `src/lib/admin/*`, which the JSON API calls too — no rule is implemented
 * twice, and none of them can be reached without passing `requireAdmin()`.
 */

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function optionalStr(form: FormData, key: string): string | null {
  const value = str(form, key).trim();
  return value === "" ? null : value;
}

function toState(outcome: Extract<Outcome<unknown>, { ok: false }>): FormState {
  return { status: "error", message: outcome.message, fieldErrors: outcome.fieldErrors };
}

/** Every action funnels through here so an expired session sends the
 *  administrator to the sign-in page instead of surfacing a stack trace. */
async function guard<T>(run: () => Promise<Outcome<T>>): Promise<Outcome<T>> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/admin/login");
    throw error;
  }
}

function categoryFrom(form: FormData) {
  return {
    name: { en: str(form, "name.en"), hi: str(form, "name.hi"), or: str(form, "name.or") },
    slug: str(form, "slug"),
    description: {
      en: str(form, "description.en"),
      hi: str(form, "description.hi"),
      or: str(form, "description.or"),
    },
    scheduleTime: str(form, "scheduleTime"),
    group: str(form, "group"),
    isActive: form.get("isActive") !== null,
    displayOrder: str(form, "displayOrder"),
    updateFrequency: str(form, "updateFrequency"),
    accent: str(form, "accent"),
  };
}

function resultFrom(form: FormData) {
  return {
    categoryId: str(form, "categoryId"),
    value: optionalStr(form, "value"),
    publishedDate: str(form, "publishedDate"),
    publishedTime: str(form, "publishedTime"),
    status: str(form, "status"),
  };
}

// ---------------------------------------------------------------- sessions ---

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim();
  const password = str(form, "password");
  if (!email || !password) {
    return { status: "error", message: "admin.errors.credentialsRequired" };
  }

  const token = await signIn(email, password);
  if (!token) return { status: "error", message: "admin.errors.badCredentials" };

  await setSessionCookie(token);
  const next = str(form, "next");
  redirect(next.startsWith("/admin") ? next : "/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}

// -------------------------------------------------------------- categories ---

export async function createCategoryAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const outcome = await guard(() => createCategory(categoryFrom(form)));
  if (!outcome.ok) return toState(outcome);
  redirect("/admin/categories?notice=created");
}

export async function updateCategoryAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const id = str(form, "id");
  const outcome = await guard(() => updateCategory(id, categoryFrom(form)));
  if (!outcome.ok) return toState(outcome);
  redirect("/admin/categories?notice=updated");
}

export async function toggleCategoryAction(form: FormData): Promise<void> {
  const id = str(form, "id");
  const next = str(form, "isActive") === "true";
  const outcome = await guard(() => setCategoryActive(id, next));
  const notice = !outcome.ok
    ? "error"
    : next
      ? "activated"
      : "deactivated";
  redirect(`${str(form, "returnTo") || "/admin/categories"}?notice=${notice}`);
}

export async function deleteCategoryAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const outcome = await guard(() => deleteCategory(str(form, "id")));
  if (!outcome.ok) return toState(outcome);
  redirect("/admin/categories?notice=deleted");
}

// ----------------------------------------------------------------- results ---

export async function createResultAction(_prev: FormState, form: FormData): Promise<FormState> {
  const outcome = await guard(() => createResult(resultFrom(form)));
  if (!outcome.ok) return toState(outcome);
  redirect("/admin/results?notice=created");
}

export async function updateResultAction(_prev: FormState, form: FormData): Promise<FormState> {
  const id = str(form, "id");
  const outcome = await guard(() => updateResult(id, resultFrom(form)));
  if (!outcome.ok) return toState(outcome);
  redirect("/admin/results?notice=updated");
}

export async function deleteResultAction(_prev: FormState, form: FormData): Promise<FormState> {
  const outcome = await guard(() => deleteResult(str(form, "id")));
  if (!outcome.ok) return toState(outcome);
  redirect("/admin/results?notice=deleted");
}

export async function bulkCreateResultsAction(
  _prev: FormState,
  rows: BulkRowInput[],
): Promise<FormState> {
  const outcome = await guard(() => bulkCreateResults({ rows }));
  if (!outcome.ok) return toState(outcome);
  redirect(`/admin/results?notice=bulkCreated&count=${outcome.data.created}`);
}
