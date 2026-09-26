import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { siteConfig } from "@/lib/config";
import { getSiteProfile } from "@/lib/data/projects";

/**
 * Public chrome. The CMS lives in the (admin) group and never inherits the
 * marketing navigation or footer.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSiteProfile();
  const data = profile.data;

  return (
    <>
      <PreviewBanner />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer
        linkedin={data?.linkedin}
        github={data?.github}
        email={data?.email ?? siteConfig.email}
      />
    </>
  );
}
