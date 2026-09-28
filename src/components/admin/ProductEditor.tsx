"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAsset, updateAssetMeta } from "@/actions/assets";
import { saveProduct, type SaveProductResult } from "@/actions/products";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AssetImage } from "@/components/public/AssetImage";
import { Button, ErrorMessage, FieldNote } from "@/components/ui/primitives";
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from "@/lib/types";
import type { Product, ProductInput, ProductType, ProjectAsset } from "@/lib/types";
import { productPriceLabel, productVisibility } from "@/lib/product";
import { slugify, uid } from "@/lib/utils";

/**
 * The Writing & Products editor.
 *
 * One product at a time, every field optional except the title. Nothing here
 * handles money: Selar owns checkout, payment and delivery, and the site only
 * stores the link it should send readers to.
 */

const inputClass =
  "mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-ink";
const labelClass = "block text-sm font-medium";
const sectionClass = "border-t border-line pt-8 mt-8";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

type OutcomeRow = { key: string; value: string };

function emptyProduct(): ProductInput {
  return {
    type: "ebook",
    title: "",
    slug: "",
    subtitle: "",
    short_description: "",
    long_description: "",
    cover_asset_id: null,
    price_amount: null,
    currency: "NGN",
    price_display: "",
    badge: "",
    product_url: "",
    checkout_url: "",
    button_text: "Get the book",
    secondary_button_text: "",
    secondary_url: "",
    author: "",
    page_count: null,
    format: "PDF",
    audience: "",
    outcomes: [],
    preview_note: "",
    featured: true,
    sort_order: 10,
    enabled: true,
    published: false,
    seo_title: "",
    seo_description: "",
  };
}

function toInput(product: Product): ProductInput {
  return {
    id: product.id,
    type: product.type,
    title: product.title,
    slug: product.slug,
    subtitle: product.subtitle ?? "",
    short_description: product.short_description ?? "",
    long_description: product.long_description ?? "",
    cover_asset_id: product.cover?.id ?? null,
    price_amount: product.price_amount,
    currency: product.currency,
    price_display: product.price_display ?? "",
    badge: product.badge ?? "",
    product_url: product.product_url ?? "",
    checkout_url: product.checkout_url ?? "",
    button_text: product.button_text,
    secondary_button_text: product.secondary_button_text ?? "",
    secondary_url: product.secondary_url ?? "",
    author: product.author ?? "",
    page_count: product.page_count,
    format: product.format ?? "",
    audience: product.audience ?? "",
    outcomes: product.outcomes,
    preview_note: product.preview_note ?? "",
    featured: product.featured,
    sort_order: product.sort_order,
    enabled: product.enabled,
    published: product.published,
    seo_title: product.seo_title ?? "",
    seo_description: product.seo_description ?? "",
  };
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line bg-paper px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span>
      </span>
    </label>
  );
}

export function ProductEditor({ initial }: { initial: Product | null }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(() =>
    initial ? toInput(initial) : emptyProduct(),
  );
  const [cover, setCover] = useState<ProjectAsset | null>(initial?.cover ?? null);
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>(() =>
    (initial?.outcomes ?? []).map((value) => ({ key: uid(), value })),
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const live = productVisibility({
    enabled: form.enabled,
    published: form.published,
    checkout_url: form.checkout_url,
    product_url: form.product_url,
    cover,
  });

  const previewPrice = productPriceLabel({
    price_display: form.price_display,
    price_amount: form.price_amount,
    currency: form.currency,
  });

  function setOutcome(key: string, value: string) {
    setOutcomes((rows) => rows.map((row) => (row.key === key ? { ...row, value } : row)));
  }

  async function save(next?: { publish?: boolean }) {
    setBusy(true);
    setStatus(null);

    const payload: ProductInput = {
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      outcomes: outcomes.map((row) => row.value.trim()).filter(Boolean),
      published: next?.publish ?? form.published,
    };

    const result: SaveProductResult = await saveProduct(payload);
    setBusy(false);

    if (!result.ok) {
      setStatus({ ok: false, text: result.error });
      return;
    }

    setForm((current) => ({ ...current, id: result.id ?? current.id, slug: payload.slug }));
    setStatus({
      ok: true,
      text: payload.published
        ? "Saved — this product is live on the site."
        : "Saved. It stays hidden until you publish it.",
    });
    router.refresh();
  }

  async function removeCover() {
    if (!cover) return;
    setBusy(true);
    await deleteAsset(cover.id);
    setBusy(false);
    setCover(null);
    set("cover_asset_id", null);
    setStatus({ ok: true, text: "Cover removed." });
    router.refresh();
  }

  async function saveCoverAlt(value: string) {
    if (!cover) return;
    setCover({ ...cover, alt_text: value });
    await updateAssetMeta(cover.id, { alt_text: value.trim() || null });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="max-w-3xl"
    >
      {/* ---------------------------------------------------------------- */}
      <fieldset className="grid gap-6">
        <legend className="section-index">BASICS</legend>

        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div>
            <label className={labelClass} htmlFor="product-title">
              Product title
            </label>
            <input
              id="product-title"
              className={inputClass}
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="Before You Believe the Number"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="product-type">
              Product type
            </label>
            <select
              id="product-type"
              className={inputClass}
              value={form.type}
              onChange={(event) => set("type", event.target.value as ProductType)}
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PRODUCT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="product-slug">
            URL slug
          </label>
          <input
            id="product-slug"
            className={inputClass}
            value={form.slug}
            onChange={(event) => set("slug", event.target.value)}
            placeholder="before-you-believe-the-number"
          />
          <FieldNote>
            The page will live at{" "}
            <span className="font-mono">/book/{form.slug || slugify(form.title) || "slug"}</span>
          </FieldNote>
        </div>

        <div>
          <label className={labelClass} htmlFor="product-subtitle">
            Subtitle
          </label>
          <input
            id="product-subtitle"
            className={inputClass}
            value={form.subtitle ?? ""}
            onChange={(event) => set("subtitle", event.target.value)}
            placeholder="A practical guide to thinking clearly…"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="product-short">
            Short description
          </label>
          <textarea
            id="product-short"
            rows={3}
            className={inputClass}
            value={form.short_description ?? ""}
            onChange={(event) => set("short_description", event.target.value)}
            placeholder="One or two sentences shown on the homepage."
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="product-long">
            Long description
          </label>
          <textarea
            id="product-long"
            rows={6}
            className={inputClass}
            value={form.long_description ?? ""}
            onChange={(event) => set("long_description", event.target.value)}
            placeholder="The fuller explanation shown on the product page."
          />
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className={sectionClass}>
        <legend className="section-index">COVER</legend>

        <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
          <div>
            {cover ? (
              <AssetImage
                src={cover.public_url}
                alt={cover.alt_text ?? "Product cover"}
                aspect="2/3"
                sizes="160px"
              />
            ) : (
              <div className="grid-paper flex aspect-[2/3] w-full items-center justify-center border border-dashed border-line-strong bg-paper-2 px-3 text-center">
                <p className="label-meta">No cover yet</p>
              </div>
            )}
          </div>

          <div>
            <MediaUploader
              projectId={null}
              assetType="cover"
              accept="image/png,image/jpeg,image/webp"
              label="Upload cover"
              onUploaded={(asset) => {
                setCover(asset);
                set("cover_asset_id", asset.id);
              }}
            />
            <FieldNote>
              Portrait artwork reads best — around 1000 × 1500 px, under 500 KB.
            </FieldNote>

            {cover ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className={labelClass} htmlFor="cover-alt">
                    Cover alt text
                  </label>
                  <input
                    id="cover-alt"
                    className={inputClass}
                    defaultValue={cover.alt_text ?? ""}
                    onBlur={(event) => void saveCoverAlt(event.target.value)}
                    placeholder="Cover of Before You Believe the Number by Temidayo Kukoyi"
                  />
                  <FieldNote>Describes the cover for screen readers.</FieldNote>
                </div>
                <Button variant="danger" onClick={removeCover} disabled={busy}>
                  Remove cover
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className={sectionClass}>
        <legend className="section-index">PRICE</legend>

        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div>
            <label className={labelClass} htmlFor="product-price">
              Price
            </label>
            <input
              id="product-price"
              type="number"
              min={0}
              step="1"
              className={inputClass}
              value={form.price_amount ?? ""}
              onChange={(event) =>
                set(
                  "price_amount",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              placeholder="2500"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="product-currency">
              Currency
            </label>
            <select
              id="product-currency"
              className={inputClass}
              value={form.currency}
              onChange={(event) => set("currency", event.target.value)}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="product-price-display">
            Price display override (optional)
          </label>
          <input
            id="product-price-display"
            className={inputClass}
            value={form.price_display ?? ""}
            onChange={(event) => set("price_display", event.target.value)}
            placeholder="Leave blank to format the price automatically"
          />
          <FieldNote>
            {previewPrice ? `Shows as ${previewPrice}` : "No price will be shown."}
          </FieldNote>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="product-badge">
            Badge (optional)
          </label>
          <input
            id="product-badge"
            className={inputClass}
            value={form.badge ?? ""}
            onChange={(event) => set("badge", event.target.value)}
            placeholder="New"
          />
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className={sectionClass}>
        <legend className="section-index">SELAR LINK</legend>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Selar handles checkout, payment and delivery. Your site never touches
          payment details — it only sends readers to the link you paste here.
        </p>

        <div className="mt-4">
          <label className={labelClass} htmlFor="product-url">
            Selar product URL
          </label>
          <input
            id="product-url"
            type="url"
            className={inputClass}
            value={form.product_url ?? ""}
            onChange={(event) => set("product_url", event.target.value)}
            placeholder="https://selar.co/…"
          />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="checkout-url">
            Selar direct checkout URL (optional)
          </label>
          <input
            id="checkout-url"
            type="url"
            className={inputClass}
            value={form.checkout_url ?? ""}
            onChange={(event) => set("checkout_url", event.target.value)}
            placeholder="https://selar.co/checkout/…"
          />
          <FieldNote>
            If a checkout URL is supplied, the main button uses it. Otherwise the
            product URL is used.
          </FieldNote>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="button-text">
              Button text
            </label>
            <input
              id="button-text"
              className={inputClass}
              value={form.button_text}
              onChange={(event) => set("button_text", event.target.value)}
              placeholder="Get the book"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="secondary-button-text">
              Secondary button text (optional)
            </label>
            <input
              id="secondary-button-text"
              className={inputClass}
              value={form.secondary_button_text ?? ""}
              onChange={(event) => set("secondary_button_text", event.target.value)}
              placeholder="Read more about the book"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="secondary-url">
            Secondary URL (optional)
          </label>
          <input
            id="secondary-url"
            type="url"
            className={inputClass}
            value={form.secondary_url ?? ""}
            onChange={(event) => set("secondary_url", event.target.value)}
            placeholder="/book/before-you-believe-the-number"
          />
          <FieldNote>
            Usually the book page on your own site, e.g.{" "}
            <span className="font-mono">/book/{form.slug || "slug"}</span>
          </FieldNote>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className={sectionClass}>
        <legend className="section-index">DETAILS</legend>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="product-author">
              Author
            </label>
            <input
              id="product-author"
              className={inputClass}
              value={form.author ?? ""}
              onChange={(event) => set("author", event.target.value)}
              placeholder="Temidayo Kukoyi"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="product-pages">
              Page count (optional)
            </label>
            <input
              id="product-pages"
              type="number"
              min={1}
              className={inputClass}
              value={form.page_count ?? ""}
              onChange={(event) =>
                set("page_count", event.target.value === "" ? null : Number(event.target.value))
              }
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="product-format">
              Format (optional)
            </label>
            <input
              id="product-format"
              className={inputClass}
              value={form.format ?? ""}
              onChange={(event) => set("format", event.target.value)}
              placeholder="PDF"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="product-audience">
            Who it is for
          </label>
          <textarea
            id="product-audience"
            rows={3}
            className={inputClass}
            value={form.audience ?? ""}
            onChange={(event) => set("audience", event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="product-preview">
            Preview / sample note (optional)
          </label>
          <textarea
            id="product-preview"
            rows={3}
            className={inputClass}
            value={form.preview_note ?? ""}
            onChange={(event) => set("preview_note", event.target.value)}
          />
        </div>

        <div className="mt-6">
          <span className={labelClass}>Key outcomes</span>
          <div className="mt-3 space-y-3">
            {outcomes.map((row, index) => (
              <div key={row.key} className="flex items-start gap-3">
                <span className="mt-4 font-mono text-xs text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <input
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-base outline-none focus:border-ink"
                  value={row.value}
                  onChange={(event) => setOutcome(row.key, event.target.value)}
                  placeholder="Spot missing context behind percentages"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOutcomes((rows) => rows.filter((item) => item.key !== row.key))
                  }
                  className="mt-3 shrink-0 text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="quiet"
            className="mt-3"
            onClick={() => setOutcomes((rows) => [...rows, { key: uid(), value: "" }])}
          >
            Add outcome
          </Button>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className={sectionClass}>
        <legend className="section-index">PLACEMENT &amp; VISIBILITY</legend>

        <div className="grid gap-4">
          <Toggle
            label="Product enabled"
            hint="Master switch for the whole Writing & Products feature."
            checked={form.enabled}
            onChange={(value) => set("enabled", value)}
          />
          <Toggle
            label="Published"
            hint="Unpublish to hide it everywhere without deleting it."
            checked={form.published}
            onChange={(value) => set("published", value)}
          />
          <Toggle
            label="Featured on homepage"
            hint="Shows this product in the homepage section."
            checked={form.featured}
            onChange={(value) => set("featured", value)}
          />
        </div>

        <div className="mt-4 max-w-xs">
          <label className={labelClass} htmlFor="product-order">
            Display order
          </label>
          <input
            id="product-order"
            type="number"
            className={inputClass}
            value={form.sort_order}
            onChange={(event) => set("sort_order", Number(event.target.value) || 0)}
          />
          <FieldNote>Lower numbers come first.</FieldNote>
        </div>

        <div className="mt-6 border border-line bg-paper-2 p-5">
          <p className="label-meta">VISIBLE ON THE SITE WHEN</p>
          <ul className="mt-3 space-y-2">
            {live.map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
                    item.ok ? "bg-accent" : "bg-line-strong"
                  }`}
                />
                <span>
                  <span className={item.ok ? "text-ink" : "text-muted"}>{item.label}</span>
                  <span className="ml-2 text-xs text-faint">
                    {item.ok ? "done" : item.hint}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <fieldset className={sectionClass}>
        <legend className="section-index">SEO</legend>

        <div>
          <label className={labelClass} htmlFor="product-seo-title">
            SEO title (optional)
          </label>
          <input
            id="product-seo-title"
            className={inputClass}
            value={form.seo_title ?? ""}
            onChange={(event) => set("seo_title", event.target.value)}
            placeholder="Defaults to the product title"
          />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="product-seo-description">
            SEO description (optional)
          </label>
          <textarea
            id="product-seo-description"
            rows={3}
            className={inputClass}
            value={form.seo_description ?? ""}
            onChange={(event) => set("seo_description", event.target.value)}
            placeholder="Defaults to the short description"
          />
        </div>
      </fieldset>

      {/* ---------------------------------------------------------------- */}
      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </Button>
        {!form.published ? (
          <Button variant="accent" disabled={busy} onClick={() => void save({ publish: true })}>
            Save &amp; publish
          </Button>
        ) : null}
        {initial?.id ? (
          <Link
            href={`/book/${initial.slug}`}
            className="text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
          >
            View product page →
          </Link>
        ) : null}
      </div>

      {status ? (
        <div className="mt-4">
          {status.ok ? (
            <p className="text-sm text-accent">{status.text}</p>
          ) : (
            <ErrorMessage>{status.text}</ErrorMessage>
          )}
        </div>
      ) : null}
    </form>
  );
}
