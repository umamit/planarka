import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { BrandFooter } from "@/components/shared/BrandFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { RegulationsBanner } from "@/components/landing/RegulationsBanner";
import { CtaSection } from "@/components/landing/CtaSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
        <RegulationsBanner />
        <CtaSection />
      </main>
      <BrandFooter />
    </div>
  );
}
