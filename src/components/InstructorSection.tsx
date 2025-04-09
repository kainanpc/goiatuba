
import { instructor } from "@/assets/data";
import { Instagram, Twitter, Globe } from "lucide-react";

export const InstructorSection = () => {
  return (
    <section id="instructor" className="section-container">
      <h2 className="section-title">Quién te <span className="text-gold">enseña</span></h2>
      <p className="section-subtitle">
        Aprende de un fotógrafo con amplia experiencia en el campo profesional y la enseñanza.
      </p>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src={instructor.avatarUrl} 
                  alt={instructor.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-terracota/20 rounded-full blur-2xl -z-10"></div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <a 
                href="#" 
                className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200 transition-colors text-neutral-700"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200 transition-colors text-neutral-700"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200 transition-colors text-neutral-700"
                aria-label="Website"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h3 className="text-2xl font-bold mb-2">{instructor.name}</h3>
            <p className="text-terracota font-medium mb-4">{instructor.role}</p>
            <p className="text-neutral-700 leading-relaxed mb-6">{instructor.bio}</p>
            
            <div className="bg-neutral-100 p-6 rounded-lg border-l-4 border-gold">
              <p className="italic text-neutral-700">
                "Mi misión es desmitificar la fotografía profesional y hacer que estas poderosas técnicas creativas sean accesibles para todos, sin importar su nivel de experiencia o el equipo que tengan."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
