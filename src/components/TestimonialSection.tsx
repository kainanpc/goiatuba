
import { useState } from "react";
import { testimonials } from "@/assets/data";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-20 bg-neutral-100">
      <div className="container mx-auto px-4">
        <h2 className="section-title">
          Lo que dicen nuestros <span className="text-gold">alumnos</span>
        </h2>
        <p className="section-subtitle">
          Descubre cómo Captura Perfecta ha transformado las habilidades fotográficas de nuestros estudiantes.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mt-12">
          <div className="flex-1 flex flex-col items-center lg:items-start">
            <div className="relative mb-6 mx-auto lg:mx-0">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={current.avatarUrl} alt={current.name} />
                <AvatarFallback>{current.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-3 -right-3 bg-gold text-white p-2 rounded-full shadow-md">
                <Quote size={18} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg relative">
              <p className="text-neutral-700 leading-relaxed mb-6">"{current.comment}"</p>
              <div>
                <p className="font-montserrat font-medium text-lg">{current.name}</p>
                <p className="text-neutral-500 text-sm">{current.role}</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button 
                onClick={goToPrevious}
                className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 hover:text-gold transition-colors border border-neutral-200"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={goToNext}
                className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 hover:text-gold transition-colors border border-neutral-200"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-4 text-center lg:text-left">Progreso visible</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <img 
                  src={current.beforeImg} 
                  alt="Antes" 
                  className="w-full h-60 object-cover rounded-lg shadow-md brightness-90 filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-medium py-1 px-2 rounded">
                  ANTES
                </div>
              </div>
              <div className="relative group">
                <img 
                  src={current.afterImg} 
                  alt="Después" 
                  className="w-full h-60 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300"
                />
                <div className="absolute top-4 left-4 bg-gold text-white text-xs font-medium py-1 px-2 rounded">
                  DESPUÉS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
