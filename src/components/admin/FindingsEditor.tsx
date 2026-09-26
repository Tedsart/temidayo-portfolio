"use client";

import type { FindingInput } from "@/actions/projects";
import { Button, FieldNote } from "@/components/ui/primitives";
import { moveItem, padIndex, uid } from "@/lib/utils";

/**
 * Repeatable key findings. Order is explicit: the list order is the order the
 * public page renders, and it is stored as sort_order on save.
 */
export function FindingsEditor({
  findings,
  onChange,
}: {
  findings: (FindingInput & { key: string })[];
  onChange: (next: (FindingInput & { key: string })[]) => void;
}) {
  const update = (key: string, patch: Partial<FindingInput>) =>
    onChange(findings.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const remove = (key: string) => onChange(findings.filter((f) => f.key !== key));

  const move = (index: number, to: number) => onChange(moveItem(findings, index, to));

  return (
    <div className="space-y-4">
      {findings.length === 0 ? (
        <p className="border border-dashed border-line-strong px-5 py-6 text-sm text-muted">
          No findings yet. A case study reads best with two to four headline numbers.
        </p>
      ) : null}

      {findings.map((finding, i) => (
        <fieldset key={finding.key} className="border border-line bg-paper p-5">
          <legend className="sr-only">Finding {i + 1}</legend>
          <div className="flex items-center justify-between gap-4">
            <p className="label-meta">Finding {padIndex(i + 1)}</p>
            <div className="flex items-center gap-1.5">
              <MoveButtons index={i} count={findings.length} onMove={move} />
              <button
                type="button"
                className="px-2 py-1 text-xs text-danger underline underline-offset-4"
                onClick={() => remove(finding.key)}
              >
                Remove
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
            <div>
              <label className="label-meta block" htmlFor={`f-headline-${finding.key}`}>
                Headline number
              </label>
              <input
                id={`f-headline-${finding.key}`}
                type="text"
                value={finding.headline}
                onChange={(e) => update(finding.key, { headline: e.target.value })}
                placeholder="32.2%"
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-lg font-semibold outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="label-meta block" htmlFor={`f-title-${finding.key}`}>
                Title
              </label>
              <input
                id={`f-title-${finding.key}`}
                type="text"
                value={finding.title}
                onChange={(e) => update(finding.key, { title: e.target.value })}
                placeholder="Food inflation ran ahead of headline"
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label-meta block" htmlFor={`f-expl-${finding.key}`}>
              Explanation
            </label>
            <textarea
              id={`f-expl-${finding.key}`}
              rows={2}
              value={finding.explanation ?? ""}
              onChange={(e) => update(finding.key, { explanation: e.target.value || null })}
              className="mt-1.5 w-full resize-y border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>

          <div className="mt-3">
            <label className="label-meta block" htmlFor={`f-supp-${finding.key}`}>
              Supporting text (optional)
            </label>
            <textarea
              id={`f-supp-${finding.key}`}
              rows={2}
              value={finding.supporting_text ?? ""}
              onChange={(e) => update(finding.key, { supporting_text: e.target.value || null })}
              className="mt-1.5 w-full resize-y border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
        </fieldset>
      ))}

      <Button
        variant="quiet"
        onClick={() =>
          onChange([
            ...findings,
            {
              key: uid(),
              headline: "",
              title: "",
              explanation: null,
              supporting_text: null,
              sort_order: findings.length,
            },
          ])
        }
      >
        + Add finding
      </Button>
      <FieldNote>
        Findings are saved when you press “Save draft”. The order above is the order
        readers see.
      </FieldNote>
    </div>
  );
}

export function MoveButtons({
  index,
  count,
  onMove,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="inline-flex h-7 w-7 items-center justify-center border border-line text-xs hover:border-ink/40 disabled:opacity-35"
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        className="inline-flex h-7 w-7 items-center justify-center border border-line text-xs hover:border-ink/40 disabled:opacity-35"
      >
        ↓
      </button>
    </span>
  );
}
