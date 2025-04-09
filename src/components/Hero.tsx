
import { Button } from "@/components/ui/button";
import { images } from "@/assets/images";

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${images.hero})`,
          backgroundPosition: "center",
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-block py-1 px-3 bg-gold/20 text-gold rounded-full text-sm font-medium mb-6 font-montserrat animate-fade-in">
            Curso Online de Fotografía
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Aprende a tomar fotos como un profesional
          </h1>
          <p className="text-xl md:text-2xl text-neutral-200 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Domina la luz, el encuadre y la edición desde cero
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white font-medium">
              <a href="#register">Inscríbete ahora</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-neutral-900">
              <a href="#course">Conoce más</a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Abstract Element */}
      <div className="absolute -bottom-8 right-0 w-72 h-72 bg-terracota/20 rounded-full blur-3xl"></div>
      <div className="absolute top-32 -right-12 w-48 h-48 bg-gold/10 rounded-full blur-2xl"></div>
    </section>
  );
};
