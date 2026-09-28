import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { AssetImage } from "@/components/public/AssetImage";
import {
  ButtonLink,
  Container,
  MetaLabel,
} from "@/components/ui/primitives";
import { getLiveProductBySlug } from "@/lib/data/products";
import { siteConfig } from "@/lib/config";
import {
  productCoverAlt,
  productPriceLabel,
  productPurchaseUrl,
} from "@/lib/product";
import { PRODUCT_TYPE_LABELS } from "@/lib/types";

/**
 * A book page, not a sales page: what it is, who it is for, what you will take
 * away, and one quiet way to buy it. Payment happens on Selar.
 */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getLiveProductBySlug(slug);
  const product = result.data;

  if (!product) return { title: "Product not found" };

  const title = product.seo_title ?? `${product.title} — ${siteConfig.name}`;
  const description =
    product.seo_description ??
    product.short_description ??
    product.subtitle ??
    siteConfig.tagline;

  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/book/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/book/${product.slug}`,
      type: "website",
      images: product.cover?.public_url
        ? [{ url: product.cover.public_url, alt: productCoverAlt(product) }]
        : undefined,
    },
  };
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getLiveProductBySlug(slug);
  const product = result.data;

  // Unpublished, disabled or link-less products simply do not exist publicly.
  if (!product) notFound();

  const purchaseUrl = productPurchaseUrl(product);
  if (!purchaseUrl) notFound();

  const price = productPriceLabel(product);
  const alt = productCoverAlt(product);
  const typeLabel = PRODUCT_TYPE_LABELS[product.type];

  const facts = [
    product.author ? { label: "Author", value: product.author } : null,
    product.format ? { label: "Format", value: product.format } : null,
    product.page_count
      ? { label: "Length", value: `${product.page_count} pages` }
      : null,
    price ? { label: "Price", value: price } : null,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  return (
    <Container as="article" className="py-16 md:py-24">
      <Link
        href="/"
        className="text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
      >
        ← Back to portfolio
      </Link>

      <div className="mt-10 grid items-start gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        {/* Cover */}
        <Reveal className="mx-auto w-full max-w-[19rem] lg:mx-0 lg:max-w-none">
          <AssetImage
            src={product.cover?.public_url ?? null}
            alt={alt}
            aspect="2/3"
            sizes="(max-width: 1024px) 70vw, 22rem"
            className="border border-line bg-paper-2 shadow-editorial"
            fallbackLabel="Cover not uploaded yet"
          />

          {facts.length ? (
            <dl className="mt-8 border-t border-line">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-3"
                >
                  <dt className="label-meta text-faint">{fact.label}</dt>
                  <dd className="text-sm text-ink-2">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Reveal>

        {/* The book */}
        <div className="max-w-2xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <MetaLabel as="span" className="text-faint">
                {typeLabel.toUpperCase()}
              </MetaLabel>
              {product.badge ? (
                <span className="border border-accent/30 bg-accent-soft px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  {product.badge}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.02em]">
              {product.title}
            </h1>

            {product.subtitle ? (
              <p className="mt-5 font-display text-xl leading-snug text-ink-2 md:text-2xl">
                {product.subtitle}
              </p>
            ) : null}

            {price ? (
              <p className="mt-8 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold tracking-tight">
                  {price}
                </span>
                <span className="label-meta text-faint">via Selar</span>
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href={purchaseUrl} external variant="primary" className="group">
                {product.button_text}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
                <span className="sr-only"> (opens Selar in a new tab)</span>
              </ButtonLink>

              {product.secondary_button_text && product.secondary_url ? (
                <ButtonLink
                  href={product.secondary_url}
                  external={product.secondary_url.startsWith("http")}
                  variant="outline"
                >
                  {product.secondary_button_text}
                </ButtonLink>
              ) : null}
            </div>
          </Reveal>

          {product.long_description ? (
            <Reveal index={1} className="mt-12 border-t border-line pt-8">
              <MetaLabel className="text-faint">THE IDEA</MetaLabel>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">
                {product.long_description}
              </p>
            </Reveal>
          ) : null}

          {product.audience ? (
            <Reveal index={2} className="mt-10 border-t border-line pt-8">
              <MetaLabel className="text-faint">WHO IT IS FOR</MetaLabel>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {product.audience}
              </p>
            </Reveal>
          ) : null}

          {product.outcomes.length ? (
            <Reveal index={3} className="mt-10 border-t border-line pt-8">
              <MetaLabel className="text-faint">WHAT YOU WILL TAKE AWAY</MetaLabel>
              <ul className="mt-5 space-y-3">
                {product.outcomes.map((outcome, index) => (
                  <li key={outcome} className="flex items-start gap-4">
                    <span className="mt-1 font-mono text-[11px] text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base leading-relaxed text-ink-2">
                      {outcome}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {product.preview_note ? (
            <Reveal index={4} className="mt-10 border-t border-line pt-8">
              <MetaLabel className="text-faint">INSIDE</MetaLabel>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {product.preview_note}
              </p>
            </Reveal>
          ) : null}

          <Reveal index={5} className="mt-12 border-t border-line pt-8">
            <MetaLabel className="text-faint">ABOUT THE AUTHOR</MetaLabel>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {product.author ?? siteConfig.name} is a data analyst working on
              analysis, visualization and data storytelling — turning numbers into
              things people can actually understand.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
            >
              More about the work →
            </Link>
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
