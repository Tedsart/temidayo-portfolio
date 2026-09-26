"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { loginAction, type AuthActionResult } from "@/actions/auth";
import { Button, ErrorMessage } from "@/components/ui/primitives";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState<AuthActionResult, FormData>(loginAction, {
    ok: false,
    error: "",
  });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (state.ok) {
      router.push(next);
      router.refresh();
    }
  }, [state, next, router]);

  return (
    <form
      className="mt-8 space-y-5"
      action={(data) => {
        setPending(true);
        formAction(data);
      }}
    >
      <div>
        <label htmlFor="admin-email" className="label-meta block">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none transition-colors focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="label-meta block">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none transition-colors focus:border-ink"
        />
      </div>

      {state.error ? <ErrorMessage>{state.error}</ErrorMessage> : null}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
