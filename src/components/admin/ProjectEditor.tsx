"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  saveFindings,
  saveLinks,
  saveProject,
  setProjectStatus,
  type FindingInput,
  type LinkInput,
  type ProjectFormPayload,
} from "@/actions/projects";
import { FindingsEditor } from "@/components/admin/FindingsEditor";
import { LinksEditor } from "@/components/admin/LinksEditor";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { SortableMediaList } from "@/components/admin/SortableMediaList";
import {
  Button,
  ErrorMessage,
  FieldNote,
  StatusBadge,
} from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/config";
import type { ProjectAsset, ProjectWithRelations } from "@/lib/types";
import { joinList, slugify, splitList, uid } from "@/lib/utils";

type EditorFindings = FindingInput & { key: string };
type EditorLinks = LinkInput & { key: string };

const SECTIONS = [
  { id: "basic", label: "Basic Info" },
  { id: "story", label: "Story" },
  { id: "findings", label: "Findings" },
  { id: "visuals", label: "Visuals" },
  { id: "reports", label: "Reports" },
  { id: "documents", label: "Documents" },
  { id: "links", label: "Links" },
  { id: "seo", label: "SEO" },
] as const;

export function ProjectEditor({ initial }: { initial: ProjectWithRelations | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [projectId, setProjectId] = useState<string | null>(initial?.id ?? null);
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  const [form, setForm] = useState(() => ({
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    short_description: initial?.short_description ?? "",
    category: initial?.category ?? "",
    project_date: initial?.project_date ?? "",
    featured: initial?.featured ?? false,
    tools: joinList(initial?.tools),
    skills: joinList(initial?.skills),
    question: initial?.question ?? "",
    objective: initial?.objective ?? "",
    context: initial?.context ?? "",
    dataset: initial?.dataset ?? "",
    data_sources: initial?.data_sources ?? "",
    methodology: initial?.methodology ?? "",
    analysis_process: initial?.analysis_process ?? "",
    challenges: initial?.challenges ?? "",
    recommendations: initial?.recommendations ?? "",
    conclusion: initial?.conclusion ?? "",
    seo_title: initial?.seo_title ?? "",
    seo_description: initial?.seo_description ?? "",
    social_image: initial?.social_image ?? "",
  }));

  const [findings, setFindings] = useState<EditorFindings[]>(
    (initial?.findings ?? []).map((f) => ({
      key: uid(),
      headline: f.headline,
      title: f.title,
      explanation: f.explanation,
      supporting_text: f.supporting_text,
      sort_order: f.sort_order,
    })),
  );

  const [links, setLinks] = useState<EditorLinks[]>(
    (initial?.links ?? []).map((l) => ({
      key: uid(),
      link_type: l.link_type,
      label: l.label,
      url: l.url,
      sort_order: l.sort_order,
    })),
  );

  const [assets, setAssets] = useState<ProjectAsset[]>(initial?.assets ?? []);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState<null | "save" | "publish">(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setAssetGroup = (next: ProjectAsset[]) => setAssets(next);

  const byType = (type: ProjectAsset["asset_type"]) =>
    assets
      .filter((a) => a.asset_type === type)
      .sort((a, b) => a.sort_order - b.sort_order);

  function buildPayload(): ProjectFormPayload {
    return {
      id: projectId,
      title: form.title,
      slug: slug || slugify(form.title),
      subtitle: form.subtitle || null,
      short_description: form.short_description || null,
      category: form.category || null,
      project_date: form.project_date || null,
      featured: form.featured,
      tools: splitList(form.tools),
      skills: splitList(form.skills),
      question: form.question || null,
      objective: form.objective || null,
      context: form.context || null,
      dataset: form.dataset || null,
      data_sources: form.data_sources || null,
      methodology: form.methodology || null,
      analysis_process: form.analysis_process || null,
      challenges: form.challenges || null,
      recommendations: form.recommendations || null,
      conclusion: form.conclusion || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      social_image: form.social_image || null,
    };
  }

  async function persist(publishAfter = false) {
    setBusy(publishAfter ? "publish" : "save");
    setMessage(null);

    const payload = buildPayload();
    const saved = await saveProject(payload);
    if (!saved.ok || !saved.data) {
      setMessage({ tone: "error", text: saved.error ?? "The project could not be saved." });
      setBusy(null);
      return false;
    }

    const id = saved.data.id;
    setProjectId(id);
    setSlug(saved.data.slug);

    const findingRows = findings
      .filter((f) => f.headline.trim() || f.title.trim())
      .map((f) => ({
        headline: f.headline.trim(),
        title: f.title.trim(),
        explanation: f.explanation,
        supporting_text: f.supporting_text,
        sort_order: f.sort_order,
      }));
    const linkRows = links
      .filter((l) => l.label.trim() && l.url.trim())
      .map((l) => ({
        link_type: l.link_type,
        label: l.label.trim(),
        url: l.url.trim(),
        sort_order: l.sort_order,
      }));

    const [fResult, lResult] = await Promise.all([
      saveFindings(id, findingRows),
      saveLinks(id, linkRows),
    ]);

    if (!fResult.ok) {
      setMessage({ tone: "error", text: fResult.error });
      setBusy(null);
      return false;
    }
    if (!lResult.ok) {
      setMessage({ tone: "error", text: lResult.error });
      setBusy(null);
      return false;
    }

    if (publishAfter) {
      const published = await setProjectStatus(id, "published");
      if (!published.ok) {
        setMessage({ tone: "error", text: published.error });
        setBusy(null);
        return false;
      }
      setStatus("published");
    }

    if (!projectId) {
      router.replace(`/admin/projects/${id}/edit`);
    }

    setMessage({
      tone: "ok",
      text: publishAfter
        ? "Saved and published — the project is live on the public site."
        : "Draft saved.",
    });
    setBusy(null);
    router.refresh();
    return true;
  }

  const inputClass =
    "mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-ink";

  return (
    <div className="grid gap-8 xl:grid-cols-[200px_1fr]">
      {/* Section nav */}
      <nav aria-label="Editor sections" className="flex gap-2 overflow-x-auto xl:sticky xl:top-20 xl:flex-col xl:self-start">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#section-${section.id}`}
            className="shrink-0 border border-line bg-paper px-3.5 py-2 text-xs text-ink-2 transition-colors hover:border-ink/40"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="min-w-0">
        {/* Action bar */}
        <div className="sticky top-14 z-30 -mx-1 border-b border-line bg-paper/95 px-1 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            {projectId ? (
              <span className="font-mono text-[11px] text-faint">/work/{slug || "…"}</span>
            ) : null}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {projectId ? (
                <Link
                  href={`/admin/projects/${projectId}/preview`}
                  className="border border-line bg-paper px-4 py-2 text-sm hover:border-ink/40"
                >
                  Preview
                </Link>
              ) : null}
              <Button
                variant="quiet"
                disabled={busy !== null}
                onClick={() => void persist(false)}
              >
                {busy === "save" ? "Saving…" : "Save draft"}
              </Button>
              {status === "published" ? (
                <Button
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() =>
                    startTransition(async () => {
                      if (!projectId) return;
                      await setProjectStatus(projectId, "draft");
                      setStatus("draft");
                      router.refresh();
                    })
                  }
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="accent"
                  disabled={busy !== null}
                  onClick={() => void persist(true)}
                >
                  {busy === "publish" ? "Publishing…" : "Publish"}
                </Button>
              )}
            </div>
          </div>
          {message ? (
            <p
              role="status"
              className={`mt-2 text-sm ${message.tone === "ok" ? "text-positive" : "text-danger"}`}
            >
              {message.text}
            </p>
          ) : null}
        </div>

        {!isSupabaseConfigured ? (
          <ErrorMessage>
            Supabase is not configured — saving is disabled until .env.local has credentials.
          </ErrorMessage>
        ) : null}

        {/* ── Basic info ─────────────────────────────────────────────── */}
        <Section id="basic" title="Basic Info">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Title *" hint="The public headline.">
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputClass}
                placeholder="Nigeria Inflation Dashboard"
              />
            </Field>
            <Field label="Slug" hint="URL path under /work/. Blank = generated from title.">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value) || e.target.value)}
                className={inputClass}
                placeholder="nigeria-inflation-dashboard"
              />
            </Field>
            <Field label="Subtitle">
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <input
                type="text"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
                placeholder="Economic analysis"
              />
            </Field>
            <Field label="Date" hint="Free text: 2025, Q2 2025, Jan 2025…">
              <input
                type="text"
                value={form.project_date}
                onChange={(e) => set("project_date", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Tools" hint="Comma separated.">
              <input
                type="text"
                value={form.tools}
                onChange={(e) => set("tools", e.target.value)}
                className={inputClass}
                placeholder="Power BI, SQL, Excel"
              />
            </Field>
            <Field label="Skills" hint="Comma separated.">
              <input
                type="text"
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-3 self-end pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Featured on the homepage
            </label>
          </div>
          <div className="mt-5">
            <Field label="Short description" hint="Shown on the work index and in search results.">
              <textarea
                rows={3}
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* ── Story ──────────────────────────────────────────────────── */}
        <Section id="story" title="Story" note="Every field is optional — empty sections are hidden on the public page.">
          <div className="grid gap-5">
            <Field label="Question / problem" hint="Rendered large, as the story's opening.">
              <textarea rows={3} value={form.question} onChange={(e) => set("question", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Context">
              <textarea rows={4} value={form.context} onChange={(e) => set("context", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Objective">
              <textarea rows={3} value={form.objective} onChange={(e) => set("objective", e.target.value)} className={inputClass} />
            </Field>
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Dataset" hint="Grain, coverage, size.">
                <textarea rows={4} value={form.dataset} onChange={(e) => set("dataset", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Data sources">
                <textarea rows={4} value={form.data_sources} onChange={(e) => set("data_sources", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Methodology">
                <textarea rows={4} value={form.methodology} onChange={(e) => set("methodology", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Analysis process">
                <textarea rows={4} value={form.analysis_process} onChange={(e) => set("analysis_process", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Challenges">
              <textarea rows={3} value={form.challenges} onChange={(e) => set("challenges", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Recommendations">
              <textarea rows={3} value={form.recommendations} onChange={(e) => set("recommendations", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Conclusion / outcome">
              <textarea rows={3} value={form.conclusion} onChange={(e) => set("conclusion", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </Section>

        {/* ── Findings ───────────────────────────────────────────────── */}
        <Section id="findings" title="Findings">
          <FindingsEditor findings={findings} onChange={setFindings} />
        </Section>

        {/* ── Visuals ────────────────────────────────────────────────── */}
        <Section id="visuals" title="Visuals">
          <div className="grid gap-8">
            <div>
              <p className="label-meta mb-3">Thumbnail — work index &amp; cards</p>
              <SortableMediaList assets={byType("thumbnail")} onChange={setAssetGroup} showMeta={false} />
              <div className="mt-3">
                <MediaUploader
                  projectId={projectId}
                  assetType="thumbnail"
                  accept="image/*"
                  label="Upload thumbnail"
                  onUploaded={(asset) => setAssets((current) => [...current, asset])}
                />
              </div>
            </div>

            <div>
              <p className="label-meta mb-3">Hero image — case study header</p>
              <SortableMediaList assets={byType("hero")} onChange={setAssetGroup} showMeta={false} />
              <div className="mt-3">
                <MediaUploader
                  projectId={projectId}
                  assetType="hero"
                  accept="image/*"
                  label="Upload hero image"
                  onUploaded={(asset) => setAssets((current) => [...current, asset])}
                />
              </div>
            </div>

            <div>
              <p className="label-meta mb-3">Dashboard screenshots — gallery, in reading order</p>
              <SortableMediaList assets={byType("dashboard")} onChange={setAssetGroup} />
              <div className="mt-3">
                <MediaUploader
                  projectId={projectId}
                  assetType="dashboard"
                  accept="image/*"
                  multiple
                  label="Upload dashboard screenshots"
                  onUploaded={(asset) => setAssets((current) => [...current, asset])}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Reports ────────────────────────────────────────────────── */}
        <Section id="reports" title="Reports" note="Upload report pages, arrange them, publish. The public carousel follows this order exactly.">
          <SortableMediaList assets={byType("report_page")} onChange={setAssetGroup} />
          <div className="mt-3">
            <MediaUploader
              projectId={projectId}
              assetType="report_page"
              accept="image/*,.pdf"
              multiple
              label="Upload report pages"
              onUploaded={(asset) => setAssets((current) => [...current, asset])}
            />
          </div>
        </Section>

        {/* ── Documents ──────────────────────────────────────────────── */}
        <Section id="documents" title="Documents & datasets" note="PDFs, PPTX, CSV, XLSX or anything else readers should be able to view or download.">
          <SortableMediaList assets={byType("document").concat(byType("dataset"), byType("other"))} onChange={setAssetGroup} showMeta={false} />
          <div className="mt-3">
            <MediaUploader
              projectId={projectId}
              assetType="document"
              accept=".pdf,.pptx,.ppt,.csv,.xlsx,.xls,.zip,.json,application/*,text/*"
              multiple
              label="Upload documents / datasets"
              onUploaded={(asset) => setAssets((current) => [...current, asset])}
            />
          </div>
        </Section>

        {/* ── Links ──────────────────────────────────────────────────── */}
        <Section id="links" title="Links">
          <LinksEditor links={links} onChange={setLinks} />
        </Section>

        {/* ── SEO ────────────────────────────────────────────────────── */}
        <Section id="seo" title="SEO" note="Blank fields fall back to sensible defaults built from the title and short description.">
          <div className="grid gap-5">
            <Field label="SEO title" hint={`Default: “${form.title || "Project title"} · Case Study”`}>
              <input type="text" value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Meta description" hint="Aim for ~150 characters.">
              <textarea rows={3} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} className={inputClass} />
              <p className="mt-1 text-right font-mono text-[10px] text-faint">
                {form.seo_description.length}/160
              </p>
            </Field>
            <Field label="Social sharing image URL" hint="Leave blank to use the site default card.">
              <input type="url" value={form.social_image} onChange={(e) => set("social_image", e.target.value)} className={inputClass} placeholder="https://…" />
            </Field>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`section-${id}`} className="scroll-mt-32 border-t border-line py-8 first:border-t-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {note ? <FieldNote>{note}</FieldNote> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-meta">{label}</span>
      {children}
      {hint ? <FieldNote>{hint}</FieldNote> : null}
    </label>
  );
}
