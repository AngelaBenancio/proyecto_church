"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";

type HistoryPeriod = {
  year: string;
  title: string;
  description: string;
  details: string[];
  image: string;
};

const HISTORIA_DATA: HistoryPeriod[] = [
  {
    year: "Siglo XIX",
    title: "La Capilla Original",
    description: "Antes de convertirse en el templo actual, el espacio estaba ocupado por una pequeña capilla originalmente dedicada al apóstol Santiago. Esta primera construcción sirvió como refugio espiritual para los fieles de la zona durante décadas.",
    details: [
      "Establecimiento de los primeros cimientos de fe local en la zona.",
      "Dedicación inicial al apóstol Santiago como protector y patrón primigenio de la capilla.",
      "Estructura rústica que albergó las celebraciones y la oración comunitaria comunal durante varias décadas."
    ],
    image: "/historia_capilla.png"
  },
  {
    year: "1826",
    title: "Reconstrucción y Nueva Advocación",
    description: "La antigua capilla fue sometida a una reedificación. En este periodo, las autoridades eclesiásticas decidieron cambiar la dedicación original y consagraron el recinto a la Madre de Dios, bajo la advocación de Nuestra Señora del Patrocinio.",
    details: [
      "Reedificación arquitectónica completa de la estructura física del recinto sagrado.",
      "Cambio litúrgico oficial de patrocinio del apóstol Santiago a la Madre de Dios.",
      "Consagración solemne bajo la nueva advocación de Nuestra Señora del Patrocinio."
    ],
    image: "/historia_altar.png"
  },
  {
    year: "1964",
    title: "Elevación a Parroquia",
    description: "Debido a la división de parroquias cercanas y para atender mejor a los feligreses, la iglesia dejó de ser una capilla. Mediante un decreto episcopal emitido por Monseñor Ignacio Arbulú Pineda (entonces Obispo de Huánuco), se creó oficialmente la Parroquia de Nuestra Señora del Patrocinio.",
    details: [
      "Decreto episcopal formalizado para descentralizar y optimizar la administración sacramental de la zona.",
      "Erigida canónicamente bajo el ministerio de Monseñor Ignacio Arbulú Pineda, Obispo de Huánuco.",
      "Independencia pastoral completa para la atención directa de bautizos, misas, matrimonios y catequesis."
    ],
    image: "/historia_parroquia.png"
  }
];

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (currentRef) {
            observer.unobserve(currentRef); // Animates only once
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px"
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function HistoriaPage() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 pb-24 font-sans selection:bg-amber-100">
      <Header />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-6 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-800 tracking-tight leading-tight">
          Nuestra Historia
        </h1>
        <p className="text-sm sm:text-base text-stone-500 mt-4 font-light max-w-xl mx-auto leading-relaxed">
          Conoce los orígenes históricos y el camino de fe de la Parroquia Nuestra Señora del Patrocinio a través de los siglos.
        </p>
      </div>

      {/* Contenido en Dos Columnas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-10">
        
        {/* Columna Izquierda: Línea de Tiempo Histórica */}
        <div className="lg:col-span-8">
          <div className="bg-[#FCFAF8] border border-[#F2EFE9] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            
            <div className="space-y-16 relative before:absolute before:inset-y-0 before:left-3 sm:before:left-6 before:w-0.5 before:bg-[#EADCB9]/60">
              {HISTORIA_DATA.map((period, idx) => (
                <ScrollReveal key={idx} className="relative pl-8 sm:pl-16 group">
                  {/* Marcador de año en la línea de tiempo */}
                  <div className="absolute left-0 sm:left-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2] border-[2px] border-[#80385e] flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#80385e] shadow-sm z-10 transition-transform duration-300 group-hover:scale-110">
                    ⛪
                  </div>
                  
                  {/* Estructura de Texto e Imagen */}
                  <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                    {/* Columna Texto */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-[#a35b80] uppercase tracking-widest leading-none">
                          {period.year}
                        </span>
                        <h2 className="font-serif text-lg sm:text-2xl text-[#3A332B] uppercase tracking-widest leading-tight">
                          {period.title}
                        </h2>
                        <p className="text-xs sm:text-[13px] text-stone-500 font-light leading-relaxed border-l-2 border-[#80385e]/30 pl-4 mt-2">
                          {period.description}
                        </p>
                      </div>

                      <ul className="space-y-3 pl-1">
                        {period.details.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3 text-xs sm:text-[13px] text-[#7A6B58] font-light leading-relaxed">
                            <span className="text-[#D3CEBA] text-[16px] leading-none mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Columna Foto Polaroid Taped */}
                    <div className="shrink-0 mx-auto md:mx-0 pt-4 pb-6 select-none">
                      <div className={`relative inline-block ${idx % 2 === 0 ? "rotate-2 hover:rotate-0" : "-rotate-2 hover:rotate-0"} transition-all duration-300 transform`}>
                        {/* Polaroid frame */}
                        <div className="bg-white p-3 pb-8 shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-stone-200/60 rounded-sm w-[200px] sm:w-[220px]">
                          <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden border border-stone-200/10">
                            <Image
                              src={period.image}
                              alt={period.title}
                              fill
                              className="object-cover grayscale-[10%] contrast-[95%] brightness-[98%]"
                            />
                            {/* Polaroid glossy sheen */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
                          </div>
                          <div className="mt-3.5 text-center font-serif text-stone-500 text-[10px] tracking-wider italic">
                            {period.title} - {period.year}
                          </div>
                        </div>
                        {/* Cinta adhesiva en la esquina superior izquierda */}
                        <div className="absolute -top-3.5 -left-3.5 w-14 h-5.5 bg-[#dcd5cc]/50 backdrop-blur-[0.5px] rotate-[-28deg] shadow-[0_1px_2px_rgba(0,0,0,0.04)] select-none pointer-events-none border-l border-r border-dashed border-[#b3a696]/20 after:absolute after:inset-y-0 after:right-0 after:w-[2px] after:bg-white/10" />
                      </div>
                    </div>
                  </div>

                </ScrollReveal>
              ))}
            </div>

          </div>
        </div>

        {/* Columna Derecha: Datos Históricos e Identidad */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Tarjeta de Datos Clave */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 border-b border-stone-100 pb-2">
              Ficha de la Parroquia
            </h3>
            <p className="text-[11px] text-stone-400 font-light mt-2 leading-relaxed">
              Datos de identidad oficial de nuestra institución eclesiástica.
            </p>
            <div className="relative w-full aspect-[16/10] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/60 shadow-sm mt-4">
              <Image
                src="/historia_fachada.jpg"
                alt="Fachada de la Parroquia Nuestra Señora del Patrocinio"
                fill
                className="object-cover scale-[1.08] origin-top-left"
              />
            </div>
            <div className="mt-4 space-y-3">
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Creación como Parroquia</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  1964 (Obispo Fundador: Monseñor Ignacio Arbulú Pineda)
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Reedificación Canónica</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  Año 1826 (Cambio de advocación a Nuestra Señora del Patrocinio)
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Diócesis de Jurisdicción</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  Diócesis de Huánuco
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Acción / Archivo */}
          <div className="bg-gradient-to-r from-[#80385e] via-[#a35b80] to-[#964a75] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#964a75] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#f5d0e3] block mb-2 relative z-10">
              ¿Tienes material histórico?
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide mb-3 text-white relative z-10">
              Colabora con el Archivo
            </h3>
            <p className="text-xs text-[#ebd5e1] font-light leading-relaxed mb-6 relative z-10 pr-4">
              Si posees fotografías, recortes periodísticos o documentos de valor sobre la erección o reedificación histórica de la parroquia, escríbenos para sumarlos a nuestro patrimonio.
            </p>
            <Link
              href="/#contacto"
              className="w-full inline-flex items-center justify-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl shadow-lg shadow-black/20 relative z-10"
            >
              Contactar Parroquia &rarr;
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
