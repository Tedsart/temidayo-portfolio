import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // The CMS must never be indexed or previewed as public content.
  return <>{children}</>;
}
