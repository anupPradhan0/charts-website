"use client";

import { useActionState, useRef } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/core";
import { cn } from "@/lib/utils/format";
import { IDLE, type FormState } from "@/lib/admin/form-state";

/**
 * Delete, behind a confirmation.
 *
 * Uses the platform's own `<dialog>` element: modal semantics, focus trapping,
 * Escape-to-close and the backdrop all come for free, and the markup stays
 * inside the viewport at 320px.
 *
 * When `blockedReason` is set the dialog explains why deletion is unavailable
 * and offers no delete button — that is the "results still depend on this
 * category" case, and the fix is deactivation, not force.
 */
export function DeleteButton({
  action,
  id,
  title,
  subject,
  body,
  blockedReason,
  label,
  compact = false,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  id: string;
  title: string;
  subject?: string;
  body: string;
  blockedReason?: string;
  label?: string;
  compact?: boolean;
}) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(action, IDLE);

  const message = state.status === "error" ? t(state.message as TranslationKey) : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={cn(
          buttonClass("ghost", "text-danger hover:bg-danger-soft"),
          compact && "px-2",
        )}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {compact ? <span className="sr-only">{t("admin.common.delete")}</span> : (label ?? t("admin.common.delete"))}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`delete-${id}-title`}
        className="w-[calc(100vw-2rem)] max-w-md rounded-card border border-line bg-surface p-0 text-fg shadow-pop backdrop:bg-black/50"
      >
        <div className="p-4 sm:p-5">
          <h2
            id={`delete-${id}-title`}
            className="flex items-start gap-2 text-base font-semibold tracking-tight text-pretty"
          >
            <AlertTriangle
              className={cn("mt-0.5 size-5 shrink-0", blockedReason ? "text-warn" : "text-danger")}
              aria-hidden="true"
            />
            {title}
          </h2>
          {subject ? (
            <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium break-anywhere">
              {subject}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted text-pretty">{blockedReason ?? body}</p>

          {message ? (
            <p role="alert" className="mt-3 text-sm text-danger text-pretty">
              {message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className={buttonClass("secondary", "w-full sm:w-auto")}
            >
              {blockedReason ? t("admin.common.back") : t("admin.common.cancel")}
            </button>
            {blockedReason ? null : (
              <form action={formAction} className="w-full sm:w-auto">
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={pending}
                  className={buttonClass(
                    "primary",
                    "w-full bg-danger hover:bg-danger sm:w-auto",
                  )}
                >
                  {pending ? t("admin.common.deleting") : t("admin.common.delete")}
                </button>
              </form>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
