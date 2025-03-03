import { HeroSection } from "@/components/landing-sections/HeroSection";
import { FeaturesSection } from "@/components/landing-sections/FeaturesSection";
import { CTASection } from "@/components/landing-sections/CTASection";
import { NavMenu } from "@/components/landing-sections/NavMenu";

export default function LandingPage() {
  return (
    <>
      <NavMenu />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </>
  );
}
