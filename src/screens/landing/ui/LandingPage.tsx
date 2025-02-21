import React from "react";
import { HeroSection } from "@/widgets/hero/ui/HeroSection";
import { FeaturesSection } from "@/widgets/features/ui/FeaturesSection";
import { CTASection } from "@/widgets/cta/ui/CTASection";
import { TestimonialsSection } from "@/widgets/testimonials/ui/TestimonialsSection";
import { Footer } from "@/widgets/footer/ui/Footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};
