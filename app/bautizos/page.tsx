"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type RequirementSection = {
  title: string;
  icon: React.ReactNode;
  items: string[];
};

type SacramentInfo = {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  talkInfo: {
    title: string;
    description: string;
    frequency: string;
    schedule: string;
    note: string;
  };
  requirements: RequirementSection[];
};

const SACRAMENTOS_DATA: Record<string, SacramentInfo> = {
  bautizo: {
    title: "Sacramento del Bautismo",
    subtitle: "El nacimiento a la vida en Cristo",
    description: "El bautismo es la puerta de la vida espiritual y el acceso a los demás sacramentos. Conozca las pautas y documentos requeridos.",
    price: "50.00",
    talkInfo: {
      title: "Charlas Pre-Bautismales",
      description: "Padres y padrinos deben asistir obligatoriamente a la charla de formación.",
      frequency: "Tercer Sábado de cada mes",
      schedule: "05:00 PM - Salón Parroquial (Presencial)",
      note: "Debe inscribirse a las charlas presencialmente en la oficina parroquial."
    },
    requirements: [
      {
        title: "1. Del Bautizado",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        items: [
          "Ser menor de 7 años (para niños mayores se requiere catequesis de preparación especial).",
          "Copia simple del DNI del niño/a (o partida de nacimiento).",
          "Copia del Acta de Nacimiento expedida por RENIEC."
        ]
      },
      {
        title: "2. De los Padres",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        items: [
          "Copia legible del DNI de ambos padres (o carnet de extranjería/pasaporte).",
          "Participación obligatoria en la Charla Pre-Bautismal.",
          "Deseo y compromiso sincero de educar al niño en la fe católica."
        ]
      },
      {
        title: "3. De los Padrinos",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        items: [
          "Elegir un padrino, una madrina, o un padrino y una madrina conjuntamente.",
          "Ser mayor de 16 años y haber recibido los tres sacramentos de la iniciación: Bautizo, Primera Comunión y Confirmación (presentar constancias).",
          "Si son casados, deben estar casados bajo el Matrimonio Católico (presentar Acta de Matrimonio Religioso).",
          "No vivir en unión libre ni convivir sin matrimonio eclesiástico.",
          "Asistir de forma obligatoria a la Charla Pre-Bautismal."
        ]
      }
    ]
  },
  matrimonio: {
    title: "Sacramento del Matrimonio",
    subtitle: "El lazo del amor consagrado",
    description: "La alianza matrimonial por la que un varón y una mujer constituyen una íntima comunidad de vida y amor. Prepare su expediente con anticipación.",
    price: "80.00",
    talkInfo: {
      title: "Charlas Prematrimoniales",
      description: "Ambos novios deben asistir obligatoriamente a las charlas de preparación conyugal.",
      frequency: "Primer Fin de Semana del mes",
      schedule: "06:00 PM - Salón Parroquial (Sábado y Domingo)",
      note: "Coordinar la inscripción a charlas al abrir el pliego matrimonial."
    },
    requirements: [
      {
        title: "1. De los Contrayentes (Novios)",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        items: [
          "Copia simple del DNI legible de ambos novios (vigentes y con dirección actualizada).",
          "Partida de Bautizo original legalizada de cada uno (con vigencia no mayor a 6 meses).",
          "Partida o Constancia de Confirmación original o copia legalizada de ambos.",
          "Partida de Nacimiento expedida por RENIEC (original de cada uno)."
        ]
      },
      {
        title: "2. De los Padrinos de Boda",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        items: [
          "Copia de DNI de los padrinos elegidos.",
          "Partida de Matrimonio Religioso de los padrinos (deben estar debidamente casados por la Iglesia Católica)."
        ]
      },
      {
        title: "3. Testigos y Expediente",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        items: [
          "Presentación de 4 Testigos (2 para el novio y 2 para la novia) que los conozcan al menos por 3 años.",
          "Los testigos no deben ser familiares directos y deben presentar copia de DNI vigente.",
          "Participación obligatoria en las Charlas Prematrimoniales.",
          "Apertura del expediente matrimonial (pliego) con un mínimo de 3 meses de anticipación."
        ]
      }
    ]
  },
  comunion: {
    title: "Primera Comunión",
    subtitle: "El encuentro con la Sagrada Eucaristía",
    description: "La primera recepción de la Eucaristía, alimento espiritual de la Iglesia. Requiere preparación catequética y espiritual familiar.",
    price: "30.00",
    talkInfo: {
      title: "Catequesis Eucarística",
      description: "Sesiones semanales formativas dirigidas a niños y charlas periódicas de apoyo a padres.",
      frequency: "Todos los Domingos (Durante el período escolar)",
      schedule: "09:00 AM - Aulas de Catequesis",
      note: "Las inscripciones se inician en marzo de cada año."
    },
    requirements: [
      {
        title: "1. Del Comulgante",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        items: [
          "Tener edad recomendada de 8 a 10 años (cursar al menos el 3er grado de primaria).",
          "Copia simple del DNI del niño/a.",
          "Constancia o Partida de Bautismo original (indispensable para validar su iniciación)."
        ]
      },
      {
        title: "2. De los Padres y Formación",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        items: [
          "Copia del DNI del padre y la madre.",
          "Participación en los retiros y talleres de padres organizados durante la catequesis.",
          "Compromiso de asistir en familia a la Misa dominical."
        ]
      }
    ]
  },
  confirmacion: {
    title: "Confirmación",
    subtitle: "El sello del Espíritu Santo",
    description: "Fortalece la gracia bautismal y nos une más íntimamente a la Iglesia. Nos capacita para ser testigos de la fe.",
    price: "50.00",
    talkInfo: {
      title: "Formación de Confirmación",
      description: "Preparación doctrinal e iniciación apostólica en grupos de jóvenes.",
      frequency: "Todos los Sábados",
      schedule: "04:00 PM - Salón Juvenil",
      note: "Inicio de ciclo anual en el mes de abril."
    },
    requirements: [
      {
        title: "1. Del Confirmando",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        items: [
          "Tener edad recomendada de 14 a 17 años (jóvenes) o preparación especial para adultos.",
          "Copia legible de DNI vigente.",
          "Constancia o Fe de Bautismo original legalizada."
        ]
      },
      {
        title: "2. Del Padrino o Madrina",
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        items: [
          "Elegir un solo padrino o una sola madrina.",
          "Debe ser católico/a confirmado/a, mayor de 16 años y llevar una vida congruente con la fe.",
          "Si es casado, debe estar casado por la Iglesia Católica (presentar constancia).",
          "No ser el padre o la madre del confirmando."
        ]
      }
    ]
  }
};

export default function RequisitosSacramentosPage() {
  const [activeTab, setActiveTab] = useState<"bautizo" | "matrimonio" | "comunion" | "confirmacion">("bautizo");
  const sac = SACRAMENTOS_DATA[activeTab];

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 pb-24 font-sans selection:bg-amber-100">
      <Header />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-6 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-800 tracking-tight leading-tight">
          Requisitos de los Sacramentos
        </h1>
        <p className="text-sm sm:text-base text-stone-500 mt-4 font-light max-w-xl mx-auto leading-relaxed">
          La Parroquia facilita los expedientes eclesiásticos. Seleccione el sacramento para conocer la documentación, charlas y testigos requeridos.
        </p>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div className="max-w-md mx-auto px-4 mb-10">
        <div className="bg-stone-100/80 border border-stone-200/60 p-1.5 rounded-2xl flex justify-between gap-1.5">
          {[
            { id: "bautizo", label: "Bautizo 🕊️" },
            { id: "matrimonio", label: "Matrimonio 💍" },
            { id: "comunion", label: "Comunión" },
            { id: "confirmacion", label: "Confirmación" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 text-[11px] font-bold uppercase tracking-wider py-2.5 px-2 text-center rounded-xl transition-all cursor-pointer select-none
                  ${isActive 
                    ? "bg-[#80385e] text-white shadow-sm" 
                    : "text-[#7A6B58] hover:text-[#80385e] hover:bg-white/40"
                  }
                `}
              >
                {tab.label.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido en Dos Columnas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Columna Izquierda: Requisitos Detallados */}
        <div className="lg:col-span-8">
          <div className="bg-[#FCFAF8] border border-[#F2EFE9] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            
            {/* Header del Sacramento (Titulo + LineArt) */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="font-serif text-2xl sm:text-3xl text-[#3A332B] uppercase tracking-widest leading-tight">
                  REQUISITOS <br /> {activeTab === 'bautizo' ? 'DE BAUTIZO' : activeTab === 'matrimonio' ? 'DE MATRIMONIO' : activeTab === 'comunion' ? 'DE COMUNIÓN' : 'DE CONFIRMACIÓN'}
                </h2>
              </div>
              <div className="shrink-0 ml-4 opacity-70">
                {/* SVG Ilustración Line Art */}
                {activeTab === 'bautizo' && (
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#8C7A6B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Pila bautismal minimalista */}
                    <path d="M20 35 L80 35 C80 55 65 65 50 65 C35 65 20 55 20 35 Z" />
                    <path d="M42 65 L40 85 M58 65 L60 85" />
                    <path d="M30 85 L70 85 L75 95 L25 95 Z" />
                    <path d="M50 15 L50 25 M45 20 L55 20" />
                    <path d="M35 35 Q 50 50 65 35" strokeDasharray="2 4" />
                  </svg>
                )}
                {activeTab === 'matrimonio' && (
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#8C7A6B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Anillos entrelazados minimalista */}
                    <circle cx="40" cy="50" r="20" />
                    <circle cx="60" cy="50" r="20" />
                    <path d="M40 30 L45 20 L55 20 L60 30" strokeLinejoin="round" />
                    <circle cx="50" cy="22" r="2" fill="currentColor" stroke="none" />
                  </svg>
                )}
                {activeTab === 'comunion' && (
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#8C7A6B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Cáliz y hostia elegantes */}
                    {/* Hostia radiante */}
                    <circle cx="50" cy="30" r="16" />
                    <path d="M45 30 L55 30 M50 25 L50 35" />
                    {/* Copa curvada */}
                    <path d="M28 45 L72 45 C72 65 58 75 50 75 C42 75 28 65 28 45 Z" />
                    {/* Tallo del cáliz */}
                    <path d="M50 75 L50 92" />
                    {/* Nudo */}
                    <circle cx="50" cy="82" r="3" fill="currentColor" stroke="none" />
                    {/* Base elegante */}
                    <path d="M35 95 L65 95 C 65 95 60 92 50 92 C 40 92 35 95 35 95 Z" fill="currentColor" stroke="none" />
                  </svg>
                )}
                {activeTab === 'confirmacion' && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <img src="/images/gold-dove.png" alt="Paloma de Confirmación" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-[#EADCB9]/60 mb-10" />

            <div className="space-y-8">
              {sac.requirements.map((sec, idx) => (
                <div key={idx} className="group">
                  {/* Título de la sección como el Spa Menu */}
                  <div className="flex items-end gap-3 mb-4">
                    <h3 className="font-serif text-[13px] sm:text-[14px] text-[#3A332B] uppercase tracking-widest whitespace-nowrap">
                      {sec.title}
                    </h3>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                    <div className="shrink-0 pb-0.5">
                       <span className="bg-[#E4E9E1] text-[#5A6B55] text-[9px] font-bold px-3 py-1.5 rounded-full tracking-wider">
                         OBLIGATORIO
                       </span>
                    </div>
                  </div>
                  
                  {/* Lista de items */}
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

        {/* Columna Derecha: Charlas e Información de Reserva */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Tarjeta de Charlas */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 border-b border-stone-100 pb-2">
              {sac.talkInfo.title}
            </h3>
            <p className="text-[11px] text-stone-400 font-light mt-2 leading-relaxed">
              {sac.talkInfo.description}
            </p>
            <div className="mt-4 space-y-3">
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Frecuencia</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  {sac.talkInfo.frequency}
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5">
                <div className="text-xs font-bold text-stone-700">Horario y Lugar</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">
                  {sac.talkInfo.schedule}
                </div>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-amber-700 font-medium bg-amber-50/50 border border-amber-200/50 rounded-xl p-3">
              💡 Nota: {sac.talkInfo.note}
            </div>
          </div>

          {/* Llamado a la Acción de Reservación Centralizada */}
          <div className="bg-gradient-to-r from-[#80385e] via-[#a35b80] to-[#964a75] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#964a75] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
            </div>
            
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#f5d0e3] block mb-2 relative z-10">
              ¿Listo para agendar?
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide mb-3 text-white relative z-10">
              Separar Fecha
            </h3>
            <p className="text-xs text-[#ebd5e1] font-light leading-relaxed mb-6 relative z-10 pr-4">
              Una vez que cuente con todos los requisitos listos, proceda al formulario de reservas para agendar el día y la hora de su celebración.
            </p>
            <Link
              href="/misas/nueva"
              className="w-full inline-flex items-center justify-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#80385e] bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl shadow-lg shadow-black/20 relative z-10"
            >
              Reservar {sac.title.replace("Sacramento del ", "")} &rarr;
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
