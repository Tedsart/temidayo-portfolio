import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AssetImage } from "@/components/public/AssetImage";
import { ButtonLink, EmptyState } from "@/components/ui/primitives";
import { listProductsForAdmin } from "@/lib/data/products";
import { PRODUCT_TYPE_LABELS } from "@/lib/types";
import { guardAdmin } from "@/lib/supabase/guard";
import { productPriceLabel, productPurchaseUrl } from "@/lib/product";
import { formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { email, configured } = await guardAdmin();

  if (!configured) {
    return (
      <AdminShell active="products" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const result = await listProductsForAdmin();
  const products = result.data ?? [];

  return (
    <AdminShell active="products" email={email}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-index">WRITING &amp; PRODUCTS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Optional digital products — an ebook today, a template or guide later.
            Your site only displays them and links out to Selar; checkout, payment
            and delivery stay on Selar.
          </p>
        </div>
        <ButtonLink href="/admin/products/new" variant="accent">
          Create new product
        </ButtonLink>
      </div>

      <div className="mt-8">
        {result.error ? (
          <p className="text-sm text-danger">{result.error}</p>
        ) : products.length ? (
          <ul className="divide-y divide-line border border-line bg-paper">
            {products.map((product) => {
              const live =
                product.enabled &&
                product.published &&
                Boolean(productPurchaseUrl(product));
              const price = productPriceLabel(product);

              return (
                <li
                  key={product.id}
                  className="grid gap-4 px-5 py-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                >
                  <AssetImage
                    src={product.cover?.public_url}
                    alt=""
                    aspect="2/3"
                    sizes="64px"
                    className="hidden h-20 w-[3.25rem] sm:block"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="block truncate text-base font-medium transition-colors hover:text-accent"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span>{PRODUCT_TYPE_LABELS[product.type]}</span>
                      {price ? <span className="text-ink-2">{price}</span> : null}
                      <span>/book/{product.slug}</span>
                      <span>Updated {formatRelativeDate(product.updated_at)}</span>
                    </p>
                    <p className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                          live
                            ? "bg-accent/10 text-accent"
                            : "bg-paper-2 text-muted"
                        }`}
                      >
                        {live ? "Live" : product.published ? "Not live yet" : "Draft"}
                      </span>
                      {!product.enabled ? (
                        <span className="bg-paper-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          Disabled
                        </span>
                      ) : null}
                      {product.featured ? (
                        <span className="bg-paper-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          Featured
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <ProductRowActions
                    id={product.id}
                    published={product.published}
                    title={product.title}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No products yet."
            description="Create one to add an optional ebook or digital product to the site. Nothing appears publicly until you publish it."
          />
        )}
      </div>
    </AdminShell>
  );
}
