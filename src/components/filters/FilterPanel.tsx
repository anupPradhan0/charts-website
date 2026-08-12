"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { SORT_OPTIONS, STATUS_OPTIONS, buildQuery } from "@/lib/services/query";
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
  categories: Pick<Category, "slug" | "name">[];
  basePath: string;
  defaults: FilterValues;
  /** Category pages filter to one category already — hide the selector. */
  lockCategory?: boolean;
  min?: string;
  max?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const id = useId();

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
          Filters
          {activeCount > 0 ? (
            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {activeCount} active
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
          {open ? "Hide" : "Show"}
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
              Search
            </label>
            <input
              id={`${id}-search`}
              type="search"
              placeholder="Category, date or value"
              className={field}
              {...register("search")}
            />
          </div>

          {!lockCategory ? (
            <div>
              <label className={label} htmlFor={`${id}-category`}>
                Category
              </label>
              <select id={`${id}-category`} className={field} {...register("category")}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
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
                From
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
                    "Start date must be on or before the end date",
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
                To
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
              Status
            </label>
            <select id={`${id}-status`} className={field} {...register("status")}>
              <option value="">Any status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor={`${id}-sort`}>
              Sort
            </label>
            <select id={`${id}-sort`} className={field} {...register("sort")}>
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
            Apply filters
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
            Clear filters
          </button>
        </div>
      </form>
    </section>
  );
}
