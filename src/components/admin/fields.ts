/** Form field styling, shared by every admin form.
 *
 *  16px text below `sm` is deliberate: iOS zooms the viewport when a focused
 *  input is smaller than that, which reads as the page jumping on every tap. */
export const FIELD =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:text-sm";
export const AREA =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-base sm:text-sm";
export const LABEL = "mb-1 block text-sm font-medium text-fg";
export const HINT = "mt-1 text-xs text-muted text-pretty";
export const ERROR = "mt-1 text-xs text-danger text-pretty";
export const INVALID = "border-danger";
