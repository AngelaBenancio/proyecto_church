"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type RequirementSection = {
  title: string;
  icon: React.ReactNode;
  items: string[];
};

type CatequesisInfo = {
  title: string;
  subtitle: string;
  description: string;
  ageRange: string;
  duration: string;
  scheduleInfo: {
    title: string;
    description: string;
    frequency: string;
    schedule: string;
    coordinator: string;
  };
  details: RequirementSection[];
};

const CATEQUESIS_DATA: Record<string, CatequesisInfo> = {
  comunion_confirmacion: {
    title: "Comunión y Confirmación",
    subtitle: "Iniciación Cristiana para Niños y Jóvenes",
    description: "Programas de formación y preparación sacramental dirigidos a los niños que desean recibir su Primera Comunión (Catequesis Familiar) y a los jóvenes que desean confirmar su fe (Catequesis de Confirmación) en nuestra parroquia.",
    ageRange: "Niños: 8 a 10 años | Jóvenes: 14 a 17 años",
    duration: "Comunión: 2 años | Confirmación: 1 año",
    scheduleInfo: {
      title: "Horarios y Matrículas",
      description: "Las clases de preparación se llevan a cabo los fines de semana en los salones parroquiales.",
      frequency: "Sábados (Jóvenes) / Domingos (Niños)",
      schedule: "Comunión: Dom 09:00 AM | Confirmación: Sáb 04:00 PM",
      coordinator: "Información e Inscripciones en Secretaría Parroquial"
    },
    details: [
      {
        title: "1. Horarios y Duración de Clases",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        items: [
          "Primera Comunión (Catequesis Familiar): Todos los Domingos de 09:00 AM a 11:30 AM (incluye asistencia a la Santa Misa de niños de las 10:00 AM). Duración de 2 años.",
          "Confirmación (Catequesis de Jóvenes): Todos los Sábados de 04:00 PM a 06:00 PM en el Salón Parroquial (incluye jornadas dinámicas, formación doctrinal y retiros). Duración de 1 año."
        ]
      },
      {
        title: "2. Proceso y Horarios de Inscripción",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        items: [
          "Periodo de Inscripción: Las matrículas se realizan durante los meses de Febrero y Marzo de cada año.",
          "Horario de Atención: De Martes a Sábado en la oficina de secretaría (Mañanas: 09:00 AM - 01:00 PM | Tardes: 04:00 PM - 07:00 PM).",
          "Aporte de Inscripción: Ofrenda única de S/. 30.00 (para Comunión) y S/. 40.00 (para Confirmación) destinada a los libros de texto y materiales didácticos."
        ]
      },
      {
        title: "3. Requisitos para la Matrícula",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        items: [
          "Copia legible del DNI vigente del niño, niña o joven participante.",
          "Constancia o Fe de Bautizo original expedida por la parroquia donde fue bautizado (indispensable para convalidar el expediente).",
          "Presencia del padre, madre o tutor legal al momento de la inscripción presencial para la firma del compromiso de acompañamiento familiar."
        ]
      }
    ]
  },
  adultos: {
    title: "Catequesis de Adultos",
    subtitle: "Preparación sacramental para mayores de 18 años",
    description: "Pensado para personas de 18 años a más que no completaron sus sacramentos de iniciación (Bautizo, Primera Comunión o Confirmación) o que desean conocer más a fondo la fe católica para integrarse activamente en la Iglesia.",
    ageRange: "18 años en adelante",
    duration: "6 Meses (Ciclos semestrales)",
    scheduleInfo: {
      title: "Horarios y Coordinación",
      description: "Preparación ágil y profunda que respeta los tiempos del adulto trabajador.",
      frequency: "Todos los Viernes",
      schedule: "07:30 PM a 09:00 PM (Salón San José)",
      coordinator: "Coordinador: Diác. Andrés Salazar"
    },
    details: [
      {
        title: "1. Requisitos y Documentación",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        items: [
          "Copia del DNI legible del participante.",
          "Partidas de bautizo o primera comunión anteriores si las tuviese (para validar los sacramentos que le falta recibir).",
          "Compromiso firmado de asistencia activa y puntual a las sesiones formativas los días viernes."
        ]
      },
      {
        title: "2. Inscripciones y Ofrenda",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        items: [
          "Inscripción Permanente: Ciclos formativos semestrales que inician en Abril y Setiembre de cada año.",
          "Aporte de Matrícula: Ofrenda única de S/. 20.00 destinada a folletos y materiales de estudio.",
          "Matrícula Presencial: Debe realizarse directamente en la secretaría de la Parroquia."
        ]
      }
    ]
  },
  grupos: {
    title: "Grupos Parroquiales (Comunidad)",
    subtitle: "Espacios de comunión, apostolado y servicio",
    description: "Nuestra parroquia cuenta con diversas comunidades activas donde los fieles pueden poner sus talentos al servicio del prójimo y crecer juntos en la fe compartida.",
    ageRange: "Feligreses de todas las edades",
    duration: "Permanente",
    scheduleInfo: {
      title: "Participación Libre",
      description: "Puedes contactar directamente a los coordinadores de cada grupo o acercarte en sus horarios de reunión para participar.",
      frequency: "Frecuencia semanal o quincenal",
      schedule: "Varios horarios (ver detalle en secretaría)",
      coordinator: "Información general en Secretaría Parroquial"
    },
    details: [
      {
        title: "1. Pastorales y Ministerios Activos",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        items: [
          "Coro Parroquial: Acompañamiento musical en las liturgias y misas dominicales.",
          "Grupo de Acólitos (Monaguillos): Servicio del altar dirigido a niños y adolescentes.",
          "Cáritas Parroquial (Pastoral Social): Campañas de ayuda fraterna, comedores y asistencia social.",
          "Hermandad y Cofradías: Cuidado de las devociones tradicionales de nuestra Parroquia."
        ]
      },
      {
        title: "2. Cómo Involucrarse",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        items: [
          "Acercarse después de las misas del domingo a conversar con los integrantes del grupo de su interés.",
          "Dejar sus datos en la oficina de secretaría expresando qué pastoral le gustaría integrar.",
          "Estar atento a los anuncios parroquiales al término de cada celebración litúrgica."
        ]
      }
    ]
  }
};

export default function CatequesisPage() {
  const [activeTab, setActiveTab] = useState<"comunion_confirmacion" | "adultos" | "grupos">("comunion_confirmacion");
  const program = CATEQUESIS_DATA[activeTab];

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 pb-24 font-sans selection:bg-amber-100">
      <Header />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-6 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-800 tracking-tight leading-tight">
          Comunidad y Catequesis
        </h1>
        <p className="text-sm sm:text-base text-stone-500 mt-4 font-light max-w-xl mx-auto leading-relaxed">
          Infórmate sobre nuestros programas de formación en la fe y los diversos grupos pastorales donde puedes participar en nuestra comunidad parroquial.
        </p>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div className="max-w-xl mx-auto px-4 mb-10">
        <div className="bg-stone-100/80 border border-stone-200/60 p-1.5 rounded-2xl flex justify-between gap-1.5 shadow-sm">
          {([
            { id: "comunion_confirmacion", label: "Comunión y Confirmación" },
            { id: "adultos", label: "Adultos" },
            { id: "grupos", label: "Grupos" }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-2.5 px-1 sm:px-2 text-center rounded-xl transition-all cursor-pointer select-none
                  ${isActive 
                    ? "bg-[#80385e] text-white shadow-sm" 
                    : "text-[#7A6B58] hover:text-[#80385e] hover:bg-white/40"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido en Dos Columnas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Columna Izquierda: Detalles del Programa */}
        <div className="lg:col-span-8">
          <div className="bg-[#FCFAF8] border border-[#F2EFE9] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            {/* Header del Programa */}
            <div className="flex justify-between items-start gap-6 mb-8">
              <div className="flex-grow">
                <h2 className="font-serif text-lg sm:text-2xl text-[#3A332B] uppercase tracking-widest leading-tight mb-4">
                  {program.title}
                </h2>
                <p className="text-xs sm:text-[13px] text-stone-500 font-light leading-relaxed border-l-2 border-[#80385e]/30 pl-4">
                  {program.description}
                </p>
              </div>

              <div className="shrink-0 opacity-75 hidden sm:block">
                {/* SVG Ilustración Line Art */}
                {activeTab === 'comunion_confirmacion' && (
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 text-[#8C7A6B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Biblia Cover */}
                    <path d="M37 25 H65 A2 2 0 0 1 67 27 V75 A2 2 0 0 1 65 77 H37 A4 4 0 0 1 33 73 V29 A4 4 0 0 1 37 25 Z" />
                    {/* Hojas del borde inferior y derecho */}
                    <path d="M67 30 H70 V74 H67" />
                    <path d="M37 77 V80 H68 V77" />
                    {/* Detalles de páginas */}
                    <path d="M67 40 H70" />
                    <path d="M67 50 H70" />
                    <path d="M67 60 H70" />
                    {/* Listón / Separador */}
                    <path d="M47 77 V87 L51 84 L55 87 V77 Z" fill="currentColor" opacity="0.3" />
                    <path d="M47 77 V87 L51 84 L55 87 V77 Z" />
                    {/* Cruz en la portada de la Biblia */}
                    <path d="M49 37 H53 V57 H49 Z" fill="currentColor" opacity="0.2" />
                    <path d="M49 37 H53 V57 H49 Z" />
                    <path d="M44 43 H58 V47 H44 Z" fill="currentColor" opacity="0.2" />
                    <path d="M44 43 H58 V47 H44 Z" />
                  </svg>
                )}
                {activeTab === 'adultos' && (
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 text-[#8C7A6B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 25 C30 25 45 30 50 35 C55 30 70 25 88 25 L88 80 C70 80 55 85 50 90 C45 85 30 80 12 80 Z" />
                    <path d="M50 35 L50 90" />
                  </svg>
                )}
                {activeTab === 'grupos' && (
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 text-[#8C7A6B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="35" cy="40" r="8" />
                    <circle cx="65" cy="40" r="8" />
                    <circle cx="50" cy="30" r="10" />
                    <path d="M20 85 C20 65 35 65 35 65" />
                    <path d="M80 85 C80 65 65 65 65 65" />
                    <path d="M30 85 C30 65 70 65 70 85" />
                  </svg>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-[#EADCB9]/60 mb-10" />

            <div className="space-y-8">
              {program.details.map((sec, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-end gap-3 mb-4">
                    <h3 className="font-serif text-[13px] sm:text-[14px] text-[#3A332B] uppercase tracking-widest whitespace-nowrap">
                      {sec.title}
                    </h3>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                  </div>
                  
                  <ul className="space-y-3.5 pl-1">
                    {sec.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-xs sm:text-[13px] text-[#7A6B58] font-light leading-relaxed">
                        <span className="text-[#D3CEBA] text-[16px] leading-none mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
          </div>
        </div>

        {/* Columna Derecha: Información de Horarios y Contacto */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Tarjeta de Horarios */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 border-b border-stone-100 pb-2">
              {program.scheduleInfo.title}
            </h3>
            <p className="text-[11px] text-stone-400 font-light mt-2 leading-relaxed">
              {program.scheduleInfo.description}
            </p>
            <div className="mt-4 space-y-3">
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Frecuencia</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  {program.scheduleInfo.frequency}
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Horario y Lugar</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  {program.scheduleInfo.schedule}
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Duración Estimada</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  {program.duration}
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Rango de Edad</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  {program.ageRange}
                </div>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-stone-600 font-medium bg-stone-50 border border-stone-200/50 rounded-xl p-3">
              💡 {program.scheduleInfo.coordinator}
            </div>
          </div>

          {/* Tarjeta de Acción / Registro */}
          <div className="bg-gradient-to-r from-[#80385e] via-[#a35b80] to-[#964a75] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#964a75] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
            </div>
            
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#f5d0e3] block mb-2 relative z-10">
              ¿Deseas inscribirte?
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide mb-3 text-white relative z-10">
              Inscripciones Abiertas
            </h3>
            <p className="text-xs text-[#ebd5e1] font-light leading-relaxed mb-6 relative z-10 pr-4">
              Para formalizar la inscripción a cualquiera de las catequesis o integrarte a un grupo, puedes acercarte a la Secretaría Parroquial durante los horarios de atención administrativa.
            </p>
            <Link
              href="/#horarios"
              className="w-full inline-flex items-center justify-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl shadow-lg shadow-black/20 relative z-10"
            >
              Ver Horarios de Atención &rarr;
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
