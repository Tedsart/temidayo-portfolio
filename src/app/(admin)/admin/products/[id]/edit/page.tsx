import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { EmptyState } from "@/components/ui/primitives";
import { getProductById } from "@/lib/data/products";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email, configured } = await guardAdmin();

  if (!configured) {
    return (
      <AdminShell active="products" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const result = await getProductById(id);

  return (
    <AdminShell active="products" email={email}>
      <Link
        href="/admin/products"
        className="text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
      >
        ← All products
      </Link>

      <p className="section-index mt-6">EDIT PRODUCT</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {result.data?.title ?? "Product"}
      </h1>

      <div className="mt-8">
        {result.error ? (
          <p className="text-sm text-danger">{result.error}</p>
        ) : result.data ? (
          <ProductEditor initial={result.data} />
        ) : (
          <EmptyState
            title="Product not found"
            description="It may have been deleted. Head back to the products list."
          />
        )}
      </div>
    </AdminShell>
  );
}
