import { Hero } from "@/components/public/Home/Hero";
import { FocusAreas } from "@/components/public/Home/FocusAreas";
import { ImpactStrip } from "@/components/public/Home/ImpactStrip";
import { CtaSection } from "@/components/public/Home/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FocusAreas />
      <ImpactStrip />
      <CtaSection />
    </>
  );
}
