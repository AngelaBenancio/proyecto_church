"use client";

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { actualizarEstadoIntencion, actualizarConfiguracion, agregarHorarioMisa, eliminarHorarioMisa } from '../../actions/misaActions';
import { logoutAdminAction } from '../../actions/authActions';

interface Intencion {
  id: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  tipoIntencion: string;
  nombreIntencion: string;
  fechaMisa: string;
  horaMisa: string;
  montoOfrenda: number;
  codigoYape: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  createdAt: string;
  updatedAt: string;
  fechaMisaStr: string; // YYYY-MM-DD
}

interface SystemConfig {
  habilitarComunion: boolean;
  habilitarConfirmacion: boolean;
  horariosMisa: string[];
}

interface DashboardClientProps {
  initialIntenciones: any[];
  initialConfig: SystemConfig;
}

export default function DashboardClient({ initialIntenciones, initialConfig }: DashboardClientProps) {
  const router = useRouter();
  const [intenciones, setIntenciones] = useState<Intencion[]>(initialIntenciones as Intencion[]);
  const [isPending, startTransition] = useTransition();

  // Estado del menú lateral y ajustes
  const [activeMenu, setActiveMenu] = useState<'requests' | 'settings'>('requests');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(initialConfig);
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Manejador para activar/desactivar sacramentos
  const handleToggleSacrament = async (sacramentKey: 'habilitar_comunion' | 'habilitar_confirmacion', currentValue: boolean) => {
    const newValue = !currentValue;
    const key = sacramentKey;
    const value = newValue ? "true" : "false";

    startTransition(async () => {
      const res = await actualizarConfiguracion(key, value);
      if (res.success) {
        setConfig(prev => ({
          ...prev,
          habilitarComunion: sacramentKey === 'habilitar_comunion' ? newValue : prev.habilitarComunion,
          habilitarConfirmacion: sacramentKey === 'habilitar_confirmacion' ? newValue : prev.habilitarConfirmacion,
        }));
        router.refresh();
      } else {
        alert(res.error || "No se pudo guardar la configuración.");
      }
    });
  };

  // Manejadores para horarios de misa
  const handleAddSchedule = () => {
    if (!newScheduleTime) return;
    
    let [hoursStr, minutesStr] = newScheduleTime.split(':');
    let hours = parseInt(hoursStr);
    let modifier = "AM";
    if (hours >= 12) {
      modifier = "PM";
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }
    const formattedHour = String(hours).padStart(2, '0');
    const timeFormatted = `${formattedHour}:${minutesStr} ${modifier}`;

    startTransition(async () => {
      const res = await agregarHorarioMisa(timeFormatted);
      if (res.success && res.horariosMisa) {
        setConfig(prev => ({ ...prev, horariosMisa: res.horariosMisa }));
        setNewScheduleTime("");
        setScheduleError(null);
        router.refresh();
      } else {
        setScheduleError(res.error || "Ocurrió un error al agregar el horario.");
      }
    });
  };

  const handleRemoveSchedule = (horario: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el horario ${horario}?`)) return;

    startTransition(async () => {
      const res = await eliminarHorarioMisa(horario);
      if (res.success && res.horariosMisa) {
        setConfig(prev => ({ ...prev, horariosMisa: res.horariosMisa }));
        router.refresh();
      } else {
        alert(res.error || "Ocurrió un error al eliminar el horario.");
      }
    });
  };

  // Estados de Filtros
  const [activeTab, setActiveTab] = useState<'hoy' | 'manana' | 'proximas' | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('TODOS');
  const [customDate, setCustomDate] = useState('');

  // Fechas de referencia local
  const dates = useMemo(() => {
    const now = new Date();
    
    const getFormattedDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const hoy = getFormattedDate(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const manana = getFormattedDate(tomorrow);

    return { hoy, manana };
  }, []);

  // Manejar Cierre de Sesión
  const handleLogout = async () => {
    const res = await logoutAdminAction();
    if (res.success) {
      router.push('/admin/login');
      router.refresh();
    }
  };

  // Actualizar Estado
  const handleStatusChange = (id: string, nuevoEstado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') => {
    startTransition(async () => {
      const res = await actualizarEstadoIntencion(id, nuevoEstado);
      if (res.success && res.data) {
        setIntenciones((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, estado: nuevoEstado } : item
          )
        );
      } else {
        alert(res.error || 'Ocurrió un error al actualizar el estado.');
      }
    });
  };

  // Filtrado de Intenciones
  const filteredIntenciones = useMemo(() => {
    return intenciones.filter((item) => {
      // 1. Filtrado por Pestaña de Tiempo
      if (activeTab === 'hoy') {
        if (item.fechaMisaStr !== dates.hoy) return false;
      } else if (activeTab === 'manana') {
        if (item.fechaMisaStr !== dates.manana) return false;
      } else if (activeTab === 'proximas') {
        if (item.fechaMisaStr < dates.hoy) return false;
      }

      // 2. Filtrado por Fecha Personalizada
      if (customDate) {
        if (item.fechaMisaStr !== customDate) return false;
      }

      // 3. Filtrado por Tipo de Intención / Sacramento
      if (selectedTipo !== 'TODOS') {
        if (selectedTipo === 'SACRAMENTO') {
          // Si el tipo es sacramento
          const sacramentos = ['BAUTIZO', 'COMUNION', 'CONFIRMACION', 'MATRIMONIO'];
          if (!sacramentos.includes(item.tipoIntencion)) return false;
        } else {
          if (item.tipoIntencion !== selectedTipo) return false;
        }
      }

      // 4. Filtrado por Buscador (Nombre, Email, Código Yape, Teléfono)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesNombre = item.nombreSolicitante.toLowerCase().includes(query);
        const matchesIntencion = item.nombreIntencion.toLowerCase().includes(query);
        const matchesEmail = item.emailSolicitante.toLowerCase().includes(query);
        const matchesYape = item.codigoYape.includes(query);
        const matchesTelefono = item.telefonoSolicitante.includes(query);

        if (!matchesNombre && !matchesIntencion && !matchesEmail && !matchesYape && !matchesTelefono) {
          return false;
        }
      }

      return true;
    });
  }, [intenciones, activeTab, searchQuery, selectedTipo, customDate, dates]);

  // Cálculos de métricas
  const metrics = useMemo(() => {
    const total = intenciones.length;
    const pendientes = intenciones.filter(i => i.estado === 'PENDIENTE').length;
    const aprobadas = intenciones.filter(i => i.estado === 'APROBADO');
    const ofrendaTotal = aprobadas.reduce((sum, item) => sum + item.montoOfrenda, 0);

    return {
      total,
      pendientes,
      aprobadas: aprobadas.length,
      ofrendaTotal
    };
  }, [intenciones]);

  // Formateador de texto legible para tipo de intención
  const getIntencionLabel = (tipo: string) => {
    switch (tipo) {
      case "DIFUNTO": return "Misa de Difunto";
      case "SALUD": return "Por Salud";
      case "CUMPLEANOS": return "Cumpleaños";
      case "ACCION_DE_GRACIAS": return "Acción de Gracias";
      case "BAUTIZO": return "Sacramento: Bautizo";
      case "COMUNION": return "Sacramento: Comunión";
      case "CONFIRMACION": return "Sacramento: Confirmación";
      case "MATRIMONIO": return "Sacramento: Matrimonio";
      default: return "Otro Motivo";
    }
  };

  // Color de etiqueta según tipo
  const getTipoBadgeStyle = (tipo: string) => {
    if (['BAUTIZO', 'COMUNION', 'CONFIRMACION', 'MATRIMONIO'].includes(tipo)) {
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    }
    switch (tipo) {
      case "DIFUNTO": return "bg-slate-100 text-slate-700 border-slate-200";
      case "SALUD": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "CUMPLEANOS": return "bg-amber-50 text-amber-700 border-amber-100";
      case "ACCION_DE_GRACIAS": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Formatear fecha para lectura humana (ej: Lunes, 12 de Julio)
  const getHumanFriendlyDate = (fechaStr: string) => {
    try {
      const parts = fechaStr.split('-');
      // Crear fecha local para evitar desfases de zona horaria
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return fechaStr;
    }
  };


  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-[#3D3A35] font-sans antialiased">
      
      {/* OVERLAY MENÚ MÓVIL */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        />
      )}

      {/* SIDEBAR IZQUIERDA (Estilo solicitado, similar al panel del sacerdote, se oculta al imprimir) */}
      <aside className={`no-print w-64 bg-[#FAF9F6] border-r border-[#EBEAE5] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Cabecera Sidebar (Logo e Iglesia Icon) */}
          <div className="p-6 flex items-center gap-3">
            <div className="text-[#80385e] shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
                <rect x="49" y="5" width="2" height="15" rx="0.5" />
                <rect x="44.5" y="9.5" width="11" height="2" rx="0.5" />
                <polygon points="40,25 50,18 60,25" />
                <rect x="42" y="25" width="16" height="16" />
                <rect x="47.5" y="29" width="5" height="12" rx="2.5" fill="#FAF9F6" />
                <polygon points="30,45 42,39 58,39 70,45" />
                <rect x="32" y="45" width="36" height="30" />
                <rect x="45" y="55" width="10" height="20" rx="2" fill="#FAF9F6" />
                <rect x="15" y="75" width="70" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-[#80385e] font-bold text-base leading-tight uppercase tracking-wider">
                Despacho
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">
                Patrocinio
              </span>
            </div>
          </div>

          {/* Menú de Opciones */}
          <nav className="px-3 mt-6 space-y-1.5 font-sans">
            <button
              onClick={() => { setActiveMenu('requests'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'requests' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-[#80385e]' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Solicitudes</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveMenu('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'settings' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-[#80385e]' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Configuración</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Footer (Cerrar Sesión) */}
        <div className="p-4 border-t border-[#EBEAE5]/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer font-sans"
          >
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {activeMenu === 'requests' && (
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Principal */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
              <div className="flex items-center gap-4">
                {/* Botón Toggle Menú Móvil */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs active:scale-95"
                >
                  ☰
                </button>
                <div className="w-12 h-12 rounded-full bg-[#80385e] text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-[#80385e]/10">
                  †
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">
                    Despacho Parroquial
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vista de Administración / Despacho
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 font-sans">
                <Link
                  href="/admin/agenda"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#80385e] hover:bg-[#682c4b] rounded-xl transition-all shadow-sm active:scale-98"
                >
                  Ver Agenda Sacerdote
                </Link>
                <button
                  onClick={() => {
                    setActiveTab('todas');
                    setSearchQuery('');
                    setSelectedTipo('TODOS');
                    setCustomDate('');
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Solicitudes</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-950">{metrics.total}</span>
                  <span className="text-xs text-slate-500">registros</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes de Pago</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-amber-500">{metrics.pendientes}</span>
                  <span className="text-xs text-slate-500">requieren acción</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aprobadas</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-500">{metrics.aprobadas}</span>
                  <span className="text-xs text-slate-500">confirmadas</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ofrendas Recaudadas</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs text-slate-400">S/.</span>
                  <span className="text-3xl font-bold text-slate-950">{metrics.ofrendaTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Controles de Filtros */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm shadow-slate-100 mb-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* Tabs por fecha */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button
                    onClick={() => { setActiveTab('todas'); setCustomDate(''); }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'todas' && !customDate ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => { setActiveTab('hoy'); setCustomDate(''); }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'hoy' && !customDate ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => { setActiveTab('manana'); setCustomDate(''); }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'manana' && !customDate ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Mañana
                  </button>
                  <button
                    onClick={() => { setActiveTab('proximas'); setCustomDate(''); }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'proximas' && !customDate ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Próximas
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Selector de Fecha */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Fecha:</span>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setActiveTab('todas');
                      }}
                      className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#80385e]"
                    />
                  </div>

                  {/* Selector de Tipo */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Tipo:</span>
                    <select
                      value={selectedTipo}
                      onChange={(e) => setSelectedTipo(e.target.value)}
                      className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#80385e]"
                    >
                      <option value="TODOS">Todos los Motivos</option>
                      <option value="DIFUNTO">Solo Difuntos</option>
                      <option value="SALUD">Solo Salud</option>
                      <option value="CUMPLEANOS">Solo Cumpleaños</option>
                      <option value="ACCION_DE_GRACIAS">Solo Acción de Gracias</option>
                      <option value="SACRAMENTO">Solo Sacramentos</option>
                      <option value="OTRO">Solo Otros Motivos</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Buscador */}
              <div className="relative font-sans">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por solicitante, intención, correo o código Yape..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-[#FAF9F6]/50 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#80385e] transition-all font-medium"
                />
              </div>
            </div>

            {/* Lista de Resultados */}
            <div className="space-y-4 font-sans">
              {filteredIntenciones.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                  </svg>
                  <p className="text-slate-500 font-bold text-sm">No se encontraron solicitudes con los filtros aplicados</p>
                  <p className="text-slate-400 text-xs mt-1">Pruebe limpiando los filtros o realizando otra búsqueda.</p>
                </div>
              ) : (
                filteredIntenciones.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${item.estado === 'PENDIENTE' ? 'border-amber-100 hover:border-amber-200' : item.estado === 'APROBADO' ? 'border-emerald-100 hover:border-emerald-200' : 'border-red-100 hover:border-red-200'}`}
                  >
                    {/* Información Principal de la Misa */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getTipoBadgeStyle(item.tipoIntencion)}`}>
                          {getIntencionLabel(item.tipoIntencion)}
                        </span>
                        
                        {/* Badge de Horario */}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                          🕒 {item.horaMisa}
                        </span>

                        {/* Badge de Estado */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.estado === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : item.estado === 'RECHAZADO' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-150'}`}>
                          {item.estado === 'APROBADO' ? '✓ Aprobado' : item.estado === 'RECHAZADO' ? '✗ Rechazado' : '⚡ Pendiente de Pago'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-800">
                          Intención: <span className="font-serif italic text-slate-900 font-normal">"{item.nombreIntencion}"</span>
                        </h3>
                        <p className="text-xs font-semibold text-[#80385e] mt-1">
                          📅 {getHumanFriendlyDate(item.fechaMisaStr)}
                        </p>
                      </div>

                      {/* Detalles de Solicitante y Pago */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div>
                          <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Solicitado por:</span>
                          <span className="font-semibold text-slate-800">{item.nombreSolicitante}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Contacto:</span>
                          <span className="block text-slate-700">📞 {item.telefonoSolicitante}</span>
                          <span className="block text-slate-700">✉ {item.emailSolicitante}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Ofrenda y Transacción:</span>
                          <span className="font-bold text-amber-600 block">S/. {item.montoOfrenda.toFixed(2)}</span>
                          <span className="font-mono text-slate-700">Cód. Yape: #{item.codigoYape}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de Aprobación */}
                    <div className="flex flex-row md:flex-col justify-end gap-2.5 md:w-44 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {item.estado === 'PENDIENTE' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, 'APROBADO')}
                            disabled={isPending}
                            className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-emerald-100 text-center active:scale-97 disabled:opacity-50 cursor-pointer"
                          >
                            Aprobar Pago
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'RECHAZADO')}
                            disabled={isPending}
                            className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xl transition-all text-center active:scale-97 disabled:opacity-50 cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(item.id, 'PENDIENTE')}
                          disabled={isPending}
                          className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-center active:scale-97 disabled:opacity-50 cursor-pointer"
                        >
                          Revertir a Pendiente
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {activeMenu === 'settings' && (
          <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
            <div className="mb-6 border-b border-slate-200 pb-3 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Botón Toggle Menú Móvil */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs active:scale-95"
                >
                  ☰
                </button>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#80385e]">Ajustes</span>
                  <h2 className="text-2xl font-serif font-bold text-slate-800 leading-tight">Configuración de la Parroquia</h2>
                </div>
              </div>
              <button
                onClick={() => setActiveMenu('requests')}
                className="px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-600 hover:bg-slate-50 transition-all active:scale-97 cursor-pointer"
              >
                Volver a Solicitudes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de Sacramentos */}
              <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-4 border-b border-[#FAF9F6] pb-2">
                  Control de Sacramentos en Reservas
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-6">
                  Habilite o deshabilite la disponibilidad de los sacramentos de Comunión y Confirmación para las reservas de misa públicas. Útil para coordinar períodos especiales o matrimonios de adultos que necesiten estos sacramentos de manera excepcional.
                </p>

                <div className="space-y-4">
                  {/* Comunión Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] border border-[#EBEAE5] rounded-2xl transition-all hover:shadow-xs">
                    <div>
                      <span className="font-bold text-[#5C4E3C] text-xs block">Primera Comunión</span>
                      <span className="text-[10px] text-slate-400">Mostrar en el formulario de reservas públicas</span>
                    </div>
                    <button
                      onClick={() => handleToggleSacrament('habilitar_comunion', config.habilitarComunion)}
                      disabled={isPending}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${config.habilitarComunion ? 'bg-[#80385e]' : 'bg-slate-300'}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${config.habilitarComunion ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  {/* Confirmación Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF9F6] border border-[#EBEAE5] rounded-2xl transition-all hover:shadow-xs">
                    <div>
                      <span className="font-bold text-[#5C4E3C] text-xs block">Confirmación</span>
                      <span className="text-[10px] text-slate-400">Mostrar en el formulario de reservas públicas</span>
                    </div>
                    <button
                      onClick={() => handleToggleSacrament('habilitar_confirmacion', config.habilitarConfirmacion)}
                      disabled={isPending}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${config.habilitarConfirmacion ? 'bg-[#80385e]' : 'bg-slate-300'}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${config.habilitarConfirmacion ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Gestión de Horarios de Misa */}
              <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 shadow-sm flex flex-col">
                <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-4 border-b border-[#FAF9F6] pb-2">
                  Gestión de Horarios de Misa
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-6">
                  Añada o elimine horarios disponibles para las intenciones de misa diarias. Los horarios configurados aquí se verán reflejados inmediatamente en la sección de reservas en línea.
                </p>

                {/* Formulario para añadir horario */}
                <div className="bg-[#FAF9F6] border border-[#EBEAE5] rounded-2xl p-4 mb-6">
                  <span className="block font-bold text-[#5C4E3C] text-xs mb-2">Añadir Nuevo Horario</span>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        type="time"
                        value={newScheduleTime}
                        onChange={(e) => {
                          setNewScheduleTime(e.target.value);
                          setScheduleError(null);
                        }}
                        className="w-full px-3 py-2 border border-[#EBEAE5] bg-white rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:ring-1 focus:ring-[#80385e]/50"
                      />
                    </div>
                    <button
                      onClick={handleAddSchedule}
                      disabled={isPending || !newScheduleTime}
                      className="py-2 px-4 bg-[#80385e] hover:bg-[#682c4b] disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 shrink-0 cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                  {scheduleError && (
                    <span className="text-[10px] text-red-600 block mt-2 font-medium">{scheduleError}</span>
                  )}
                </div>

                {/* Listado de horarios actuales */}
                <div className="flex-1">
                  <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2">
                    Horarios Disponibles ({config.horariosMisa.length})
                  </span>

                  {config.horariosMisa.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic text-xs border border-dashed border-[#EBEAE5] rounded-2xl bg-slate-50">
                      No hay horarios configurados en el sistema.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {config.horariosMisa.map((horario) => (
                        <div
                          key={horario}
                          className="flex items-center justify-between p-3 border border-[#EBEAE5] rounded-xl bg-white hover:border-[#80385e]/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs">🔔</span>
                            <span className="font-mono text-sm font-bold text-slate-700">{horario}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveSchedule(horario)}
                            disabled={isPending}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                            title="Eliminar Horario"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
