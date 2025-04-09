
import { useEffect, useRef } from "react";

interface UseScrollRevealProps {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollReveal = ({ 
  threshold = 0.1, 
  rootMargin = "0px" 
}: UseScrollRevealProps = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ref.current) {
          ref.current.classList.add("revealed");
          observer.unobserve(ref.current);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);
  
  return { ref, className: "reveal" };
};
