
import { CheckCircle, Clock } from "lucide-react";
import { coursePricing } from "@/assets/data";
import { Button } from "@/components/ui/button";

export const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-20 bg-neutral-900 text-white overflow-hidden">
      {/* Abstract Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-terracota to-gold"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute top-32 left-10 w-48 h-48 bg-terracota/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4">
        <h2 className="section-title text-white">
          Planes y <span className="text-gold">precios</span>
        </h2>
        <p className="section-subtitle text-neutral-300">
          Invierte en tu desarrollo fotográfico con nuestro plan completo a un precio especial por tiempo limitado.
        </p>
        
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-neutral-800">
            <div className="bg-gold text-white p-6 relative">
              <div className="absolute right-4 top-4 bg-white text-gold font-bold py-1 px-3 rounded-full text-sm">
                Oferta
              </div>
              <h3 className="text-2xl font-bold">Curso Completo</h3>
              <p className="opacity-90">Acceso a todo el contenido</p>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-center mb-8">
                <span className="text-neutral-400 text-lg line-through mr-3">
                  ${coursePricing.originalPrice} {coursePricing.currency}
                </span>
                <div>
                  <span className="text-4xl font-bold text-neutral-800">${coursePricing.discountPrice}</span>
                  <span className="text-neutral-600 ml-1">{coursePricing.currency}</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {coursePricing.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-gold flex-shrink-0" size={20} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center bg-neutral-100 p-4 rounded-lg mb-6">
                <Clock className="text-gold mr-2" size={20} />
                <span className="font-medium">¡Oferta por tiempo limitado!</span>
              </div>
              
              <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white w-full font-medium">
                <a href="#register">Inscríbete ahora</a>
              </Button>
              
              <div className="mt-6 text-center text-sm text-neutral-500">
                <p>Garantía de satisfacción de {coursePricing.guaranteeDays} días. Si no te gusta, te devolvemos el dinero.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
