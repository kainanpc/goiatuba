
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              <span className="text-gold">Captura</span>Perfecta
            </h3>
            <p className="mb-6">
              Curso online para dominar el arte de la fotografía desde cero. Aprende a tu propio ritmo y transforma tus habilidades fotográficas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-gold transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-gold transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </a>
              <a href="#" className="hover:text-gold transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-gold transition-colors">Inicio</a></li>
              <li><a href="#course" className="hover:text-gold transition-colors">Sobre el curso</a></li>
              <li><a href="#testimonials" className="hover:text-gold transition-colors">Testimonios</a></li>
              <li><a href="#instructor" className="hover:text-gold transition-colors">Instructor</a></li>
              <li><a href="#pricing" className="hover:text-gold transition-colors">Precios</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gold transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Política de reembolso</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <p className="mb-2">support@capturaperfecta.com</p>
            <p>+34 123 456 789</p>
            <p className="mt-6 text-sm">Horario de atención: Lunes a Viernes, 9am - 6pm (CET)</p>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Captura Perfecta. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
