
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/assets/data";

export const FaqSection = () => {
  return (
    <section id="faq" className="section-container">
      <h2 className="section-title">
        Preguntas <span className="text-gold">frecuentes</span>
      </h2>
      <p className="section-subtitle">
        Resolvemos tus dudas sobre el curso Captura Perfecta
      </p>
      
      <div className="max-w-3xl mx-auto mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border-b border-neutral-200">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-gold transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-700 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
