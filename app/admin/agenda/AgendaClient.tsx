"use client";

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logoutAdminAction } from '../../actions/authActions';
import { agregarRestriccion, eliminarRestriccionPorId, actualizarConfiguracion, agregarHorarioMisa, eliminarHorarioMisa } from '../../actions/misaActions';

interface Intencion {
  id: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  tipoIntencion: string;
  nombreIntencion: string;
  fechaMisa: Date;
  horaMisa: string;
  montoOfrenda: number;
  codigoYape: string;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  fechaMisaStr: string; // YYYY-MM-DD
}

interface Feligres {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdAtStr: string; // YYYY-MM-DD
}

interface HorarioRestringido {
  id: string;
  fechaStr: string;
  hora: string | null;
  motivo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SystemConfig {
  habilitarComunion: boolean;
  habilitarConfirmacion: boolean;
  horariosMisa: string[];
}

interface AgendaClientProps {
  initialIntenciones: Intencion[];
  initialFeligreses: Feligres[];
  initialRestricciones: HorarioRestringido[];
  initialConfig: SystemConfig;
  role: 'admin' | 'sacerdote';
}

export default function AgendaClient({ 
  initialIntenciones, 
  initialFeligreses, 
  initialRestricciones, 
  initialConfig,
  role 
}: AgendaClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados de navegación y filtros
  const [activeMenu, setActiveMenu] = useState<'today' | 'calendar' | 'settings'>('today');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-13');

  // Estado de check-in y modal de detalles de misas
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);
  const [selectedMisaDetails, setSelectedMisaDetails] = useState<Intencion | null>(null);

  // Estados para restricciones de fechas/calendario (Gestionado por el Sacerdote)
  const [restricciones, setRestricciones] = useState<HorarioRestringido[]>(initialRestricciones);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [restrictionMotivo, setRestrictionMotivo] = useState('');

  // Estados de configuración dinámica
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

  // Estados del calendario interactivo
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // Estado para desplegar menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fechas de referencia local
  const dates = useMemo(() => {
    const now = new Date();
    const getFormattedDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formatDayLabel = (d: Date) => {
      return d.toLocaleDateString('es-ES', { weekday: 'long' });
    };

    const hoy = getFormattedDate(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const manana = getFormattedDate(tomorrow);

    const afterTomorrow = new Date(now);
    afterTomorrow.setDate(now.getDate() + 2);
    const pasado = getFormattedDate(afterTomorrow);
    const pasadoLabel = formatDayLabel(afterTomorrow);

    return { hoy, manana, pasado, pasadoLabel };
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    const res = await logoutAdminAction();
    if (res.success) {
      router.push('/admin/login');
      router.refresh();
    }
  };

  // Alternar Check-In
  const toggleCheckIn = (id: string) => {
    setCheckedInIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Agregar restricción de fecha/hora
  const handleAddRestriction = (hora: string | null) => {
    if (!selectedCalendarDate) return;
    
    startTransition(async () => {
      const res = await agregarRestriccion(selectedCalendarDate, hora, restrictionMotivo);
      if (res.success && res.data) {
        // Tipar el registro devuelto por la acción de servidor para compatibilidad
        const nuevaRestriccion: HorarioRestringido = {
          ...res.data,
          createdAt: new Date(res.data.createdAt),
          updatedAt: new Date(res.data.updatedAt)
        };
        setRestricciones(prev => [...prev, nuevaRestriccion]);
        setRestrictionMotivo('');
        router.refresh();
      } else {
        alert(res.error || 'Ocurrió un error al registrar el bloqueo.');
      }
    });
  };

  // Eliminar restricción de fecha/hora por ID
  const handleRemoveRestriction = (id: string) => {
    startTransition(async () => {
      const res = await eliminarRestriccionPorId(id);
      if (res.success) {
        setRestricciones(prev => prev.filter(r => r.id !== id));
        router.refresh();
      } else {
        alert(res.error || 'Ocurrió un error al eliminar el bloqueo.');
      }
    });
  };

  // Obtener intenciones filtradas para el día seleccionado
  const dayIntenciones = useMemo(() => {
    return initialIntenciones.filter(item => item.fechaMisaStr === selectedDate)
      .sort((a, b) => {
        const toMinutes = (timeStr: string) => {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        return toMinutes(a.horaMisa) - toMinutes(b.horaMisa);
      });
  }, [initialIntenciones, selectedDate]);

  // Generación de celdas para la vista mensual del calendario
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Domingo

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Rellenar días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr, isCurrentMonth: false });
    }

    // Rellenar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr, isCurrentMonth: true });
    }

    // Completar 42 celdas
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr, isCurrentMonth: false });
    }

    return cells;
  }, [currentMonth, currentYear]);

  // Navegar meses en el calendario
  const changeMonth = (offset: number) => {
    let nextMonth = currentMonth + offset;
    let nextYear = currentYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const getIntencionLabel = (tipo: string) => {
    switch (tipo) {
      case "DIFUNTO": return "Misa de Difunto (Q.E.P.D.)";
      case "SALUD": return "Misa de Salud";
      case "CUMPLEANOS": return "Misa de Cumpleaños";
      case "ACCION_DE_GRACIAS": return "Acción de Gracias";
      case "BAUTIZO": return "Sacramento: Bautizo";
      case "COMUNION": return "Sacramento: Comunión";
      case "CONFIRMACION": return "Sacramento: Confirmación";
      case "MATRIMONIO": return "Sacramento: Matrimonio";
      default: return "Intención Comunitaria";
    }
  };

  const getHumanFriendlyDate = (fechaStr: string) => {
    try {
      const parts = fechaStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return fechaStr;
    }
  };

  const getMonthName = (monthIdx: number) => {
    return new Date(2026, monthIdx, 1).toLocaleDateString('es-ES', { month: 'long' });
  };



  // Obtener restricciones activas para una fecha seleccionada
  const activeRestrictionsForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return restricciones.filter(r => r.fechaStr === selectedCalendarDate);
  }, [restricciones, selectedCalendarDate]);

  const isSelectedDateFullyBlocked = useMemo(() => {
    return activeRestrictionsForSelectedDate.some(r => r.hora === null);
  }, [activeRestrictionsForSelectedDate]);

  const HORARIOS_DISPONIBLES = config.horariosMisa;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-[#3D3A35] font-sans antialiased">
      
      {/* Estilos CSS específicos para la impresión Altar (Estilo Ticket) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Reset de la página */
          html, body {
            background-color: white !important;
            color: black !important;
            font-family: 'Georgia', serif !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Quitar el flex de la pantalla principal para evitar que se aplaste */
          div.min-h-screen.flex {
            display: block !important;
            background: none !important;
          }
          aside, .no-print {
            display: none !important;
          }
          main {
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 2px dashed #000 !important;
            padding-bottom: 1rem;
          }
          .print-title {
            font-size: 20pt !important;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          /* Tarjeta estilo Ticket */
          .print-card {
            page-break-inside: avoid;
            border: 1px dashed #000 !important;
            padding: 1.5rem !important;
            margin-bottom: 1.5rem !important;
            background: none !important;
            border-radius: 0 !important;
            display: block !important; /* Formato bloque */
            width: 100% !important;
            box-shadow: none !important;
          }
          .print-card-header {
            border-bottom: 1px dashed #000 !important;
            padding-bottom: 0.5rem !important;
            margin-bottom: 0.75rem !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: baseline !important;
          }
          .print-type {
            font-size: 12pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }
          .print-time {
            font-size: 16pt !important;
            font-weight: bold !important;
          }
          .print-intention {
            font-size: 14pt !important;
            font-style: italic !important;
            margin: 0.75rem 0 !important;
            line-height: 1.4 !important;
          }
          .print-details {
            font-size: 11pt !important;
            color: #333 !important;
            margin-top: 0.5rem !important;
            line-height: 1.5 !important;
          }
        }
      `}} />

      {/* Cabecera exclusiva de impresión */}
      <div className="hidden print-header">
        <h1 className="print-title">PARROQUIA NUESTRA SEÑORA DEL PATROCINIO</h1>
        <p style={{ margin: '4px 0', fontSize: '12pt', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Agenda de Misas - Altar
        </p>
        <p style={{ fontWeight: 'bold', fontSize: '14pt', marginTop: '10px' }}>
          Día: {getHumanFriendlyDate(selectedDate)}
        </p>
      </div>

      {/* SIDEBAR IZQUIERDA (Estilo solicitado, oculta al imprimir) */}
      <aside className={`no-print w-64 bg-[#FAF9F6] border-r border-[#EBEAE5] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Cabecera Sidebar (Logo e Iglesia Icon) */}
          <div className="p-6 flex items-center gap-3">
            <div className="text-[#B89851] shrink-0">
              <svg className="w-9 h-9" viewBox="0 0 100 100" fill="currentColor">
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
              <h2 className="font-serif text-[#B89851] font-bold text-lg leading-tight uppercase tracking-wider">
                Reservas
              </h2>
              <span className="text-[10px] font-bold text-[#A5A29B] uppercase tracking-widest leading-none block">
                Patrocinio
              </span>
            </div>
          </div>

          {/* Menú de Opciones (Lista Feligreses ELIMINADO a solicitud) */}
          <nav className="px-3 mt-6 space-y-1.5 font-sans">
            <button
              onClick={() => { setActiveMenu('today'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'today' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-[#B5336D]' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
                <span>Horario de Hoy</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveMenu('calendar'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'calendar' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-[#B5336D]' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Vista Calendario</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveMenu('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'settings' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-[#B5336D]' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
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

        {/* Botón Salir */}
        <div className="p-4 border-t border-[#EBEAE5]">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-700 bg-[#FAF9F6] hover:bg-red-50 border border-[#EBEAE5] hover:border-red-150 rounded-xl transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DERECHA */}
      <main className="flex-1 min-w-0 p-4 md:p-8 flex flex-col">
        
        {/* Cabecera Superior de Pantalla (No se imprime) */}
        <header className="no-print flex items-center justify-between pb-4 border-b border-[#EBEAE5] mb-6 gap-4">
          <div className="flex items-center gap-3">
            {/* Botón Toggle Menú Móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white border border-[#EBEAE5] text-[#3D3A35] hover:bg-[#FAF9F6]"
            >
              ☰
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-[#5C4E3C] tracking-wide uppercase">
                {activeMenu === 'today' ? 'Reservaciones de Misa' : activeMenu === 'calendar' ? 'Calendario Parroquial' : 'Configuración'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 font-sans">
            {role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B5336D] hover:bg-[#B5336D]/5 border border-[#B5336D]/25 rounded-xl transition-all"
              >
                Panel de Administración
              </Link>
            )}
          </div>
        </header>

        {/* 1. HORARIO DE HOY (TABS DE DÍAS Y TARJETAS DE MISAS) */}
        {activeMenu === 'today' && (
          <div className="flex-1">
            {/* Subheader Tabs */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#EBEAE5] pb-2">
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <button
                  onClick={() => setSelectedDate(dates.hoy)}
                  className={`pb-3 relative transition-colors ${selectedDate === dates.hoy ? 'text-[#B5336D] font-bold' : 'text-[#A5A29B] hover:text-[#3D3A35]'}`}
                >
                  Hoy
                  {selectedDate === dates.hoy && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5336D]" />}
                </button>
                <button
                  onClick={() => setSelectedDate(dates.manana)}
                  className={`pb-3 relative transition-colors ${selectedDate === dates.manana ? 'text-[#B5336D] font-bold' : 'text-[#A5A29B] hover:text-[#3D3A35]'}`}
                >
                  Mañana
                  {selectedDate === dates.manana && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5336D]" />}
                </button>
                <button
                  onClick={() => setSelectedDate(dates.pasado)}
                  className={`pb-3 relative transition-colors capitalize ${selectedDate === dates.pasado ? 'text-[#B5336D] font-bold' : 'text-[#A5A29B] hover:text-[#3D3A35]'}`}
                >
                  {dates.pasadoLabel}
                  {selectedDate === dates.pasado && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5336D]" />}
                </button>
              </div>

              {/* Controles de descargas y calendario */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-[#EBEAE5] bg-white rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:ring-1 focus:ring-[#B5336D]/50"
                />

                {dayIntenciones.length > 0 && (
                  <>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-[#FAF9F6] border border-[#EBEAE5] hover:bg-[#F5EFEB] rounded-xl text-xs font-bold text-[#5C4E3C] transition-all shadow-sm"
                    >
                      Descargar
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-[#FAF9F6] border border-[#EBEAE5] hover:bg-[#F5EFEB] rounded-xl text-xs font-bold text-[#5C4E3C] transition-all shadow-sm"
                    >
                      Imprimir
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Banner Header Style Paris Mockup */}
            <div className="no-print relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-6 shadow-md border border-[#EBEAE5]">
              <img 
                src="/church_interior_wide.jpg" 
                alt="Altar de la Parroquia" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-between p-6">
                <div className="no-print flex items-center justify-between">
                  <Link 
                    href="/admin/dashboard"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur-sm transition-all"
                    title="Volver al Panel"
                  >
                    ←
                  </Link>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight drop-shadow-md">
                      Parroquia Nuestra Señora del Patrocinio
                    </h2>
                    <p className="text-xs text-white/80 font-sans tracking-wide mt-1 drop-shadow-sm uppercase">
                      Agenda y Celebraciones Litúrgicas
                    </p>
                  </div>
                  
                  <div className="bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shrink-0 border border-slate-100">
                    <span>📅</span>
                    <span>{getHumanFriendlyDate(selectedDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta si el día está totalmente bloqueado para el público */}
            {restricciones.some(r => r.fechaStr === selectedDate && r.hora === null) && (
              <div className="no-print p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-semibold text-red-700 flex gap-2 mb-6 items-center">
                <span>🚫</span>
                <span>Este día se encuentra **BLOQUEADO** en la web de reservas por indicación del sacerdote.</span>
              </div>
            )}

            {/* Lista de Tarjetas */}
            <div className="space-y-4 print-container">
              {dayIntenciones.length === 0 ? (
                <div className="bg-white border border-[#EBEAE5] rounded-3xl p-12 text-center shadow-sm no-print">
                  <span className="text-3xl">🕊️</span>
                  <h3 className="text-sm font-bold text-[#5C4E3C] uppercase tracking-wider mt-2 mb-1">
                    Ninguna misa programada
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    No hay intenciones ni misas agendadas y confirmadas para este día.
                  </p>
                </div>
              ) : (
                dayIntenciones.map((item) => {
                  const isHourBlocked = restricciones.some(
                    r => r.fechaStr === selectedDate && r.hora === item.horaMisa
                  );

                  let cardImage = "/church_schedules.jpg";
                  if (item.tipoIntencion === "BAUTIZO" || item.tipoIntencion.startsWith("BAUTIZO") || item.tipoIntencion.includes("BAUTIZO")) {
                    cardImage = "/church_baptism.jpg";
                  } else if (item.tipoIntencion === "DIFUNTO" || item.tipoIntencion.includes("DIFUNTO")) {
                    cardImage = "/church_crucifix.png";
                  } else if (item.tipoIntencion === "SALUD" || item.tipoIntencion.includes("SALUD")) {
                    cardImage = "/church_mass.jpg";
                  } else if (item.tipoIntencion === "CUMPLEANOS" || item.tipoIntencion.includes("CUMPLEANOS") || item.tipoIntencion.includes("CUMPLE")) {
                    cardImage = "/church_altar.jpg";
                  } else if (item.tipoIntencion === "SACRAMENTO" || item.tipoIntencion.includes("MATRIMONIO") || item.tipoIntencion.includes("COMUNION") || item.tipoIntencion.includes("CONFIRMACION")) {
                    cardImage = "/church_patroness_hero.jpg";
                  }

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 print-card flex flex-col md:flex-row gap-5 items-start md:items-stretch ${isHourBlocked ? 'border-dashed border-red-200 bg-red-50/10' : 'border-[#EBEAE5]'}`}
                    >
                      {/* Left: Thumbnail Image (resembling travel app mockup) */}
                      <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative border border-[#EBEAE5] no-print">
                        <img 
                          src={cardImage} 
                          alt={item.tipoIntencion}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {item.horaMisa}
                        </div>
                      </div>

                      {/* Right: Reservation Details */}
                      <div className="flex-1 flex flex-col justify-between w-full">
                        <div>
                          {/* Top Row: Type, Capacity, and Status Badge */}
                          <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#FAF9F6] print-card-header">
                            <div className="flex items-baseline gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#3D3A35] font-sans print-type">
                                {item.tipoIntencion === 'SACRAMENTO' ? `SACRAMENTO: ${item.nombreSolicitante}` : getIntencionLabel(item.tipoIntencion).toUpperCase()}
                              </span>
                              {/* Hora visible SOLO en la versión impresa (Estilo Ticket) */}
                              <span className="hidden print:inline print-time text-black font-bold ml-3">
                                - {item.horaMisa}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Status Badge eliminado */}

                              {isHourBlocked && (
                                <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider no-print">
                                  Bloqueado
                                </span>
                              )}
                              {checkedInIds.includes(item.id) && (
                                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                  En Templo ✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Intention Text Box */}
                          <div className="py-3 my-2 border-l-4 border-[#B5336D] bg-[#FAF9F6] px-3.5 rounded-r-xl">
                            <p className="text-[10px] text-[#A5A29B] font-bold uppercase tracking-widest leading-none">
                              Intención / Petición:
                            </p>
                            <p className="text-sm text-[#3D3A35] font-serif italic mt-1.5 leading-snug print-intention">
                              "{item.nombreIntencion}"
                            </p>
                          </div>

                          {/* Metadata List with Icons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 text-xs font-sans text-slate-500 print-details">
                            <div>
                              Solicitante: <strong className="text-slate-700">{item.nombreSolicitante}</strong>
                            </div>
                            {item.telefonoSolicitante && (
                              <div>
                                Teléfono: <strong>{item.telefonoSolicitante}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="no-print flex items-center justify-between gap-3 pt-4 mt-3 border-t border-[#FAF9F6]">
                          <button
                            onClick={() => toggleCheckIn(item.id)}
                            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-97 shadow-sm ${checkedInIds.includes(item.id) ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#B5336D] text-white hover:bg-[#962557]'}`}
                          >
                            {checkedInIds.includes(item.id) ? 'Ingresado ✓' : 'Marcar Check-in'}
                          </button>

                          <button
                            onClick={() => setSelectedMisaDetails(item)}
                            className="px-4 py-2 border border-[#EBEAE5] hover:bg-[#F5EFEB] text-xs font-bold uppercase tracking-wider rounded-xl text-[#7A766F] hover:text-[#5C4E3C] transition-all"
                          >
                            Detalles Completos
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. VISTA DE CALENDARIO COMPLETO (HABILITAR O INHABILITAR HORAS O DIAS ENTEROS) */}
        {activeMenu === 'calendar' && (
          <div className="flex-1 animate-fade-in">


            {/* Cabecera de Navegación del Calendario (Estilo Widget) */}
            <div className="flex items-center justify-between bg-white border border-[#EBEAE5] rounded-2xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Select de Mes */}
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="px-3 py-1.5 border border-[#EBEAE5] bg-white rounded-xl text-xs font-bold text-[#5C4E3C] focus:outline-none focus:ring-1 focus:ring-[#B5336D]/50 cursor-pointer capitalize"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>
                      {getMonthName(i)}
                    </option>
                  ))}
                </select>

                {/* Select de Año */}
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="px-3 py-1.5 border border-[#EBEAE5] bg-white rounded-xl text-xs font-bold text-[#5C4E3C] focus:outline-none focus:ring-1 focus:ring-[#B5336D]/50 cursor-pointer"
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const yr = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Flechas de Navegación del Widget */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeMonth(-1)}
                  className="w-8 h-8 flex items-center justify-center border border-[#EBEAE5] rounded-xl hover:bg-[#F5EFEB] text-sm font-bold text-[#5C4E3C] transition-all cursor-pointer"
                  title="Mes Anterior"
                >
                  &lt;
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="w-8 h-8 flex items-center justify-center border border-[#EBEAE5] rounded-xl hover:bg-[#F5EFEB] text-sm font-bold text-[#5C4E3C] transition-all cursor-pointer"
                  title="Mes Siguiente"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Grid del Calendario (Estilo Limpio) */}
            <div className="bg-white border border-[#EBEAE5] rounded-3xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 bg-[#FAF9F6] border-b border-[#EBEAE5] text-center text-xs font-semibold py-3 text-[#7A766F]">
                <div>lun</div>
                <div>mar</div>
                <div>mié</div>
                <div>jue</div>
                <div>vie</div>
                <div>sáb</div>
                <div>dom</div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-[#EBEAE5]">
                {calendarCells.map((cell, idx) => {
                  const cellIntenciones = initialIntenciones.filter(
                    item => item.fechaMisaStr === cell.dateStr
                  );
                  
                  // Evaluar restricciones para este día
                  const cellRestricciones = restricciones.filter(r => r.fechaStr === cell.dateStr);
                  const isFullyBlocked = cellRestricciones.some(r => r.hora === null);
                  const isPartiallyBlocked = cellRestricciones.some(r => r.hora !== null);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedCalendarDate(cell.dateStr);
                      }}
                      className={`min-h-[70px] md:min-h-[85px] p-2 flex flex-col justify-between cursor-pointer hover:bg-[#FAF6F0] transition-all relative ${!cell.isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'bg-white text-[#3D3A35]'}`}
                    >
                      {/* Día y badge de Bloqueado */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${cell.dateStr === dates.hoy ? 'bg-[#B5336D] text-white' : ''}`}>
                          {cell.day}
                        </span>
                        {isFullyBlocked && (
                          <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" title="Todo el Día Bloqueado" />
                        )}
                      </div>

                      {/* Detalles en celda */}
                      <div className="mt-1 space-y-1">
                        {isFullyBlocked ? (
                          <div className="text-[8px] font-bold text-rose-700 bg-rose-50 border border-rose-100/50 px-1 py-0.5 rounded text-center truncate">
                            Bloqueado
                          </div>
                        ) : (
                          <>
                            {cellIntenciones.length > 0 && (
                              <div className="text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-1 py-0.5 rounded text-center truncate">
                                {cellIntenciones.length} {cellIntenciones.length === 1 ? 'Misa' : 'Misas'}
                              </div>
                            )}
                            {isPartiallyBlocked && (
                              <div className="text-[8px] font-bold text-amber-800 bg-amber-50 border border-amber-100/50 px-1 py-0.5 rounded text-center truncate">
                                {cellRestricciones.length} Bloqueos
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. CONFIGURACIÓN (DETALLES DE CUENTA Y AJUSTES DE SACRAMENTOS/HORARIOS) */}
        {activeMenu === 'settings' && (
          <div className="flex-1 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B89851]">Ajustes</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
              {/* Columna Izquierda: Ajustes de Sacramentos e Información de Sesión */}
              <div className="space-y-6">
                {/* Panel de Sacramentos */}
                <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-4 border-b border-[#FAF9F6] pb-2 flex items-center gap-2">
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
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${config.habilitarComunion ? 'bg-[#B5336D]' : 'bg-slate-300'}`}
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
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${config.habilitarConfirmacion ? 'bg-[#B5336D]' : 'bg-slate-300'}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${config.habilitarConfirmacion ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Datos de Sesión */}
                <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-4 border-b border-[#FAF9F6] pb-2">
                    Datos de la Sesión
                  </h3>
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Usuario Activo:</span>
                      <span className="font-bold text-slate-700 text-sm">{role === 'sacerdote' ? 'Sacerdote / Padre' : 'Administrador'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Nivel de Acceso:</span>
                      <span className="font-mono text-slate-600 uppercase bg-[#F5EFEB] px-2 py-0.5 rounded border border-[#EBEAE5]">{role}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Parroquia:</span>
                      <span className="text-slate-700">Parroquia Nuestra Señora del Patrocinio</span>
                    </div>
                    <div className="pt-4 border-t border-[#FAF9F6]">
                      <button
                        onClick={handleLogout}
                        className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98"
                      >
                        Cerrar Sesión Activa
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Gestión de Horarios de Misa */}
              <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 shadow-sm flex flex-col">
                <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-4 border-b border-[#FAF9F6] pb-2 flex items-center gap-2">
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
                        className="w-full px-3 py-2 border border-[#EBEAE5] bg-white rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:ring-1 focus:ring-[#B5336D]/50"
                      />
                    </div>
                    <button
                      onClick={handleAddSchedule}
                      disabled={isPending || !newScheduleTime}
                      className="py-2 px-4 bg-[#B5336D] hover:bg-[#972658] disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 shrink-0"
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
                          className="flex items-center justify-between p-3 border border-[#EBEAE5] rounded-xl bg-white hover:border-[#B5336D]/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs">🔔</span>
                            <span className="font-mono text-sm font-bold text-slate-700">{horario}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveSchedule(horario)}
                            disabled={isPending}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all active:scale-95"
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

      {/* MODAL DE RESTRICCIONES (Bloquear/Habilitar horarios o días enteros, solicitado por el usuario) */}
      {selectedCalendarDate && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEAE5] mb-4">
              <div>
                <h3 className="font-serif font-bold text-[#5C4E3C] text-base">
                  Gestionar Restricciones
                </h3>
                <span className="text-[10px] font-bold text-[#B89851] uppercase tracking-wider block">
                  {getHumanFriendlyDate(selectedCalendarDate)}
                </span>
              </div>
              <button
                onClick={() => { setSelectedCalendarDate(null); setRestrictionMotivo(''); }}
                className="text-[#A5A29B] hover:text-[#3D3A35] text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            {/* Listado de bloqueos activos en la fecha seleccionada */}
            <div className="space-y-3 mb-6">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Bloqueos Activos:
              </span>
              
              {activeRestrictionsForSelectedDate.length === 0 ? (
                <p className="text-xs italic text-slate-400 bg-slate-50 p-3 rounded-xl border border-dashed border-[#EBEAE5] text-center">
                  No hay restricciones registradas para este día. Las reservas están abiertas.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeRestrictionsForSelectedDate.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl p-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-red-800 block uppercase tracking-wider text-[10px]">
                          {r.hora === null ? '🚫 TODO EL DÍA BLOQUEADO' : `🚫 HORA BLOQUEADA: ${r.hora}`}
                        </span>
                        {r.motivo && (
                          <span className="text-[11px] text-red-600 block mt-0.5">Motivo: {r.motivo}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveRestriction(r.id)}
                        disabled={isPending}
                        className="px-2.5 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg font-bold uppercase text-[9px] hover:bg-red-50 transition-all shrink-0 active:scale-97"
                      >
                        Habilitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Motivo para el bloqueo */}
            <div className="mb-4">
              <label
                htmlFor="motivo"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >
                Motivo del Bloqueo:
              </label>
              <input
                id="motivo"
                type="text"
                value={restrictionMotivo}
                onChange={(e) => setRestrictionMotivo(e.target.value)}
                placeholder="Ej. Reunión de Clero, Mantenimiento..."
                className="w-full px-3 py-2 border border-[#EBEAE5] bg-white rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:ring-1 focus:ring-[#B5336D]/50"
              />
            </div>

            {/* Opciones de creación de bloqueos */}
            <div className="space-y-3 pt-3 border-t border-[#FAF9F6]">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Crear Restricciones:
              </span>

              {/* Botón para bloquear todo el día */}
              {!isSelectedDateFullyBlocked && (
                <button
                  onClick={() => handleAddRestriction(null)}
                  disabled={isPending}
                  className="w-full flex justify-center py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-97 disabled:opacity-50"
                >
                  🚫 Bloquear Todo el Día
                </button>
              )}

              {/* Botones para bloquear horas individuales */}
              {!isSelectedDateFullyBlocked && (
                <div className="space-y-2 mt-2">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Bloquear horario específico:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {HORARIOS_DISPONIBLES.map((h) => {
                      const isHourAlreadyBlocked = activeRestrictionsForSelectedDate.some(r => r.hora === h);
                      return (
                        <button
                          key={h}
                          disabled={isHourAlreadyBlocked || isPending}
                          onClick={() => handleAddRestriction(h)}
                          className={`py-2 px-1 text-[10px] font-bold rounded-lg border text-center transition-all ${isHourAlreadyBlocked ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-[#F5EFEB] border-slate-200 text-slate-600 hover:text-slate-800'}`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Enlace para ver misas de este día */}
            <div className="mt-6 pt-4 border-t border-[#EBEAE5] flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  setSelectedDate(selectedCalendarDate);
                  setSelectedCalendarDate(null);
                  setActiveMenu('today');
                }}
                className="text-xs font-bold text-[#B5336D] hover:underline"
              >
                🔎 Ver Misas de este Día
              </button>
              <button
                onClick={() => { setSelectedCalendarDate(null); setRestrictionMotivo(''); }}
                className="px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-600 hover:bg-slate-50 transition-all active:scale-97"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES DE RESERVA */}
      {selectedMisaDetails && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEAE5] mb-4">
              <h3 className="font-serif font-bold text-[#5C4E3C] text-base">
                Detalle del Registro
              </h3>
              <button
                onClick={() => setSelectedMisaDetails(null)}
                className="text-[#A5A29B] hover:text-[#3D3A35] text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-600">
              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Celebración:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {getIntencionLabel(selectedMisaDetails.tipoIntencion)}
                </span>
              </div>

              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Horario y Fecha:</span>
                <span className="font-bold text-[#B89851] text-sm font-mono block">
                  🕒 {selectedMisaDetails.horaMisa}
                </span>
                <span className="font-semibold text-slate-700 block">
                  📅 {getHumanFriendlyDate(selectedMisaDetails.fechaMisaStr)}
                </span>
              </div>

              <div className="pl-3 border-l-2 border-[#B5336D] bg-[#FAF9F6] py-2 rounded-r-lg">
                <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Intenciones:</span>
                <span className="font-serif italic text-slate-800 text-sm">
                  "{selectedMisaDetails.nombreIntencion}"
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#FAF9F6]">
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Solicitante:</span>
                  <span className="font-semibold text-slate-800">{selectedMisaDetails.nombreSolicitante}</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Celular:</span>
                  <span className="text-slate-800">{selectedMisaDetails.telefonoSolicitante}</span>
                </div>
              </div>

              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">Correo:</span>
                <span className="font-mono text-slate-700">{selectedMisaDetails.emailSolicitante}</span>
              </div>

              <div className="bg-[#F5EFEB] p-3 rounded-2xl border border-[#EBEAE5] grid grid-cols-2 gap-2">
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-widest text-[8px]">Ofrenda:</span>
                  <span className="font-bold text-[#B5336D]">S/. {selectedMisaDetails.montoOfrenda.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-widest text-[8px]">Código Yape:</span>
                  <span className="font-mono font-bold text-slate-700">#{selectedMisaDetails.codigoYape}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedMisaDetails(null)}
                className="px-5 py-2.5 bg-[#B5336D] hover:bg-[#962557] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-97"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
