import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { AssetImage } from "@/components/public/AssetImage";
import {
  ButtonLink,
  Container,
  MetaLabel,
  SectionHeading,
} from "@/components/ui/primitives";
import { getFeaturedProduct } from "@/lib/data/products";
import {
  productCoverAlt,
  productPriceLabel,
  productPurchaseUrl,
} from "@/lib/product";
import { PRODUCT_TYPE_LABELS } from "@/lib/types";

/**
 * Writing & Products — the homepage section.
 *
 * Editorial, not commercial: one object, its cover, what it is and what it
 * costs. Selar handles checkout; this only links out. When there is no live
 * product the component renders nothing at all — no placeholder, no gap.
 */
export async function ProductFeature() {
  const result = await getFeaturedProduct();
  const product = result.data;

  // Disabled, unpublished or link-less products never reach the page.
  if (!product) return null;

  const purchaseUrl = productPurchaseUrl(product);
  if (!purchaseUrl) return null;

  const price = productPriceLabel(product);
  const alt = productCoverAlt(product);

  const details = [
    product.author ? `By ${product.author}` : null,
    product.format || null,
    product.page_count ? `${product.page_count} pages` : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <Container as="section" className="py-20 md:py-28">
      <SectionHeading
        index="WRITING & PRODUCTS"
        title={product.title}
        description={product.short_description ?? product.subtitle ?? undefined}
      />

      <Reveal className="mt-12">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          {/* Cover — contained, never cropped, on the paper frame. */}
          <div className="mx-auto w-full max-w-[17rem] lg:mx-0 lg:max-w-none">
            <Link
              href={`/book/${product.slug}`}
              aria-label={`More about ${product.title}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <AssetImage
                  src={product.cover?.public_url ?? null}
                  alt={alt}
                  aspect="2/3"
                  sizes="(max-width: 1024px) 60vw, 20rem"
                  className="border border-line bg-paper-2 shadow-editorial"
                  fallbackLabel="Cover not uploaded yet"
                />
              </div>
            </Link>
          </div>

          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-3">
              <MetaLabel as="span" className="text-faint">
                {PRODUCT_TYPE_LABELS[product.type]}
              </MetaLabel>
              {product.badge ? (
                <span className="border border-accent/30 bg-accent-soft px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  {product.badge}
                </span>
              ) : null}
            </div>

            {product.subtitle ? (
              <p className="mt-5 font-display text-xl leading-snug text-ink-2 md:text-2xl">
                {product.subtitle}
              </p>
            ) : null}

            {details.length ? (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                {details.join(" · ")}
              </p>
            ) : null}

            {price ? (
              <p className="mt-8 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  {price}
                </span>
                <span className="label-meta text-faint">Selar checkout</span>
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink
                href={purchaseUrl}
                external
                variant="primary"
                className="group"
              >
                {product.button_text}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
                <span className="sr-only"> (opens Selar in a new tab)</span>
              </ButtonLink>

              <Link
                href={`/book/${product.slug}`}
                className="text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
              >
                More about the {PRODUCT_TYPE_LABELS[product.type].toLowerCase()}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Container>
  );
}
