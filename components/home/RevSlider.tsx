"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShop } from "@/context/ShopContext";

export default function RevSlider() {
  const { slides } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(nextSlide, 8000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[350px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden group bg-[#1d2327]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover object-center scale-100" 
            />
            <div className="absolute inset-0 bg-black/40 md:bg-black/30" />
          </div>

          {/* Content */}
          <div className={cn(
            "relative h-full w-full px-6 sm:px-12 md:px-24 flex flex-col justify-center text-white",
            // Desktop alignment
            slide.buttonPosition === 'center' ? 'md:items-center md:text-center' :
            slide.buttonPosition === 'right' ? 'md:items-end md:text-right' :
            'md:items-start md:text-left',
            // Mobile: keep it more compact and aligned to the left/center based on image
            "items-start text-left sm:items-center sm:text-center md:items-start md:text-left"
          )}>
            <div className={cn(
              "space-y-3 md:space-y-6 w-full max-w-4xl transform transition-all duration-700 delay-300",
              index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
              // Layout adjustments for alignment
              "flex flex-col items-start sm:items-center md:items-start",
              slide.buttonPosition === 'center' ? 'md:items-center' :
              slide.buttonPosition === 'right' ? 'md:items-end' :
              ''
            )}>
              <span className="text-primary font-black text-[9px] md:text-xs uppercase tracking-[0.3em]">
                {slide.subtitle}
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black italic uppercase leading-[1.1]">
                {slide.title}
              </h2>
              <p className="text-gray-200 text-[11px] sm:text-sm md:text-lg max-w-xl leading-relaxed line-clamp-2 md:line-clamp-none">
                {slide.description}
              </p>
              <div className="pt-2 md:pt-4 flex flex-row items-center gap-4 md:gap-6">
                <a 
                  href={slide.buttonLink}
                  className="bg-primary text-white px-5 py-2 md:px-8 md:py-4 text-[10px] md:text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center group/btn"
                >
                  {slide.buttonText}
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </a>
                {slide.secondButtonText && (
                  <a href={slide.secondButtonLink || '#'} className="text-white text-[10px] md:text-sm font-black uppercase tracking-widest hover:text-primary transition-colors border-b-2 border-white/20 hover:border-primary pb-1">
                    {slide.secondButtonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Hidden on Mobile */}
      <button 
        onClick={prevSlide}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Progress Indicators - Improved for Mobile */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-1 transition-all duration-300 rounded-full",
              index === currentSlide ? "w-8 md:w-12 bg-primary" : "w-4 md:w-6 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
