"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { buttonClass, Card, CardHeader } from "@/components/ui/primitives";
import { ERROR, FIELD, HINT, INVALID, LABEL } from "./fields";
import { useT, useLocale } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/core";
import { localized } from "@/lib/i18n/localize";
import { cn } from "@/lib/utils/format";
import { IDLE, type FormState } from "@/lib/admin/form-state";
import type { LocalizedText } from "@/types";

/**
 * Create / edit one result.
 *
 * Categories come from the database, never a hardcoded list. The value field is
 * bound to the status: an unpublished entry cannot carry a value, which is the
 * same rule the server enforces — here it is expressed by disabling the input
 * rather than by rejecting the submission.
 */

export interface CategoryOption {
  id: string;
  slug: string;
  name: LocalizedText;
  scheduleTime: string;
  isActive: boolean;
}

export interface ResultFormValues {
  categoryId: string;
  value: string;
  publishedDate: string;
  publishedTime: string;
  status: string;
}

export function ResultForm({
  action,
  categories,
  defaults,
  id,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  categories: CategoryOption[];
  defaults: ResultFormValues;
  id?: string;
  submitLabel: string;
  cancelHref: string;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, IDLE);
  const { register, setValue, formState } = useForm<ResultFormValues>({
    defaultValues: defaults,
  });

  const [status, setStatus] = useState(defaults.status);
  const published = status === "published";

  const dirty = formState.isDirty && !pending;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const message = (key?: string) => (key ? t(key as TranslationKey) : undefined);
  const errorFor = (path: string) =>
    state.status === "error" ? message(state.fieldErrors?.[path]) : undefined;

  const statuses = [
    { value: "published", label: t("status.published") },
    { value: "pending", label: t("status.pending") },
    { value: "scheduled", label: t("status.scheduled") },
  ];

  return (
    <form action={formAction} className="space-y-4">
      {id ? <input type="hidden" name="id" value={id} /> : null}

      {state.status === "error" ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-card border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {message(state.message)}
        </p>
      ) : null}

      <Card>
        <CardHeader title={t("admin.form.details")} />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="categoryId">
              {t("admin.form.category")}
            </label>
            <select
              id="categoryId"
              required
              className={cn(FIELD, errorFor("categoryId") && INVALID)}
              {...register("categoryId", {
                // Choosing a category pre-fills its scheduled slot on a new entry.
                onChange: (event) => {
                  if (id) return;
                  const slot = categories.find((c) => c.id === event.target.value)?.scheduleTime;
                  if (slot) setValue("publishedTime", slot);
                },
              })}
            >
              <option value="">{t("admin.form.chooseCategory")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {localized(category.name, locale)}
                  {category.isActive ? "" : ` · ${t("admin.common.inactive")}`}
                </option>
              ))}
            </select>
            {errorFor("categoryId") ? <p className={ERROR}>{errorFor("categoryId")}</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="publishedDate">
              {t("admin.form.publishedDate")}
            </label>
            <input
              id="publishedDate"
              type="date"
              required
              className={cn(FIELD, errorFor("publishedDate") && INVALID)}
              {...register("publishedDate")}
            />
            {errorFor("publishedDate") ? <p className={ERROR}>{errorFor("publishedDate")}</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="publishedTime">
              {t("admin.form.publishedTime")}
            </label>
            <input
              id="publishedTime"
              type="time"
              required
              className={cn(FIELD, errorFor("publishedTime") && INVALID)}
              {...register("publishedTime")}
            />
            {errorFor("publishedTime") ? <p className={ERROR}>{errorFor("publishedTime")}</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="status">
              {t("admin.form.status")}
            </label>
            <select
              id="status"
              className={FIELD}
              {...register("status", {
                // A status change either frees the value field or empties it.
                onChange: (event) => {
                  setStatus(event.target.value);
                  if (event.target.value !== "published") setValue("value", "");
                },
              })}
            >
              {statuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="value">
              {t("admin.form.value")}
            </label>
            <input
              id="value"
              inputMode="numeric"
              pattern="\d{2}"
              maxLength={2}
              disabled={!published}
              required={published}
              placeholder={published ? "00" : "—"}
              className={cn(
                FIELD,
                "font-mono",
                !published && "opacity-60",
                errorFor("value") && INVALID,
              )}
              {...register("value")}
            />
            <p className={HINT}>{t("admin.form.valueHint")}</p>
            {errorFor("value") ? <p className={ERROR}>{errorFor("value")}</p> : null}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "w-full sm:w-auto")}
        >
          {pending ? t("admin.common.saving") : submitLabel}
        </button>
        <Link href={cancelHref} className={buttonClass("ghost", "w-full sm:w-auto")}>
          {t("admin.common.cancel")}
        </Link>
        {dirty ? <p className="text-xs text-muted sm:ml-2">{t("admin.form.unsaved")}</p> : null}
      </div>
    </form>
  );
}
