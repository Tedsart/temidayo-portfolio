import type { Metadata } from "next";
import { ContactPageBody } from "@/components/public/ContactPageBody";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/config";
import { getSiteProfile } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a question worth answering with data? Contact Temidayo Kukoyi by email, LinkedIn or GitHub.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await getSiteProfile();

  return (
    <Container className="py-16 md:py-24">
      <SectionHeading
        index="CONTACT"
        title="Have a question worth answering with data?"
        description="Send the dataset, the question, or the half-formed idea. I will tell you honestly what the data can support."
      />

      <ContactPageBody
        email={profile.data?.email ?? siteConfig.email}
        linkedin={profile.data?.linkedin ?? siteConfig.linkedin}
        github={profile.data?.github ?? siteConfig.github}
      />
    </Container>
  );
}
