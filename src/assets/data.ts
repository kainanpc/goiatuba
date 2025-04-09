
import { Camera, Sun, Grid2X2, Users, SlidersHorizontal, Smartphone } from "lucide-react";

export const modules = [
  {
    id: 1,
    title: "Luz",
    description: "Domina la luz natural y artificial para fotografías espectaculares",
    icon: Sun,
  },
  {
    id: 2,
    title: "Composición",
    description: "Aprende las reglas de composición para crear imágenes impactantes",
    icon: Grid2X2,
  },
  {
    id: 3,
    title: "Retrato",
    description: "Técnicas para capturar la esencia de tus sujetos",
    icon: Users,
  },
  {
    id: 4,
    title: "Edición",
    description: "Transforma tus fotos con ajustes profesionales",
    icon: SlidersHorizontal,
  },
  {
    id: 5,
    title: "Móvil",
    description: "Saca el máximo provecho a la cámara de tu smartphone",
    icon: Smartphone,
  },
  {
    id: 6,
    title: "DSLR",
    description: "Controla tu cámara en modo manual para resultados profesionales",
    icon: Camera,
  },
];

export const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Fotógrafa Aficionada",
    comment: "Este curso transformó completamente mi manera de ver y capturar el mundo. Las explicaciones son claras y prácticas.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    beforeImg: "https://images.unsplash.com/photo-1492019638455-9a5748ae4b57?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=512&q=70",
    afterImg: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=512&q=90",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Emprendedor Digital",
    comment: "Ahora puedo crear imágenes profesionales para mi negocio sin contratar a nadie. El módulo de edición es espectacular.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    beforeImg: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=512&q=70",
    afterImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=512&q=90",
  },
];

export const faqs = [
  {
    id: 1,
    question: "¿Necesito una cámara profesional para tomar el curso?",
    answer: "No, puedes comenzar con un smartphone. El curso incluye un módulo específico para fotografía móvil, y luego puedes avanzar a DSLR si lo deseas."
  },
  {
    id: 2,
    question: "¿Cuánto tiempo tendré acceso al contenido?",
    answer: "Tendrás acceso de por vida a todos los materiales del curso, incluyendo actualizaciones futuras sin costo adicional."
  },
  {
    id: 3,
    question: "¿El curso tiene ejercicios prácticos?",
    answer: "Sí, cada módulo incluye desafíos y ejercicios prácticos para que apliques lo aprendido inmediatamente."
  },
  {
    id: 4,
    question: "¿Ofrecen feedback sobre mis fotografías?",
    answer: "Absolutamente. Tendrás acceso a un grupo privado donde podrás compartir tus imágenes y recibir comentarios del instructor y otros estudiantes."
  },
  {
    id: 5,
    question: "¿Qué pasa si no me gusta el curso?",
    answer: "Ofrecemos una garantía de satisfacción de 7 días. Si no estás satisfecho, te devolvemos el dinero sin preguntas."
  }
];

export const instructor = {
  name: "Alejandro Ramírez",
  role: "Fotógrafo Profesional",
  bio: "Con más de 15 años de experiencia en fotografía comercial y artística, Alejandro ha trabajado para marcas como National Geographic, Sony y Adobe. Su pasión es enseñar el arte de la fotografía de manera accesible para todos los niveles.",
  avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
};

export const coursePricing = {
  originalPrice: 299,
  discountPrice: 149,
  currency: "USD",
  features: [
    "6 módulos completos",
    "30+ horas de contenido en video",
    "Ejercicios prácticos",
    "Feedback personalizado",
    "Comunidad de alumnos",
    "Certificado de finalización",
    "Acceso de por vida",
    "Actualizaciones gratuitas"
  ],
  guaranteeDays: 7
};
