"use client";

import Link from "next/link";

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

export default function Header({ className = "" }: { className?: string }) {
  return (
    <div className={`sticky top-0 z-50 w-full flex justify-center pt-4 px-2 sm:px-4 pointer-events-none ${className}`}>
      <header className="pointer-events-auto w-full max-w-5xl h-14 sm:h-16 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-full px-3 sm:px-6 flex items-center justify-between shadow-xl shadow-black/10">
        {/* Logo & Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-400 transition-all duration-300 shrink-0">
            <LogoIglesia className="w-4 h-4 sm:w-5.5 sm:h-5.5 shrink-0" />
          </div>
          <div>
            <span className="font-serif text-xs sm:text-sm font-bold tracking-tight text-white leading-none block uppercase tracking-wider">
              Patrocinio
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold">
          <Link
            href="/"
            className="text-white hover:text-amber-400 transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/historia"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Historia
          </Link>
          <Link
            href="/#servicios"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Servicios
          </Link>
          <Link
            href="/#horarios"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Horarios
          </Link>
          <Link
            href="/#faq"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Ayuda
          </Link>
        </nav>

        {/* Call to Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/#contacto"
            className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors py-2 px-3"
          >
            Contacto
          </Link>
          <Link
            href="/misas/nueva"
            className="inline-flex items-center justify-center px-3 py-1.5 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-950 bg-white hover:bg-slate-100 transition-all rounded-full shadow-sm hover:scale-105 active:scale-95 duration-200 whitespace-nowrap"
          >
            Solicitar Misa
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15 hover:scale-105 active:scale-95 duration-200 shrink-0"
            title="Acceso Sacerdote"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Link>
        </div>
      </header>
    </div>
  );
}
