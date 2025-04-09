
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { images } from "@/assets/images";

export const RegistrationSection = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular envio do formulário
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Registro recibido",
        description: "Te hemos enviado un correo con los detalles de pago.",
        variant: "default",
      });
      setFormData({ name: "", email: "", phone: "" });
    }, 1500);
  };

  return (
    <section id="register" className="section-container">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-gold">Inscríbete</span> ahora y comienza tu viaje fotográfico
            </h2>
            <p className="text-neutral-700 mb-8">
              Completa el formulario para reservar tu lugar en el curso. Te enviaremos un correo electrónico con las instrucciones de pago y acceso a la plataforma.
            </p>
            
            <div className="mb-8 grid grid-cols-2 gap-4">
              {images.gallery.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-square">
                  <img
                    src={image}
                    alt={`Fotografía ejemplo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border border-neutral-100">
            <h3 className="text-xl font-bold mb-6 text-center">Formulario de inscripción</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ingresa tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Tu número telefónico"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white" disabled={loading}>
                {loading ? "Procesando..." : "Inscríbete y proceder al pago"}
              </Button>
              
              <p className="text-xs text-center text-neutral-500 mt-4">
                Al inscribirte, aceptas nuestros términos y condiciones y política de privacidad.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
