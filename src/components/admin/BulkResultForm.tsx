"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, X } from "lucide-react";
import { buttonClass, Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { ERROR, FIELD, HINT, INVALID, LABEL } from "./fields";
import { useLocale, useT } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/core";
import { localized } from "@/lib/i18n/localize";
import { cn } from "@/lib/utils/format";
import { IDLE, type BulkRowInput, type FormState } from "@/lib/admin/form-state";
import type { CategoryOption } from "./ResultForm";

/**
 * Bulk result entry.
 *
 * Rows are held in client state and submitted as one payload: the server writes
 * them inside a single transaction, so either the whole batch lands or nothing
 * does. Field errors come back addressed as `rows.<index>.<field>` and are
 * shown against the row that caused them.
 */

interface Row {
  categoryId: string;
  publishedDate: string;
  publishedTime: string;
  value: string;
  status: string;
}

function blankRow(categories: CategoryOption[], today: string): Row {
  const first = categories[0];
  return {
    categoryId: first?.id ?? "",
    publishedDate: today,
    publishedTime: first?.scheduleTime ?? "12:00",
    value: "",
    status: "published",
  };
}

export function BulkResultForm({
  action,
  categories,
  today,
}: {
  action: (state: FormState, rows: BulkRowInput[]) => Promise<FormState>;
  categories: CategoryOption[];
  today: string;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, submit, pending] = useActionState(action, IDLE);
  const [rows, setRows] = useState<Row[]>([blankRow(categories, today)]);

  const message = (key?: string) => (key ? t(key as TranslationKey) : undefined);
  const errorFor = (path: string) =>
    state.status === "error" ? message(state.fieldErrors?.[path]) : undefined;

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const statuses = [
    { value: "published", label: t("status.published") },
    { value: "pending", label: t("status.pending") },
    { value: "scheduled", label: t("status.scheduled") },
  ];

  return (
    <div className="space-y-4">
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
        <CardHeader title={t("admin.bulk.title")} description={t("admin.bulk.hint")} />

        {rows.length === 0 ? (
          <EmptyState title={t("admin.bulk.empty")} />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row, index) => {
              const published = row.status === "published";
              return (
                <li key={index} className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted">
                      {t("admin.bulk.rowLabel", { index: index + 1 })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRows((c) => c.filter((_, i) => i !== index))}
                      className={cn(buttonClass("ghost"), "px-2 text-danger")}
                    >
                      <X className="size-4" aria-hidden="true" />
                      <span className="sr-only">{t("admin.bulk.removeRow")}</span>
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                      <label className={LABEL} htmlFor={`bulk-${index}-category`}>
                        {t("admin.form.category")}
                      </label>
                      <select
                        id={`bulk-${index}-category`}
                        className={cn(FIELD, errorFor(`rows.${index}.categoryId`) && INVALID)}
                        value={row.categoryId}
                        onChange={(event) => {
                          const categoryId = event.target.value;
                          const slot = categories.find((c) => c.id === categoryId)?.scheduleTime;
                          update(index, {
                            categoryId,
                            ...(slot ? { publishedTime: slot } : {}),
                          });
                        }}
                      >
                        <option value="">{t("admin.form.chooseCategory")}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {localized(category.name, locale)}
                          </option>
                        ))}
                      </select>
                      {errorFor(`rows.${index}.categoryId`) ? (
                        <p className={ERROR}>{errorFor(`rows.${index}.categoryId`)}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className={LABEL} htmlFor={`bulk-${index}-date`}>
                        {t("admin.form.publishedDate")}
                      </label>
                      <input
                        id={`bulk-${index}-date`}
                        type="date"
                        className={cn(FIELD, errorFor(`rows.${index}.publishedDate`) && INVALID)}
                        value={row.publishedDate}
                        onChange={(event) => update(index, { publishedDate: event.target.value })}
                      />
                      {errorFor(`rows.${index}.publishedDate`) ? (
                        <p className={ERROR}>{errorFor(`rows.${index}.publishedDate`)}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className={LABEL} htmlFor={`bulk-${index}-time`}>
                        {t("admin.form.publishedTime")}
                      </label>
                      <input
                        id={`bulk-${index}-time`}
                        type="time"
                        className={cn(FIELD, errorFor(`rows.${index}.publishedTime`) && INVALID)}
                        value={row.publishedTime}
                        onChange={(event) => update(index, { publishedTime: event.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1 lg:grid-cols-1 lg:gap-3">
                      <div>
                        <label className={LABEL} htmlFor={`bulk-${index}-status`}>
                          {t("admin.form.status")}
                        </label>
                        <select
                          id={`bulk-${index}-status`}
                          className={FIELD}
                          value={row.status}
                          onChange={(event) =>
                            update(index, {
                              status: event.target.value,
                              ...(event.target.value === "published" ? {} : { value: "" }),
                            })
                          }
                        >
                          {statuses.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={LABEL} htmlFor={`bulk-${index}-value`}>
                          {t("admin.form.value")}
                        </label>
                        <input
                          id={`bulk-${index}-value`}
                          inputMode="numeric"
                          pattern="\d{2}"
                          maxLength={2}
                          disabled={!published}
                          placeholder={published ? "00" : "—"}
                          className={cn(
                            FIELD,
                            "font-mono",
                            !published && "opacity-60",
                            errorFor(`rows.${index}.value`) && INVALID,
                          )}
                          value={row.value}
                          onChange={(event) => update(index, { value: event.target.value })}
                        />
                        {errorFor(`rows.${index}.value`) ? (
                          <p className={ERROR}>{errorFor(`rows.${index}.value`)}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-line p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setRows((c) => [...c, blankRow(categories, today)])}
            className={buttonClass("secondary", "w-full sm:w-auto")}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("admin.bulk.addRow")}
          </button>
          <p className={HINT}>{t("admin.bulk.description")}</p>
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={pending || rows.length === 0}
          onClick={() =>
            submit(
              rows.map((row) => ({
                categoryId: row.categoryId,
                value: row.value.trim() === "" ? null : row.value.trim(),
                publishedDate: row.publishedDate,
                publishedTime: row.publishedTime,
                status: row.status,
              })),
            )
          }
          className={buttonClass("primary", "w-full sm:w-auto")}
        >
          {pending
            ? t("admin.bulk.submitting")
            : rows.length === 1
              ? t("admin.bulk.submitOne")
              : t("admin.bulk.submit", { count: rows.length })}
        </button>
        <Link href="/admin/results" className={buttonClass("ghost", "w-full sm:w-auto")}>
          {t("admin.common.cancel")}
        </Link>
      </div>
    </div>
  );
}
