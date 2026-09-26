"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs text-muted underline underline-offset-4 transition-colors hover:text-danger disabled:opacity-50"
      onClick={() =>
        startTransition(async () => {
          await logoutAction();
          router.push("/admin/login");
          router.refresh();
        })
      }
    >
      {pending ? "Signing out…" : "Log out"}
    </button>
  );
}
