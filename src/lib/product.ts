/**
 * Pure helpers for digital products — shared by the public site and the CMS
 * editor, so the "is this live yet?" rule lives in exactly one place.
 *
 * Nothing here touches payments. Selar owns checkout, payment and delivery;
 * the site only ever links out.
 */

/** The URL a buyer is sent to: direct checkout wins over the product page. */
export function productPurchaseUrl(product: {
  checkout_url: string | null;
  product_url: string | null;
}): string | null {
  const checkout = product.checkout_url?.trim();
  if (checkout) return checkout;
  const page = product.product_url?.trim();
  return page ? page : null;
}

/** Formats the price for display, respecting the optional display override. */
export function productPriceLabel(product: {
  price_display: string | null;
  price_amount: number | null;
  currency: string;
}): string | null {
  const override = product.price_display?.trim();
  if (override) return override;
  if (product.price_amount === null) return null;

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: product.currency || "NGN",
      maximumFractionDigits: product.price_amount % 1 === 0 ? 0 : 2,
    }).format(product.price_amount);
  } catch {
    // Unknown currency code — fall back to a plain "CODE amount" label.
    return `${product.currency} ${product.price_amount.toLocaleString("en-NG")}`;
  }
}

/**
 * A product reaches the public site only when it is switched on, published and
 * actually has somewhere to buy it — so a half-filled product can never render
 * an empty section or a dead button.
 */
export function isProductLive(product: {
  enabled: boolean;
  published: boolean;
  checkout_url: string | null;
  product_url: string | null;
}): boolean {
  return Boolean(
    product.enabled && product.published && productPurchaseUrl(product),
  );
}

export interface VisibilityItem {
  label: string;
  ok: boolean;
  hint: string;
}

/** Drives the checklist panel in the CMS editor. */
export function productVisibility(product: {
  enabled: boolean;
  published: boolean;
  checkout_url: string | null;
  product_url: string | null;
  cover: { id: string } | null;
}): VisibilityItem[] {
  return [
    {
      label: "Product enabled",
      ok: product.enabled,
      hint: "Master switch for the whole feature.",
    },
    {
      label: "Published",
      ok: product.published,
      hint: "Unpublish to hide it everywhere without deleting it.",
    },
    {
      label: "Selar link added",
      ok: Boolean(productPurchaseUrl(product)),
      hint: "Paste the Selar product or checkout URL.",
    },
    {
      label: "Cover uploaded",
      ok: Boolean(product.cover),
      hint: "Portrait artwork reads best — around 1000 × 1500 px.",
    },
  ];
}

/** Alt text for the cover, never empty, never the file name. */
export function productCoverAlt(product: {
  title: string;
  author: string | null;
  cover: { alt_text: string | null } | null;
}): string {
  const custom = product.cover?.alt_text?.trim();
  if (custom) return custom;
  return product.author
    ? `Cover of ${product.title} by ${product.author}`
    : `Cover of ${product.title}`;
}
