"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { buttonClass, Card, CardHeader } from "@/components/ui/primitives";
import { AREA, ERROR, FIELD, HINT, INVALID, LABEL } from "./fields";
import { useT } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/core";
import { slugify } from "@/lib/admin/schemas";
import { cn } from "@/lib/utils/format";
import { IDLE, type FormState } from "@/lib/admin/form-state";

/**
 * Create / edit a category.
 *
 * The server action is the only validator that matters — this form adds the
 * conveniences a human wants: a slug derived from the name until they touch it,
 * a warning before leaving with unsaved changes, and server field errors shown
 * against the field that caused them.
 *
 * It is a plain `<form action={...}>`, so it still submits before hydration.
 */

export interface CategoryFormValues {
  name: { en: string; hi: string; or: string };
  slug: string;
  description: { en: string; hi: string; or: string };
  scheduleTime: string;
  group: string;
  isActive: boolean;
  displayOrder: number | string;
  updateFrequency: string;
  accent: number | string;
}

export function CategoryForm({
  action,
  defaults,
  id,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  defaults: CategoryFormValues;
  id?: string;
  submitLabel: string;
  cancelHref: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, IDLE);
  const { register, setValue, formState } = useForm<CategoryFormValues>({
    defaultValues: defaults,
  });

  // The slug follows the name until the administrator types their own.
  const [slugTouched, setSlugTouched] = useState(defaults.slug !== "");

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

  const groups = [
    { value: "day", label: t("admin.form.groupDay") },
    { value: "night", label: t("admin.form.groupNight") },
    { value: "special", label: t("admin.form.groupSpecial") },
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
            <label className={LABEL} htmlFor="name-en">
              {t("admin.form.nameEn")}
            </label>
            <input
              id="name-en"
              className={cn(FIELD, errorFor("name.en") && INVALID)}
              maxLength={80}
              required
              aria-invalid={errorFor("name.en") ? true : undefined}
              aria-describedby={errorFor("name.en") ? "name-en-error" : undefined}
              {...register("name.en", {
                onChange: (event) => {
                  if (!slugTouched) setValue("slug", slugify(event.target.value));
                },
              })}
            />
            {errorFor("name.en") ? (
              <p id="name-en-error" className={ERROR}>
                {errorFor("name.en")}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="slug">
              {t("admin.form.slug")}
            </label>
            <input
              id="slug"
              className={cn(FIELD, "font-mono", errorFor("slug") && INVALID)}
              maxLength={64}
              required
              aria-invalid={errorFor("slug") ? true : undefined}
              {...register("slug", { onChange: () => setSlugTouched(true) })}
            />
            <p className={HINT}>{t("admin.form.slugHint")}</p>
            {errorFor("slug") ? <p className={ERROR}>{errorFor("slug")}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="description-en">
              {t("admin.form.descriptionEn")}
            </label>
            <textarea
              id="description-en"
              rows={3}
              maxLength={600}
              required
              className={cn(AREA, errorFor("description.en") && INVALID)}
              aria-invalid={errorFor("description.en") ? true : undefined}
              {...register("description.en")}
            />
            {errorFor("description.en") ? (
              <p className={ERROR}>{errorFor("description.en")}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="scheduleTime">
              {t("admin.form.scheduleTime")}
            </label>
            <input
              id="scheduleTime"
              type="time"
              required
              className={cn(FIELD, errorFor("scheduleTime") && INVALID)}
              {...register("scheduleTime")}
            />
            <p className={HINT}>{t("admin.form.scheduleTimeHint")}</p>
            {errorFor("scheduleTime") ? <p className={ERROR}>{errorFor("scheduleTime")}</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="group">
              {t("admin.form.group")}
            </label>
            <select id="group" className={FIELD} {...register("group")}>
              {groups.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="displayOrder">
              {t("admin.form.displayOrder")}
            </label>
            <input
              id="displayOrder"
              type="number"
              min={0}
              max={9999}
              step={1}
              required
              className={cn(FIELD, errorFor("displayOrder") && INVALID)}
              {...register("displayOrder")}
            />
            <p className={HINT}>{t("admin.form.displayOrderHint")}</p>
            {errorFor("displayOrder") ? <p className={ERROR}>{errorFor("displayOrder")}</p> : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="updateFrequency">
              {t("admin.form.updateFrequency")}
            </label>
            <input
              id="updateFrequency"
              maxLength={32}
              required
              className={cn(FIELD, errorFor("updateFrequency") && INVALID)}
              {...register("updateFrequency")}
            />
            {errorFor("updateFrequency") ? (
              <p className={ERROR}>{errorFor("updateFrequency")}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL} htmlFor="accent">
              {t("admin.form.accent")}
            </label>
            <select id="accent" className={FIELD} {...register("accent")}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {t("admin.form.accentOption", { number: n })}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4"
                {...register("isActive")}
                value="true"
              />
              {t("admin.form.isActive")}
            </label>
            <p className={HINT}>{t("admin.form.isActiveHint")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t("admin.form.translations")}
          description={t("admin.form.translationsHint")}
        />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <label className={LABEL} htmlFor="name-hi">
              {t("admin.form.nameHi")}
            </label>
            <input id="name-hi" className={FIELD} maxLength={80} {...register("name.hi")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="name-or">
              {t("admin.form.nameOr")}
            </label>
            <input id="name-or" className={FIELD} maxLength={80} {...register("name.or")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="description-hi">
              {t("admin.form.descriptionHi")}
            </label>
            <textarea
              id="description-hi"
              rows={3}
              maxLength={600}
              className={AREA}
              {...register("description.hi")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="description-or">
              {t("admin.form.descriptionOr")}
            </label>
            <textarea
              id="description-or"
              rows={3}
              maxLength={600}
              className={AREA}
              {...register("description.or")}
            />
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
