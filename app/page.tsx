'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";

// Componente Logo que representa la silueta de la fachada de la Parroquia Nuestra Señora del Patrocinio
function LogoIglesia({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      {/* Cruz Superior */}
      <rect x="49" y="3" width="2.2" height="15" rx="0.5" />
      <rect x="44.5" y="7.5" width="11" height="2.2" rx="0.5" />

      {/* Cúpula del campanario central */}
      <polygon points="43,20 50,14.5 57,20" />
      <rect x="44" y="20" width="12" height="1.5" />

      {/* Cuerpo del campanario central */}
      <rect x="45" y="21.5" width="10" height="12" />
      {/* Arco y campana del campanario */}
      <rect x="48.5" y="24" width="3" height="6.5" rx="1.5" fill="white" />
      <path d="M49,27.5 c-0.5,0 -0.8,0.4 -0.8,0.8 l-0.2,1.2 h2l-0.2,-1.2 c0,-0.4 -0.3,-0.8 -0.8,-0.8 z" fill="currentColor" />

      {/* Techo intermedio inclinado */}
      <polygon points="38,39.5 43,33.5 57,33.5 62,39.5" />

      {/* Sección media del templo */}
      <rect x="39" y="39.5" width="22" height="11.5" />
      {/* Ventana circular central (Rosetón) */}
      <circle cx="50" cy="45" r="3.8" fill="white" />

      {/* Techo inferior inclinado principal */}
      <polygon points="33,53.5 39,51 61,51 67,53.5" />

      {/* Nave principal */}
      <rect x="34.5" y="53.5" width="31" height="20" />
      
      {/* Arcos inferiores y campanas */}
      {/* Arco izquierdo */}
      <path d="M38.5,60.5 a4,4 0 0,1 8,0 v13 h-8 z" fill="white" />
      <path d="M41.5,64.8 c-0.5,0 -0.8,0.4 -0.8,0.8 l-0.2,1.2 h2l-0.2,-1.2 c0,-0.4 -0.3,-0.8 -0.8,-0.8 z" fill="currentColor" />
      
      {/* Arco derecho */}
      <path d="M51.5,60.5 a4,4 0 0,1 8,0 v13 h-8 z" fill="white" />
      <path d="M54.5,64.8 c-0.5,0 -0.8,0.4 -0.8,0.8 l-0.2,1.2 h2l-0.2,-1.2 c0,-0.4 -0.3,-0.8 -0.8,-0.8 z" fill="currentColor" />

      {/* Cúpula y torre lateral izquierda */}
      <circle cx="24.5" cy="51.5" r="1.5" />
      <rect x="24" y="53" width="1" height="4" />
      <polygon points="21.5,60 24.5,56.5 27.5,60" />
      <rect x="22.5" y="60" width="4.2" height="13.5" />
      <path d="M23.6,64 a1,1 0 0,1 2,0 v9.5 h-2 z" fill="white" />

      {/* Cúpula y torre lateral derecha */}
      <circle cx="75.5" cy="51.5" r="1.5" />
      <rect x="75" y="53" width="1" height="4" />
      <polygon points="72.5,60 75.5,56.5 78.5,60" />
      <rect x="73.3" y="60" width="4.2" height="13.5" />
      <path d="M74.4,64 a1,1 0 0,1 2,0 v9.5 h-2 z" fill="white" />

      {/* Muro base de unión inclinado */}
      <polygon points="11,73.5 22.5,64.5 34.5,73.5" />
      <polygon points="65.5,73.5 77.5,64.5 89,73.5" />

      {/* Línea de base */}
      <rect x="10" y="73.5" width="80" height="2.5" rx="1" />
    </svg>
  );
}

export default function Home() {
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "Bajo tu amparo nos acogemos madre";
  const servicesSectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const preventClick = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDown.current = true;
    preventClick.current = false;
    carouselRef.current.style.scrollSnapType = 'none';
    carouselRef.current.style.scrollBehavior = 'auto';
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftVal.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = '';
      carouselRef.current.style.scrollBehavior = '';
    }
  };

  const handleMouseUp = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = '';
      carouselRef.current.style.scrollBehavior = '';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    
    if (Math.abs(x - startX.current) > 5) {
      preventClick.current = true;
    }
    
    e.preventDefault();
    carouselRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (preventClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsServicesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    if (servicesSectionRef.current) {
      observer.observe(servicesSectionRef.current);
    }

    // Typewriter effect
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
      }
    }, 70);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] text-slate-800 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      

      {/* Floating Header / Capsule Navigation Bar */}
      <Header className="-mb-20" />

      <div className="relative w-full h-[280px] sm:h-[380px] lg:h-[480px] overflow-hidden bg-slate-900 border-b border-slate-100">
        <Image
          src="/church_patroness_hero.jpg"
          alt="Nuestra Señora del Patrocinio y fachada de la Parroquia"
          fill
          className="object-cover object-center scale-102 select-none"
          priority
        />
        
        {/* Overlapping white folder-style tab with curved right side ('volde') */}
        <div className="absolute bottom-0 left-4 sm:left-12 h-11 w-64 select-none pointer-events-none z-10">
          <svg className="absolute bottom-0 left-0 w-full h-full text-[#fafaf9]" viewBox="0 0 256 44" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 0 44 L 0 10 C 0 4.48 4.48 0 10 0 L 175 0 C 187 0 198 6.5 206 17 L 222 38 C 226 43 232 44 238 44 Z" 
              fill="#fafaf9" 
              stroke="#e2e8f0" 
              strokeWidth="1.2" 
            />
          </svg>
          <div className="absolute inset-0 pl-5 pr-12 flex items-center gap-2 pointer-events-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c3e35] pt-0.5 font-serif">
              {typedText}
            </span>
          </div>
        </div>
      </div>

      {/* Welcome & Presentation Section (Light background, split layout) */}
      <section className="py-16 sm:py-24 border-b border-slate-100/50 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Huge elegant serif title */}
            <div className="lg:col-span-7">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6.5xl font-light text-[#8C7A6B] leading-[1.1] tracking-tight">
                Parroquia Nuestra Señora del Patrocinio
              </h1>
              
              {/* Tarjetita de Horarios Estilo Post Social con Flotación */}
              <div className="mt-8 relative max-w-sm bg-gradient-to-b from-white to-[#FAF8F5]/95 border border-white/80 rounded-3xl p-6 shadow-xl shadow-[#9E9A85]/15 overflow-hidden animate-float-card">
                {/* Imagen de Fondo de Nuestra Señora de Fátima dentro de la tarjeta */}
                <div 
                  className="absolute inset-0 bg-no-repeat bg-cover bg-center pointer-events-none opacity-[0.26]" 
                  style={{ backgroundImage: "url('/church_fatima.png')" }}
                />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Cita */}
                  <span className="text-[10px] italic text-[#8C6B2F] font-serif mb-3 select-none">
                    &quot;Cristo nos reúne en torno a su mesa. Participa de la Santa Misa.&quot;
                  </span>
                  
                  {/* Logotipo Oficial en Formato Icono SVG Circular */}
                  <div className="w-16 h-16 rounded-full bg-slate-950/65 border border-white/20 p-2.5 shadow-md mb-3 flex items-center justify-center select-none pointer-events-none">
                    <LogoIglesia className="w-11 h-11 text-white" />
                  </div>
                  
                  <span className="block text-slate-800 text-xs font-bold font-serif mb-4 select-none">
                    Horarios de la Santa Misa
                  </span>
                  
                  {/* Tarjetita blanca interna traslúcida */}
                  <div className="w-full bg-white/70 backdrop-blur-xs border border-[#EADCB9]/45 rounded-2xl p-4 space-y-4">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#a35b80]">
                        Lunes a Sábado
                      </span>
                      <span className="block text-sm sm:text-base font-bold text-slate-800 font-mono mt-1">
                        7:00 AM &mdash; 6:00 PM
                      </span>
                    </div>
                    
                    <div className="border-t border-[#EADCB9]/40 pt-3">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#a35b80] mb-2">
                        Domingos
                      </span>
                      <div className="flex justify-center gap-2">
                        <span className="bg-white border border-[#EADCB9]/70 px-2.5 py-1 rounded-full text-xs font-bold font-mono text-slate-800 shadow-3xs">
                          8:00 AM
                        </span>
                        <span className="bg-white border border-[#EADCB9]/70 px-2.5 py-1 rounded-full text-xs font-bold font-mono text-slate-800 shadow-3xs">
                          11:00 AM
                        </span>
                        <span className="bg-[#a35b80] text-white px-2.5 py-1 rounded-full text-xs font-bold font-mono shadow-3xs">
                          7:00 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes gentleFloat {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float-card {
                  animation: gentleFloat 6s ease-in-out infinite;
                }
              `}</style>
            </div>

            {/* Right Column: Brief welcoming text and action button */}
            <div className="lg:col-span-5 pt-2 flex flex-col items-start">
              <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-light mb-8">
                Te damos la bienvenida a nuestro espacio digital. Aquí podrás consultar horarios de misas, programar intenciones comunitarias e iniciar tus trámites sacramentales de manera fácil y accesible para todos.
              </p>
              <Link 
                href="#servicios" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#80385e] hover:bg-[#964a75] transition-all rounded-full shadow-sm hover:scale-105 active:scale-95 duration-200"
              >
                Ver Servicios
                <span className="text-sm font-semibold">&rarr;</span>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Services Section (Premium Card Carousel with Staggered Scroll Reveal) */}
      <section id="servicios" ref={servicesSectionRef} className="py-16 sm:py-20 bg-gradient-to-r from-[#80385e] via-[#a35b80] to-[#964a75] text-white relative overflow-hidden">
        {/* Soft background glow to match the theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a35b80]/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 sm:mb-10">

            <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#EADCB9] leading-[1.1] tracking-tight">
              Servicios y sacramentos a disposición de nuestra comunidad
            </p>
          </div>

          {/* Horizontal Carousel of services */}
          <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {/* Blurred/Faded Gradient Edges Mask */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#80385e] via-[#80385e]/40 to-transparent pointer-events-none z-20" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#964a75] via-[#964a75]/40 to-transparent pointer-events-none z-20" />

            <div 
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onClickCapture={handleClickCapture}
              className="group/carousel flex overflow-x-auto gap-6 pt-6 pb-16 snap-x snap-mandatory scroll-smooth scrollbar-none cursor-grab active:cursor-grabbing select-none"
            >
              
              {/* Card 1: Misa */}
              <div 
                className={`reveal-card ${isServicesVisible ? 'active' : ''} group/card relative w-[290px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start pt-4`}
              >
                {/* Smoky Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#a35b80]/25 via-amber-500/15 to-[#80385e]/25 rounded-3xl blur-3xl opacity-30 group-hover/card:opacity-90 group-hover/card:scale-105 transition-all duration-300 pointer-events-none" />

                {/* Main Card container */}
                <div className="relative flex flex-col h-full bg-slate-950/75 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover/carousel:opacity-50 group-hover/carousel:scale-[0.96] group-hover/card:!opacity-100 group-hover/card:!scale-[1.04] group-hover/card:!-translate-y-4 group-hover/card:border-white/[0.15] group-hover/card:shadow-[0_0_40px_8px_rgba(255,255,255,0.06)]">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-slate-800/80">
                    <Image
                      src="/church_altar.jpg"
                      alt="Intenciones de Misa altar"
                      fill
                      className="object-cover object-center scale-102 hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex justify-center mb-1">
                      <svg className="w-12 h-12 text-white/40 drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 90 L90 90" />
                        <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                        <path d="M50 3 L50 12 M46 7 L54 7" />
                        <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                        <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                        <circle cx="50" cy="50" r="5" />
                        <circle cx="50" cy="50" r="1.5" />
                        <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                        <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                        <path d="M35 53 L20 60 M65 53 L80 60" />
                      </svg>
                    </div>
                    <div>

                      <h3 className="font-serif text-lg sm:text-xl font-light text-white tracking-tight leading-snug mb-3 text-center">
                        Misas
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed text-center">
                        Separa la fecha de tu misa, ya sea para intenciones tradicionales (salud, difuntos) o celebraciones de bautizos y otros sacramentos.
                      </p>
                    </div>
                    <Link href="/misas/nueva" className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-[#FFFDF9] hover:bg-white transition-all rounded-xl shadow-sm hover:scale-102 active:scale-95 duration-200 mt-2">
                      Reservar Misa
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2: Bautizo */}
              <div 
                className={`reveal-card ${isServicesVisible ? 'active' : ''} group/card relative w-[290px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start pt-4`}
                style={{ transitionDelay: '100ms' }}
              >
                {/* Smoky Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#a35b80]/25 via-amber-500/15 to-[#80385e]/25 rounded-3xl blur-3xl opacity-30 group-hover/card:opacity-90 group-hover/card:scale-105 transition-all duration-300 pointer-events-none" />

                {/* Main Card container */}
                <div className="relative flex flex-col h-full bg-slate-950/75 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover/carousel:opacity-50 group-hover/carousel:scale-[0.96] group-hover/card:!opacity-100 group-hover/card:!scale-[1.04] group-hover/card:!-translate-y-4 group-hover/card:border-white/[0.15] group-hover/card:shadow-[0_0_40px_8px_rgba(255,255,255,0.06)]">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-slate-800/80">
                    <Image
                      src="/church_baptism.jpg"
                      alt="Pila bautismal de la iglesia"
                      fill
                      className="object-cover object-center scale-102 hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex justify-center mb-1">
                      <svg className="w-12 h-12 text-white/40 drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 90 L90 90" />
                        <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                        <path d="M50 3 L50 12 M46 7 L54 7" />
                        <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                        <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                        <circle cx="50" cy="50" r="5" />
                        <circle cx="50" cy="50" r="1.5" />
                        <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                        <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                        <path d="M35 53 L20 60 M65 53 L80 60" />
                      </svg>
                    </div>
                    <div>

                      <h3 className="font-serif text-lg sm:text-xl font-light text-white tracking-tight leading-snug mb-3 text-center">
                        Requisitos de Sacramentos
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed text-center">
                        Conoce la documentación y preparación previa necesarias para tramitar y celebrar cada uno de los sacramentos.
                      </p>
                    </div>
                    <Link href="/bautizos" className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-[#FFFDF9] hover:bg-white transition-all rounded-xl shadow-sm hover:scale-102 active:scale-95 duration-200 mt-2">
                      Ver Requisitos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 3: Horarios */}
              <div 
                className={`reveal-card ${isServicesVisible ? 'active' : ''} group/card relative w-[290px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start pt-4`}
                style={{ transitionDelay: '200ms' }}
              >
                {/* Smoky Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#a35b80]/25 via-amber-500/15 to-[#80385e]/25 rounded-3xl blur-3xl opacity-30 group-hover/card:opacity-90 group-hover/card:scale-105 transition-all duration-300 pointer-events-none" />

                {/* Main Card container */}
                <div className="relative flex flex-col h-full bg-slate-950/75 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover/carousel:opacity-50 group-hover/carousel:scale-[0.96] group-hover/card:!opacity-100 group-hover/card:!scale-[1.04] group-hover/card:!-translate-y-4 group-hover/card:border-white/[0.15] group-hover/card:shadow-[0_0_40px_8px_rgba(255,255,255,0.06)]">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-slate-800/80">
                    <Image
                      src="/church_interior_wide.jpg"
                      alt="Interior de la iglesia"
                      fill
                      className="object-cover object-center scale-102 hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex justify-center mb-1">
                      <svg className="w-12 h-12 text-white/40 drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 90 L90 90" />
                        <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                        <path d="M50 3 L50 12 M46 7 L54 7" />
                        <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                        <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                        <circle cx="50" cy="50" r="5" />
                        <circle cx="50" cy="50" r="1.5" />
                        <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                        <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                        <path d="M35 53 L20 60 M65 53 L80 60" />
                      </svg>
                    </div>
                    <div>

                      <h3 className="font-serif text-lg sm:text-xl font-light text-white tracking-tight leading-snug mb-3 text-center">
                        Horarios y Despacho
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed text-center">
                        Consulta los horarios detallados de celebraciones dominicales y semanales, confesiones en el templo, charlas para padres y padrinos, y la disponibilidad del despacho.
                      </p>
                    </div>
                    <Link href="#horarios" className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-[#FFFDF9] hover:bg-white transition-all rounded-xl shadow-sm hover:scale-102 active:scale-95 duration-200 mt-2">
                      Ver Horarios
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 4: Comunidad */}
              <div 
                className={`reveal-card ${isServicesVisible ? 'active' : ''} group/card relative w-[290px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start pt-4`}
                style={{ transitionDelay: '300ms' }}
              >
                {/* Smoky Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#a35b80]/25 via-amber-500/15 to-[#80385e]/25 rounded-3xl blur-3xl opacity-30 group-hover/card:opacity-90 group-hover/card:scale-105 transition-all duration-300 pointer-events-none" />

                {/* Main Card container */}
                <div className="relative flex flex-col h-full bg-slate-950/75 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover/carousel:opacity-50 group-hover/carousel:scale-[0.96] group-hover/card:!opacity-100 group-hover/card:!scale-[1.04] group-hover/card:!-translate-y-4 group-hover/card:border-white/[0.15] group-hover/card:shadow-[0_0_40px_8px_rgba(255,255,255,0.06)]">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-slate-800/80">
                    <Image
                      src="/church_hero_bg.jpg"
                      alt="Comunidad parroquial"
                      fill
                      className="object-cover object-center scale-102 hover:scale-105 transition-transform duration-700 select-none opacity-85 pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex justify-center mb-1">
                      <svg className="w-12 h-12 text-white/40 drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 90 L90 90" />
                        <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                        <path d="M50 3 L50 12 M46 7 L54 7" />
                        <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                        <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                        <circle cx="50" cy="50" r="5" />
                        <circle cx="50" cy="50" r="1.5" />
                        <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                        <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                        <path d="M35 53 L20 60 M65 53 L80 60" />
                      </svg>
                    </div>
                    <div>

                      <h3 className="font-serif text-lg sm:text-xl font-light text-white tracking-tight leading-snug mb-3 text-center">
                        Comunidad y Catequesis
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed text-center">
                        Infórmate sobre las fechas de inscripción para la preparación sacramental de niños, jóvenes y adultos (Primera Comunión, Confirmación y Catequesis Familiar).
                      </p>
                    </div>
                    <Link href="/catequesis" className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-[#FFFDF9] hover:bg-white transition-all rounded-xl shadow-sm hover:scale-102 active:scale-95 duration-200 mt-2">
                      Ver Información
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 5: Enfermos */}
              <div 
                className={`reveal-card ${isServicesVisible ? 'active' : ''} group/card relative w-[290px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start pt-4`}
                style={{ transitionDelay: '400ms' }}
              >
                {/* Smoky Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#a35b80]/25 via-amber-500/15 to-[#80385e]/25 rounded-3xl blur-3xl opacity-30 group-hover/card:opacity-90 group-hover/card:scale-105 transition-all duration-300 pointer-events-none" />

                {/* Main Card container */}
                <div className="relative flex flex-col h-full bg-slate-950/75 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover/carousel:opacity-50 group-hover/carousel:scale-[0.96] group-hover/card:!opacity-100 group-hover/card:!scale-[1.04] group-hover/card:!-translate-y-4 group-hover/card:border-white/[0.15] group-hover/card:shadow-[0_0_40px_8px_rgba(255,255,255,0.06)]">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-slate-800/80">
                    <Image
                      src="/church_mass.jpg"
                      alt="Atención enfermos altar"
                      fill
                      className="object-cover object-center scale-102 hover:scale-105 transition-transform duration-700 select-none brightness-90 pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex justify-center mb-1">
                      <svg className="w-12 h-12 text-white/40 drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 90 L90 90" />
                        <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                        <path d="M50 3 L50 12 M46 7 L54 7" />
                        <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                        <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                        <circle cx="50" cy="50" r="5" />
                        <circle cx="50" cy="50" r="1.5" />
                        <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                        <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                        <path d="M35 53 L20 60 M65 53 L80 60" />
                      </svg>
                    </div>
                    <div>

                      <h3 className="font-serif text-lg sm:text-xl font-light text-white tracking-tight leading-snug mb-3 text-center">
                        Atención a Enfermos
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed text-center">
                        Coordina visitas pastorales para la comunión a domicilio de personas enfermas o ancianas, y solicita la unción de los enfermos en situaciones de necesidad espiritual.
                      </p>
                    </div>
                    <Link href="#contacto" className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-[#FFFDF9] hover:bg-white transition-all rounded-xl shadow-sm hover:scale-102 active:scale-95 duration-200 mt-2">
                      Solicitar Visita
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 6: Donaciones */}
              <div 
                className={`reveal-card ${isServicesVisible ? 'active' : ''} group/card relative w-[290px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start pt-4`}
                style={{ transitionDelay: '500ms' }}
              >
                {/* Smoky Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#a35b80]/25 via-amber-500/15 to-[#80385e]/25 rounded-3xl blur-3xl opacity-30 group-hover/card:opacity-90 group-hover/card:scale-105 transition-all duration-300 pointer-events-none" />

                {/* Main Card container */}
                <div className="relative flex flex-col h-full bg-slate-950/75 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out group-hover/carousel:opacity-50 group-hover/carousel:scale-[0.96] group-hover/card:!opacity-100 group-hover/card:!scale-[1.04] group-hover/card:!-translate-y-4 group-hover/card:border-white/[0.15] group-hover/card:shadow-[0_0_40px_8px_rgba(255,255,255,0.06)]">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-slate-800/80">
                    <Image
                      src="/church_schedules.jpg"
                      alt="Ofrendas templo interior"
                      fill
                      className="object-cover object-center scale-102 hover:scale-105 transition-transform duration-700 select-none brightness-90 pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex justify-center mb-1">
                      <svg className="w-12 h-12 text-white/40 drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 90 L90 90" />
                        <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                        <path d="M50 3 L50 12 M46 7 L54 7" />
                        <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                        <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                        <circle cx="50" cy="50" r="5" />
                        <circle cx="50" cy="50" r="1.5" />
                        <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                        <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                        <path d="M35 53 L20 60 M65 53 L80 60" />
                      </svg>
                    </div>
                    <div>

                      <h3 className="font-serif text-lg sm:text-xl font-light text-white tracking-tight leading-snug mb-3 text-center">
                        Apoyo y Ofrendas
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed text-center">
                        Apoya el sostenimiento de nuestro templo parroquial y las obras de caridad de Cáritas local a través de diezmos, ofrendas dominicales o donaciones virtuales.
                      </p>
                    </div>
                    <Link href="#contacto" className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-[#FFFDF9] hover:bg-white transition-all rounded-xl shadow-sm hover:scale-102 active:scale-95 duration-200 mt-2">
                      Cómo Ayudar
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Information & Schedules Section (Estilo Spa Menu) */}
      <section id="horarios" className="py-20 sm:py-28 bg-[#FFFDF9] border-t border-b border-[#EADCB9]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#2B2B2B] uppercase">
              Horarios y Atención
            </h2>
            <p className="mt-4 text-[#8C7A6B] font-light max-w-2xl mx-auto text-sm sm:text-base">
              Conoce nuestros horarios de celebraciones eucarísticas, atención de secretaría parroquial y disponibilidad para confesiones. Estamos para servirte y acompañarte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Santas Misas */}
            <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EADCB9]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6 border-b border-[#E0E0E0]/60 pb-4">
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2B2B2B] uppercase max-w-[150px] leading-tight">
                    Santas Misas
                  </h3>
                  <svg className="w-12 h-12 text-[#9A8F82] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-xs text-[#8C7A6B] font-light leading-relaxed mb-6">
                  Participa de nuestras celebraciones eucarísticas diarias y dominicales. Un encuentro fraterno en torno a la mesa del Señor.
                </p>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Lunes a Sábado</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#EADCB9]/40 text-[#5C554B] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      7:00 AM • 6:00 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Domingo</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#EADCB9]/40 text-[#5C554B] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      8 AM • 11 AM • 7 PM
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                <Link href="/misas/nueva" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#80385e] rounded-full text-white text-xs font-bold uppercase tracking-wider hover:bg-[#964a75] transition-colors shadow-sm">
                  Solicitar Misa
                </Link>
              </div>
            </div>

            {/* Card 2: Despacho Parroquial */}
            <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EADCB9]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6 border-b border-[#E0E0E0]/60 pb-4">
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2B2B2B] uppercase max-w-[150px] leading-tight">
                    Despacho Parroquial
                  </h3>
                  <svg className="w-12 h-12 text-[#9A8F82] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-xs text-[#8C7A6B] font-light leading-relaxed mb-6">
                  Acércate a secretaría para trámites de sacramentos, expedición de partidas, constancias y reservas especiales.
                </p>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Mar a Sáb (Mñn)</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#EADCB9]/40 text-[#5C554B] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      9 AM - 1 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Mar a Sáb (Tde)</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#EADCB9]/40 text-[#5C554B] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      3 PM - 7 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Domingos</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#EADCB9]/40 text-[#5C554B] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      9 AM - 1 PM
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                <Link href="#contacto" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#80385e] rounded-full text-white text-xs font-bold uppercase tracking-wider hover:bg-[#964a75] transition-colors shadow-sm">
                  Ver Ubicación
                </Link>
              </div>
            </div>

            {/* Card 3: Confesiones */}
            <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EADCB9]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6 border-b border-[#E0E0E0]/60 pb-4">
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2B2B2B] uppercase max-w-[150px] leading-tight">
                    Confesiones
                  </h3>
                  <svg className="w-12 h-12 text-[#9A8F82] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-xs text-[#8C7A6B] font-light leading-relaxed mb-6">
                  Acércate al sacramento de la reconciliación y recibe dirección espiritual. Los sacerdotes confiesan en el templo.
                </p>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Lunes a Domingo</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#EADCB9]/40 text-[#5C554B] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      Antes de misa
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-serif text-[11px] tracking-wider uppercase text-[#2B2B2B]">Dir. Espiritual</span>
                    </div>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                    <span className="bg-[#80385e] text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0">
                      Previa Cita
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                <Link href="tel:+51987654321" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#80385e] rounded-full text-white text-xs font-bold uppercase tracking-wider hover:bg-[#964a75] transition-colors shadow-sm">
                  Llamar
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section (Preguntas Frecuentes - Accordion details) */}
      <section id="faq" className="py-20 sm:py-28 bg-[#F9F5EC] border-t border-b border-[#EADCB9]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#2B2B2B] uppercase">
              Preguntas Frecuentes
            </h2>
            <p className="mt-4 text-[#8C7A6B] font-light max-w-2xl mx-auto text-sm sm:text-base">
              Encuentra respuestas rápidas sobre cómo funciona la validación del sistema y los requisitos para sacramentos.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ 1 */}
            <details className="group bg-[#FFFDF9] rounded-3xl border border-[#EADCB9]/40 shadow-sm p-6 sm:p-8 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all duration-300 hover:shadow-md">
              <summary className="flex items-center justify-between font-serif font-medium text-[#2B2B2B] text-lg sm:text-xl focus:outline-none">
                <span className="pr-4">¿Cómo registro el pago de mi ofrenda para una intención de Misa?</span>
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-[#9A8F82] opacity-70">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-sm sm:text-base text-[#8C7A6B] font-light leading-relaxed border-t border-[#D3CEBA]/50 pt-6">
                <p>
                  Al llenar el formulario de <strong>Solicitud de Misa</strong>, el sistema te mostrará el código QR oficial de Yape de la parroquia. 
                  Una vez realices la transferencia, ingresa el <strong>nro de operación (un código de 3 dígitos)</strong> en la casilla correspondiente. 
                  Nuestra administración revisará este código contra el verificador de Yape móvil para confirmar tu solicitud.
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-[#FFFDF9] rounded-3xl border border-[#EADCB9]/40 shadow-sm p-6 sm:p-8 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all duration-300 hover:shadow-md">
              <summary className="flex items-center justify-between font-serif font-medium text-[#2B2B2B] text-lg sm:text-xl focus:outline-none">
                <span className="pr-4">¿Qué documentos necesito para realizar un trámite de Bautizo?</span>
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-[#9A8F82] opacity-70">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-sm sm:text-base text-[#8C7A6B] font-light leading-relaxed border-t border-[#D3CEBA]/50 pt-6">
                <p>
                  Para registrar un Bautismo en línea necesitarás tener a la mano imágenes legibles o PDFs de:
                </p>
                <ul className="list-none mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#80385e] mt-1">•</span>
                    <span>Acta de nacimiento del bautizando.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#80385e] mt-1">•</span>
                    <span>DNI de los padres.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#80385e] mt-1">•</span>
                    <span>DNI de los padrinos (y constancia de Confirmación o Matrimonio religioso de los mismos, según las normas de la Iglesia).</span>
                  </li>
                </ul>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-[#FFFDF9] rounded-3xl border border-[#EADCB9]/40 shadow-sm p-6 sm:p-8 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all duration-300 hover:shadow-md">
              <summary className="flex items-center justify-between font-serif font-medium text-[#2B2B2B] text-lg sm:text-xl focus:outline-none">
                <span className="pr-4">¿Cómo sé si mi solicitud de sacramento ha sido aceptada?</span>
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-[#9A8F82] opacity-70">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-sm sm:text-base text-[#8C7A6B] font-light leading-relaxed border-t border-[#D3CEBA]/50 pt-6">
                <p>
                  Una vez que envíes tu solicitud de bautizo o intención de misa, la secretaría revisa la validez de los datos y documentos subidos. 
                  En un plazo máximo de <strong>24 a 48 horas</strong>, recibirás un mensaje de <strong>confirmación directa vía WhatsApp</strong> al número de celular que registraste. También te llamaremos en caso falte algún dato.
                </p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-[#FFFDF9] rounded-3xl border border-[#EADCB9]/40 shadow-sm p-6 sm:p-8 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all duration-300 hover:shadow-md">
              <summary className="flex items-center justify-between font-serif font-medium text-[#2B2B2B] text-lg sm:text-xl focus:outline-none">
                <span className="pr-4">¿Las charlas pre-bautismales son virtuales o presenciales?</span>
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-[#9A8F82] opacity-70">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-sm sm:text-base text-[#8C7A6B] font-light leading-relaxed border-t border-[#D3CEBA]/50 pt-6">
                <p>
                  Actualmente, las charlas pre-bautismales se dictan de manera <strong>presencial</strong> los segundos y cuartos sábados de cada mes a las 4:00 PM en el salón parroquial. Durante el registro en línea podrás ver las fechas y registrar la asistencia de los padres y padrinos.
                </p>
              </div>
            </details>

          </div>
        </div>
      </section>

      {/* Footer & Contact Section */}
      <footer id="contacto" className="bg-[#0f172a] text-slate-400 py-16 sm:py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
            
            {/* Branding Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/60 text-amber-400">
                  <LogoIglesia className="w-6.5 h-6.5 shrink-0" />
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Ntra. Sra. del Patrocinio
                </span>
              </div>
              <p className="text-sm font-light text-slate-400 leading-relaxed max-w-sm mb-6">
                Uniendo a la comunidad en la oración y el servicio mutuo. Digitalizando la atención litúrgica y sacramental para mayor comodidad de nuestras familias.
              </p>
              <div className="flex gap-3.5">
                {/* Simulated Social Icons with visual indicators */}
                <span className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 flex items-center justify-center hover:text-white border border-slate-700/60 cursor-pointer transition-colors text-sm font-bold">
                  f
                </span>
                <span className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 flex items-center justify-center hover:text-white border border-slate-700/60 cursor-pointer transition-colors text-sm font-bold">
                  ig
                </span>
                <span className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 flex items-center justify-center hover:text-white border border-slate-700/60 cursor-pointer transition-colors text-sm font-bold">
                  yt
                </span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">
                Enlaces Útiles
              </h4>
              <ul className="space-y-4 text-sm font-light">
                <li>
                  <Link href="/" className="hover:text-amber-400 transition-colors">
                    Página de Inicio
                  </Link>
                </li>
                <li>
                  <Link href="#servicios" className="hover:text-amber-400 transition-colors">
                    Bautizos e Intenciones
                  </Link>
                </li>
                <li>
                  <Link href="#horarios" className="hover:text-amber-400 transition-colors">
                    Misas y Oficinas
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-amber-400 transition-colors">
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Details Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">
                Datos de Contacto
              </h4>
              <ul className="space-y-4 text-sm font-light">
                <li className="flex gap-3 items-start">
                  <svg
                    className="w-5 h-5 text-amber-450 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    Av. Del Patrocinio 456,
                    <br />
                    Lima, Perú
                  </span>
                </li>
                <li className="flex gap-3 items-center">
                  <svg
                    className="w-5 h-5 text-amber-450 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <Link href="tel:+51987654321" className="hover:text-white transition-colors">
                    +51 987 654 321
                  </Link>
                </li>
                <li className="flex gap-3 items-center">
                  <svg
                    className="w-5 h-5 text-amber-450 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <Link href="mailto:contacto@parroquiapatrocinio.org" className="hover:text-white transition-colors">
                    contacto@parroquiapatrocinio.org
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              &copy; {new Date().getFullYear()} Parroquia Nuestra Señora del Patrocinio. Todos los derechos reservados.
            </p>
            <p className="font-light">
              Diseño premium accesible, optimizado para todas las edades.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


