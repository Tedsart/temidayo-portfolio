import type { Metadata } from "next";
import { AboutSections } from "@/components/public/AboutPage";
import { Container } from "@/components/ui/primitives";
import { getSiteProfile } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Temidayo Kukoyi — a data analyst with a statistics background who turns messy datasets into dashboards, reports and stories people can understand.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const profile = await getSiteProfile();
  if (!profile.data) return null;

  return (
    <Container className="py-16 md:py-24">
      <AboutSections profile={profile.data} usingFallback={profile.usingFallback} />
    </Container>
  );
}
