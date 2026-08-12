"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { buildQuery } from "@/lib/services/query";
import { useLocale, useT } from "@/lib/i18n/client";
import { localized } from "@/lib/i18n/localize";
import { cn } from "@/lib/utils/format";
import type { Category } from "@/types";

export interface FilterValues {
  search: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  sort: string;
}

/**
 * Filter panel.
 *
 * Filters live in the URL, not in component state: every filtered view is
 * shareable, refresh-safe and back/forward-navigable, and the server renders
 * the filtered page directly. React Hook Form manages the field values and the
 * one cross-field rule (start date cannot be after end date).
 *
 * The panel is a normal <form> with a submit button, so it also works before
 * hydration. Below `lg` it collapses behind a disclosure button.
 */
export function FilterPanel({
  categories,
  basePath,
  defaults,
  lockCategory = false,
  min,
  max,
}: {
  categories: Category[];
  basePath: string;
  defaults: FilterValues;
  /** Category pages filter to one category already — hide the selector. */
  lockCategory?: boolean;
  min?: string;
  max?: string;
}) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const id = useId();

  const sortOptions = [
    { value: "date_desc", label: t("sort.newest") },
    { value: "date_asc", label: t("sort.oldest") },
    { value: "value_desc", label: t("sort.valueHigh") },
    { value: "value_asc", label: t("sort.valueLow") },
    { value: "category_asc", label: t("sort.marketAZ") },
  ];
  const statusOptions = [
    { value: "published", label: t("status.published") },
    { value: "pending", label: t("status.pending") },
    { value: "scheduled", label: t("status.scheduled") },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilterValues>({ defaultValues: defaults });

  // Keep fields in step with the URL when navigation happens elsewhere
  // (pagination links, sortable table headers, "clear filters").
  const defaultsKey = JSON.stringify(defaults);
  useEffect(() => {
    reset(JSON.parse(defaultsKey) as FilterValues);
  }, [defaultsKey, reset]);

  const activeCount = Object.entries(defaults).filter(
    ([key, value]) => value !== "" && !(key === "sort" && value === "date_desc"),
  ).length;

  const onSubmit = handleSubmit((values) => {
    router.push(`${basePath}${buildQuery({ ...values, page: 1 })}`, { scroll: false });
  });

  // 16px text is deliberate: iOS zooms the viewport when a focused input is
  // smaller than that, which reads as the page "jumping" on every tap.
  const field =
    "h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:text-sm";
  const label = "mb-1 block text-xs font-medium text-muted";

  return (
    <section aria-labelledby={`${id}-heading`} className="border-b border-line">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
        <h2 id={`${id}-heading`} className="text-sm font-semibold">
          {t("filters.heading")}
          {activeCount > 0 ? (
            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {t("filters.activeCount", { count: activeCount })}
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className={cn(buttonClass("secondary"), "lg:hidden")}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {open ? t("common.hide") : t("common.show")}
        </button>
      </div>

      <form
        id={`${id}-panel`}
        onSubmit={onSubmit}
        method="get"
        action={basePath}
        className={cn("px-4 pb-4 lg:block lg:px-5", open ? "block" : "hidden")}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {/* Order matters on mobile: search first, then scope, then sort. */}
          <div className={lockCategory ? "sm:col-span-2 lg:col-span-2" : ""}>
            <label className={label} htmlFor={`${id}-search`}>
              {t("filters.search")}
            </label>
            <input
              id={`${id}-search`}
              type="search"
              placeholder={t("filters.searchPlaceholder")}
              className={field}
              {...register("search")}
            />
          </div>

          {!lockCategory ? (
            <div>
              <label className={label} htmlFor={`${id}-category`}>
                {t("filters.market")}
              </label>
              <select id={`${id}-category`} className={field} {...register("category")}>
                <option value="">{t("filters.allMarkets")}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {localized(c.name, locale)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* The date pair shares one row on phones — two full-width date
              fields would push everything else below the fold. `contents`
              dissolves the wrapper once the panel is a wide grid. */}
          <div className="grid grid-cols-2 gap-3 lg:contents">
            <div>
              <label className={label} htmlFor={`${id}-start`}>
                {t("filters.from")}
              </label>
              <input
                id={`${id}-start`}
                type="date"
                min={min}
                max={max}
                className={field}
                aria-invalid={errors.startDate ? true : undefined}
                aria-describedby={errors.startDate ? `${id}-start-error` : undefined}
                {...register("startDate", {
                  validate: (value, values) =>
                    !value ||
                    !values.endDate ||
                    value <= values.endDate ||
                    t("filters.dateOrderError"),
                })}
              />
              {errors.startDate ? (
                <p id={`${id}-start-error`} className="mt-1 text-xs text-danger">
                  {errors.startDate.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className={label} htmlFor={`${id}-end`}>
                {t("filters.to")}
              </label>
              <input
                id={`${id}-end`}
                type="date"
                min={min}
                max={max}
                className={field}
                {...register("endDate")}
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor={`${id}-status`}>
              {t("filters.status")}
            </label>
            <select id={`${id}-status`} className={field} {...register("status")}>
              <option value="">{t("filters.anyStatus")}</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor={`${id}-sort`}>
              {t("sort.label")}
            </label>
            <select id={`${id}-sort`} className={field} {...register("sort")}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
            {t("common.applyFilters")}
          </button>
          <button
            type="button"
            className={buttonClass("ghost", "w-full sm:w-auto")}
            onClick={() => {
              reset({
                search: "",
                category: lockCategory ? defaults.category : "",
                status: "",
                startDate: "",
                endDate: "",
                sort: "date_desc",
              });
              router.push(basePath, { scroll: false });
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t("common.clearFilters")}
          </button>
        </div>
      </form>
    </section>
  );
}
