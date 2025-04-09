
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { modules } from "@/assets/data";
import { images } from "@/assets/images";

export const CourseSection = () => {
  return (
    <section id="course" className="section-container">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sobre el <span className="text-gold">curso</span>
          </h2>
          <p className="text-lg text-neutral-700 mb-8">
            En Captura Perfecta, te enseñamos a dominar el arte de la fotografía desde los fundamentos hasta técnicas avanzadas. Un programa diseñado tanto para principiantes como para aquellos que desean perfeccionar sus habilidades.
          </p>
          
          <div className="bg-neutral-100 border-l-4 border-gold p-4 mb-8">
            <p className="text-lg font-medium text-neutral-800">
              No necesitas experiencia previa ni equipo profesional para comenzar tu viaje fotográfico.
            </p>
          </div>
          
          <h3 className="font-bold text-xl mb-4">Lo que aprenderás:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((module) => (
              <div key={module.id} className="flex items-start space-x-3">
                <div className="bg-gold/10 p-2 rounded-md text-gold">
                  <module.icon size={20} />
                </div>
                <div>
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="text-sm text-neutral-600">{module.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-1 md:order-2 relative">
          <img 
            src={images.about} 
            alt="Curso de fotografía" 
            className="rounded-lg shadow-xl object-cover w-full h-[400px]"
          />
          <div className="absolute -bottom-6 -right-6 bg-white shadow-lg p-4 rounded-lg w-28 h-28 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gold">30+</span>
            <span className="text-sm text-center text-neutral-700">horas de contenido</span>
          </div>
        </div>
      </div>
    </section>
  );
};
