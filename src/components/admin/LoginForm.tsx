"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { FIELD, LABEL } from "./fields";
import { useT } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/core";
import { IDLE, type FormState } from "@/lib/admin/form-state";

export function LoginForm({
  action,
  next,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  next?: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, IDLE);

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.status === "error" ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t(state.message as TranslationKey)}
        </p>
      ) : null}

      <div>
        <label className={LABEL} htmlFor="email">
          {t("admin.login.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={FIELD}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="password">
          {t("admin.login.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>

      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full")}>
        {pending ? t("admin.login.signingIn") : t("admin.login.submit")}
      </button>
    </form>
  );
}
