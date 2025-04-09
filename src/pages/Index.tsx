
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CourseSection } from "@/components/CourseSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { InstructorSection } from "@/components/InstructorSection";
import { PricingSection } from "@/components/PricingSection";
import { FaqSection } from "@/components/FaqSection";
import { RegistrationSection } from "@/components/RegistrationSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "Captura Perfecta | Curso de Fotografía";
  }, []);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <CourseSection />
      <TestimonialSection />
      <InstructorSection />
      <PricingSection />
      <FaqSection />
      <RegistrationSection />
      <Footer />
    </div>
  );
};

export default Index;
