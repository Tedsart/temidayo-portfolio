"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct, setProductPublished } from "@/actions/products";
import { Button } from "@/components/ui/primitives";

/** Publish / unpublish / delete for one row of the products list. */
export function ProductRowActions({
  id,
  published,
  title,
}: {
  id: string;
  published: boolean;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function toggle() {
    setBusy(true);
    const result = await setProductPublished(id, !published);
    setBusy(false);
    if (!result.ok) window.alert(result.error);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const result = await deleteProduct(id);
    setBusy(false);
    setConfirming(false);
    if (!result.ok) window.alert(result.error);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-3">
        <span className="text-xs text-muted">Delete “{title}”?</span>
        <Button variant="danger" disabled={busy} onClick={remove}>
          Yes, delete
        </Button>
        <Button variant="quiet" disabled={busy} onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button variant="quiet" disabled={busy} onClick={toggle}>
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="danger" disabled={busy} onClick={() => setConfirming(true)}>
        Delete
      </Button>
    </div>
  );
}
