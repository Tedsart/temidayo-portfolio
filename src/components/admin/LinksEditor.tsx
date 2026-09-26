"use client";

import type { LinkInput } from "@/actions/projects";
import { MoveButtons } from "@/components/admin/FindingsEditor";
import { Button, FieldNote } from "@/components/ui/primitives";
import { LINK_TYPES, LINK_TYPE_LABELS, type LinkType } from "@/lib/types";
import { moveItem, padIndex, uid } from "@/lib/utils";

export function LinksEditor({
  links,
  onChange,
}: {
  links: (LinkInput & { key: string })[];
  onChange: (next: (LinkInput & { key: string })[]) => void;
}) {
  const update = (key: string, patch: Partial<LinkInput>) =>
    onChange(links.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <p className="border border-dashed border-line-strong px-5 py-6 text-sm text-muted">
          No external links yet. Dashboards (Power BI, Looker Studio), GitHub repos and
          dataset sources live here.
        </p>
      ) : null}

      {links.map((link, i) => (
        <div key={link.key} className="grid gap-4 border border-line bg-paper p-5 sm:grid-cols-[170px_1fr_1fr_auto]">
          <div>
            <label className="label-meta block" htmlFor={`l-type-${link.key}`}>
              Type
            </label>
            <select
              id={`l-type-${link.key}`}
              value={link.link_type}
              onChange={(e) => update(link.key, { link_type: e.target.value as LinkType })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            >
              {LINK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {LINK_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-meta block" htmlFor={`l-label-${link.key}`}>
              Label
            </label>
            <input
              id={`l-label-${link.key}`}
              type="text"
              value={link.label}
              onChange={(e) => update(link.key, { label: e.target.value })}
              placeholder="View interactive dashboard"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="label-meta block" htmlFor={`l-url-${link.key}`}>
              URL
            </label>
            <input
              id={`l-url-${link.key}`}
              type="url"
              value={link.url}
              onChange={(e) => update(link.key, { url: e.target.value })}
              placeholder="https://…"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <div className="flex items-end gap-1.5 pb-0.5">
            <MoveButtons index={i} count={links.length} onMove={(a, b) => onChange(moveItem(links, a, b))} />
            <button
              type="button"
              className="px-2 py-1 text-xs text-danger underline underline-offset-4"
              onClick={() => onChange(links.filter((l) => l.key !== link.key))}
            >
              Remove
            </button>
          </div>
          <p className="sr-only">Link {padIndex(i + 1)}</p>
        </div>
      ))}

      <Button
        variant="quiet"
        onClick={() =>
          onChange([
            ...links,
            { key: uid(), link_type: "powerbi", label: "", url: "", sort_order: links.length },
          ])
        }
      >
        + Add link
      </Button>
      <FieldNote>Links with type Power BI / Looker Studio / Live demo appear in the
      “Interactive Dashboard” section; the rest appear under “More Links”.</FieldNote>
    </div>
  );
}
