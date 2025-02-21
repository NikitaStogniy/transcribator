"use client";

import {
  HeroSection,
  FeaturesSection,
  CTASection,
  TestimonialsSection,
  Footer,
} from "@/widgets/index";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
