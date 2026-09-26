"use client";

import { useState } from "react";
import { Button, ErrorMessage } from "@/components/ui/primitives";
import {
  validateContactMessage,
  validateEmail,
  type FieldErrors,
} from "@/lib/validation";

/**
 * Zero-infrastructure contact form: the message opens in the visitor's own
 * mail client, pre-addressed to Temidayo. Nothing is stored, tracked or sent
 * to a third party. If no contact email is configured, the direct channels
 * below remain available.
 */
export function ContactPageBody({
  email,
  linkedin,
  github,
}: {
  email: string | null;
  linkedin: string | null;
  github: string | null;
}) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — humans never see it
  const [errors, setErrors] = useState<FieldErrors>({});

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (company) return; // bot tripped the honeypot

    const next: FieldErrors = {};
    const emailResult = validateEmail(from);
    if (emailResult.error) next.from = emailResult.error;
    const messageResult = validateContactMessage(message);
    if (messageResult.error) next.message = messageResult.error;
    if (!name.trim()) next.name = "Add your name so I know who is writing.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const subject = encodeURIComponent(`Portfolio inquiry from ${name.trim()}`);
    const body = encodeURIComponent(
      `${message.trim()}\n\n—\n${name.trim()}\n${from.trim()}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  // Channels without a configured value are hidden, never "Not configured".
  const channels = [
    { label: "Email", value: email, href: email ? `mailto:${email}` : null },
    { label: "LinkedIn", value: linkedin, href: linkedin },
    { label: "GitHub", value: github, href: github },
  ].filter((channel): channel is { label: string; value: string; href: string } =>
    Boolean(channel.href),
  );

  return (
    <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      {email ? (
        <form onSubmit={submit} noValidate className="max-w-xl">
          <div className="grid gap-6">
            <div>
              <label htmlFor="contact-name" className="label-meta block">
                Your name
              </label>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-ink"
                placeholder="Adaeze Okafor"
              />
              {errors.name ? <ErrorMessage>{errors.name}</ErrorMessage> : null}
            </div>

            <div>
              <label htmlFor="contact-email" className="label-meta block">
                Your email
              </label>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-ink"
                placeholder="you@example.com"
              />
              {errors.from ? <ErrorMessage>{errors.from}</ErrorMessage> : null}
            </div>

            <div>
              <label htmlFor="contact-message" className="label-meta block">
                Your question
              </label>
              <textarea
                id="contact-message"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full resize-y border border-line bg-paper px-4 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-ink"
                placeholder="We have 18 months of sales data and no idea what is actually driving the dip in Q3…"
              />
              {errors.message ? <ErrorMessage>{errors.message}</ErrorMessage> : null}
            </div>

            {/* honeypot */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input
                id="contact-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>

            <div>
              <Button type="submit" variant="primary">
                Let&apos;s talk
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                This opens a pre-filled email in your own mail app — nothing is
                stored on this site.
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="max-w-xl border border-line bg-paper-2/60 px-6 py-5">
          <p className="text-sm leading-relaxed text-muted">
            The contact form is not configured yet. Add{" "}
            <code className="font-mono text-xs">CONTACT_EMAIL</code> to the
            environment to enable it — or use the direct channels on the right.
          </p>
        </div>
      )}

      <aside>
        {channels.length ? (
          <>
            <p className="section-index mb-5">DIRECT</p>
            <ul className="divide-y divide-line border-y border-line">
              {channels.map((channel) => (
                <li key={channel.label} className="py-5">
                  <p className="label-meta">{channel.label}</p>
                  <a
                    href={channel.href}
                    {...(channel.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="mt-1.5 inline-block break-all text-base text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                  >
                    {channel.href.startsWith("http")
                      ? channel.href.replace(/^https?:\/\/(www\.)?/, "")
                      : channel.href.replace(/^mailto:/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="mt-5 text-xs leading-relaxed text-muted">
          Typical projects: inflation &amp; economic dashboards, business
          performance reporting, data cleaning and analysis, visual reports.
        </p>
      </aside>
    </div>
  );
}
