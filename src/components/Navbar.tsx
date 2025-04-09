
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const navLinks = [
    { title: "Inicio", href: "#home" },
    { title: "Curso", href: "#course" },
    { title: "Testimonios", href: "#testimonials" },
    { title: "Instructor", href: "#instructor" },
    { title: "Precios", href: "#pricing" },
    { title: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-md py-2" : "bg-transparent py-4"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="#home" className="text-2xl font-montserrat font-bold">
            <span className="text-gold">Captura</span>
            <span className={`${scrolled ? "text-neutral-800" : "text-white"}`}>Perfecta</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.href}
                className={`font-medium ${scrolled ? "text-neutral-700 hover:text-gold" : "text-white hover:text-gold"} transition-colors`}
              >
                {link.title}
              </a>
            ))}
            <Button asChild size="sm" className="bg-gold hover:bg-gold/90 text-white">
              <a href="#register">Inscríbete</a>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className={`${scrolled ? "text-neutral-800" : "text-white"} focus:outline-none`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-xl rounded-lg mt-2 py-4 px-2 absolute left-4 right-4 animate-fade-in z-50">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href}
                  className="font-medium text-neutral-700 hover:text-gold px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.title}
                </a>
              ))}
              <div className="px-4 pt-2">
                <Button asChild size="sm" className="bg-gold hover:bg-gold/90 text-white w-full">
                  <a href="#register" onClick={() => setIsMenuOpen(false)}>Inscríbete</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
