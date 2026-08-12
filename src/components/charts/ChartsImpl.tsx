"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateShort } from "@/lib/utils/format";

/**
 * Chart implementations. Loaded lazily by `./Charts` — Recharts is the single
 * heaviest dependency in the app and no page needs it above the fold.
 *
 * These are descriptive summaries of data that has already been published.
 * Animation is off (a calm interface, and no reduced-motion special-casing),
 * colours come from the design tokens so both themes work, and every chart is
 * paired with a screen-reader table carrying the same numbers.
 */

const NARROW = "(max-width: 640px)";

/** Phone-sized viewports get tighter axes and shorter charts. Server snapshot
 *  is `false`; these components are client-only, so nothing hydrates twice. */
function useNarrow(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(NARROW);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: "0.5rem",
    fontSize: "0.8125rem",
    color: "var(--fg)",
    boxShadow: "var(--shadow-pop)",
    // A touch tooltip must never hang off the edge of a 320px screen.
    maxWidth: "70vw",
  },
  labelStyle: { color: "var(--fg-muted)", marginBottom: 2 },
  cursor: { fill: "var(--surface-2)" },
  // Touch: keep the tooltip visible long enough to read after a tap.
  wrapperStyle: { outline: "none", zIndex: 10 },
} as const;

function axisProps(narrow: boolean) {
  return {
    stroke: "var(--fg-subtle)",
    fontSize: narrow ? 10 : 11,
    tickLine: false,
    axisLine: false,
  } as const;
}

/** Wraps a chart in a figure and mirrors its data in a visually hidden table
 *  so the information is not lost to screen readers. */
function ChartFigure({
  caption,
  columns,
  rows,
  children,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
  children: React.ReactNode;
}) {
  return (
    <figure className="m-0">
      <div aria-hidden="true">{children}</div>
      <figcaption className="sr-only">{caption}</figcaption>
      {/* The wrapper carries `sr-only`, not the table: a <table> treats
          `width: 1px` as a minimum and expands to its content regardless of
          `overflow: hidden`, which pushed the whole page sideways on phones. */}
      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={j}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function TrendChart({
  data,
  caption,
  height,
}: {
  data: { date: string; published: number; pending: number }[];
  caption: string;
  height?: number;
}) {
  const narrow = useNarrow();
  const axis = axisProps(narrow);
  const chartHeight = height ?? (narrow ? 220 : 260);

  return (
    <ChartFigure
      caption={caption}
      columns={["Date", "Published", "Not published"]}
      rows={data.map((d) => [d.date, d.published, d.pending])}
    >
      <ResponsiveContainer width="100%" height={narrow ? 220 : chartHeight}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: narrow ? -28 : -20 }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            {...axis}
            minTickGap={narrow ? 40 : 24}
            tickFormatter={(value: string) => formatDateShort(value)}
          />
          <YAxis {...axis} allowDecimals={false} width={narrow ? 30 : 40} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(label) =>
              typeof label === "string" ? formatDateShort(label) : label
            }
          />
          <Area
            type="monotone"
            dataKey="published"
            name="Published"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#trendFill)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="pending"
            name="Not published"
            stroke="var(--chart-3)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

export function SimpleBarChart({
  data,
  labelKey,
  tableLabelKey,
  valueKey,
  caption,
  columns,
  color = "var(--chart-1)",
  vertical = false,
  height,
  rowHeight = 34,
  colorByAccent = false,
}: {
  data: readonly Record<string, unknown>[];
  labelKey: string;
  /** Axis labels are abbreviated on phones; the data table keeps the full
   *  wording when this is set. */
  tableLabelKey?: string;
  valueKey: string;
  caption: string;
  columns: [string, string];
  color?: string;
  /** Horizontal bars — better for long category names on narrow screens. */
  vertical?: boolean;
  height?: number;
  /** Vertical charts size to their row count so bars never squash. */
  rowHeight?: number;
  colorByAccent?: boolean;
}) {
  const narrow = useNarrow();
  const axis = axisProps(narrow);
  const chartHeight =
    height ?? (vertical ? Math.max(180, data.length * rowHeight) : narrow ? 220 : 260);

  return (
    <ChartFigure
      caption={caption}
      columns={columns}
      rows={data.map((d) => [String(d[tableLabelKey ?? labelKey]), Number(d[valueKey])])}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data as Record<string, unknown>[]}
          layout={vertical ? "vertical" : "horizontal"}
          margin={
            vertical
              ? { top: 4, right: 12, bottom: 4, left: 0 }
              : { top: 8, right: 8, bottom: 0, left: narrow ? -28 : -20 }
          }
        >
          <CartesianGrid stroke="var(--chart-grid)" vertical={vertical} horizontal={!vertical} />
          {vertical ? (
            <>
              <XAxis type="number" {...axis} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey={labelKey}
                {...axis}
                // The label gutter cannot eat a third of a 320px screen.
                width={narrow ? 76 : 110}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={labelKey} {...axis} interval="preserveStartEnd" />
              <YAxis {...axis} allowDecimals={false} width={narrow ? 30 : 40} />
            </>
          )}
          <Tooltip {...tooltipStyle} />
          <Bar dataKey={valueKey} name={columns[1]} radius={3} isAnimationActive={false}>
            {data.map((row, i) => (
              <Cell
                key={i}
                fill={colorByAccent ? `var(--chart-${Number(row.accent) || 1})` : color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
