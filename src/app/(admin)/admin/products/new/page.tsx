import { AdminShell } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { email, configured } = await guardAdmin();

  return (
    <AdminShell active="products" email={email}>
      <p className="section-index">NEW PRODUCT</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Create a product
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Everything here is optional apart from the title. The product is created
        as a <strong className="font-medium text-ink">draft</strong> — nothing is
        public until it is enabled, published and has a Selar link.
      </p>

      <div className="mt-8">
        {configured ? <ProductEditor initial={null} /> : <SetupNotice />}
      </div>
    </AdminShell>
  );
}
