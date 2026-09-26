import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // The CMS must never be indexed or carry the public chrome.
  return <main id="main" className="flex-1">{children}</main>;
}
