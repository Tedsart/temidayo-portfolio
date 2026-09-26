"use client";

import { useState } from "react";
import { saveSiteSettings } from "@/actions/site";
import { deleteAsset } from "@/actions/assets";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Button, ErrorMessage } from "@/components/ui/primitives";
import type { ExperienceEntry, ProjectAsset, SiteSettings } from "@/lib/types";

const inputClass =
  "mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-ink";

const emptyEntry: ExperienceEntry = {
  title: "",
  organization: null,
  period: null,
  note: null,
};

export function SiteSettingsForm({
  initial,
  initialCv,
}: {
  initial: SiteSettings | null;
  initialCv: ProjectAsset | null;
}) {
  const [intro, setIntro] = useState(initial?.intro ?? "");
  const [stats, setStats] = useState(initial?.statistics_background ?? "");
  const [interests, setInterests] = useState(initial?.interests ?? "");
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? "");
  const [github, setGithub] = useState(initial?.github_url ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? "");
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    initial?.experience?.length ? initial.experience : [{ ...emptyEntry }],
  );
  const [cv, setCv] = useState<ProjectAsset | null>(initialCv);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function setEntry(index: number, patch: Partial<ExperienceEntry>) {
    setExperience((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    const result = await saveSiteSettings({
      intro,
      statistics_background: stats,
      interests,
      linkedin_url: linkedin,
      github_url: github,
      contact_email: contactEmail,
      experience,
    });
    setBusy(false);
    setStatus(
      result.ok
        ? { ok: true, text: "Saved — the public site updates within a minute." }
        : { ok: false, text: result.error },
    );
  }

  async function removeCv() {
    if (!cv) return;
    setBusy(true);
    const result = await deleteAsset(cv.id);
    setBusy(false);
    if (result.ok) setCv(null);
    else setStatus({ ok: false, text: result.error });
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-10">
      <section className="border border-line bg-paper p-6">
        <h2 className="label-meta">About — introduction</h2>
        <label className="mt-4 block" htmlFor="ss-intro">
          <span className="text-sm text-muted">
            Two or three sentences about how you work and what you care about.
            Shown on the About page; when empty the section is hidden.
          </span>
          <textarea
            id="ss-intro"
            rows={4}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className={inputClass}
            placeholder="I treat every dataset like a source to be interviewed…"
          />
        </label>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-meta">Facts</h2>
        <div className="mt-4 grid gap-6">
          <label className="block" htmlFor="ss-stats">
            <span className="text-sm text-muted">Statistics background</span>
            <textarea
              id="ss-stats"
              rows={3}
              value={stats}
              onChange={(e) => setStats(e.target.value)}
              className={inputClass}
              placeholder="Your statistics education or training."
            />
          </label>
          <label className="block" htmlFor="ss-interests">
            <span className="text-sm text-muted">Interests</span>
            <textarea
              id="ss-interests"
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className={inputClass}
              placeholder="What you read, follow and build outside work."
            />
          </label>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="label-meta">Experience</h2>
          <button
            type="button"
            className="text-xs underline underline-offset-4 hover:text-accent"
            onClick={() =>
              setExperience((rows) => [...rows, { ...emptyEntry }])
            }
          >
            + Add entry
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Real entries only — role, organisation, period and an optional note.
          Empty rows are ignored.
        </p>
        <div className="mt-4 space-y-4">
          {experience.map((entry, i) => (
            <div key={i} className="grid gap-3 border border-line bg-paper-2/50 p-4 sm:grid-cols-2">
              <label className="block text-sm">
                Role / title *
                <input
                  value={entry.title}
                  onChange={(e) => setEntry(i, { title: e.target.value })}
                  className={inputClass}
                  placeholder="Data Analyst"
                />
              </label>
              <label className="block text-sm">
                Organisation
                <input
                  value={entry.organization ?? ""}
                  onChange={(e) => setEntry(i, { organization: e.target.value })}
                  className={inputClass}
                  placeholder="Company or project"
                />
              </label>
              <label className="block text-sm">
                Period
                <input
                  value={entry.period ?? ""}
                  onChange={(e) => setEntry(i, { period: e.target.value })}
                  className={inputClass}
                  placeholder="2024 — present"
                />
              </label>
              <label className="block text-sm">
                Note
                <input
                  value={entry.note ?? ""}
                  onChange={(e) => setEntry(i, { note: e.target.value })}
                  className={inputClass}
                  placeholder="One line about the work"
                />
              </label>
              <button
                type="button"
                className="justify-self-start text-xs text-muted underline underline-offset-4 hover:text-ink"
                onClick={() =>
                  setExperience((rows) => rows.filter((_, x) => x !== i))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-meta">Curriculum vitae</h2>
        {cv ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-line bg-paper-2/50 p-4">
            <div>
              <p className="text-sm font-medium">{cv.file_name}</p>
              <a
                href={cv.public_url ?? undefined}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs underline underline-offset-4 hover:text-accent"
              >
                Open current CV
              </a>
            </div>
            <div className="flex gap-3">
              <MediaUploader
                projectId={null}
                assetType="cv"
                accept="application/pdf"
                label="Replace CV (PDF)"
                onUploaded={(asset) => setCv(asset)}
              />
              <button
                type="button"
                onClick={removeCv}
                className="text-xs text-muted underline underline-offset-4 hover:text-ink"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <MediaUploader
              projectId={null}
              assetType="cv"
              accept="application/pdf"
              label="Upload CV (PDF)"
              onUploaded={(asset) => setCv(asset)}
            />
            <p className="mt-2 text-xs text-muted">
              A single PDF. Once uploaded, a “Download CV” action appears on
              the About page.
            </p>
          </div>
        )}
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="label-meta">Contact &amp; socials</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <label className="block text-sm">
            Contact email
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm">
            LinkedIn URL
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className={inputClass}
              placeholder="https://linkedin.com/in/…"
            />
          </label>
          <label className="block text-sm">
            GitHub URL
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className={inputClass}
              placeholder="https://github.com/…"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted">
          Blank = hidden on the site. Email falls back to the environment
          variable when empty.
        </p>
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </Button>
        {status ? (
          status.ok ? (
            <p className="text-sm text-ink-2" role="status">
              {status.text}
            </p>
          ) : (
            <ErrorMessage>{status.text}</ErrorMessage>
          )
        ) : null}
      </div>
    </form>
  );
}
