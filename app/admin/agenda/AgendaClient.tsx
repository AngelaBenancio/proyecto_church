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
            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest bg-[#E4CDDA] border-transparent text-[#80385e] hover:bg-[#D8B4C8] rounded-full transition-all shadow-sm"
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
                {activeMenu === 'today' ? 'Reservaciones de Misa' : activeMenu === 'calendar' ? '' : 'Configuración'}
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
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                <span className="font-sans text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest border border-[#EBEAE5] bg-[#FAF9F6] px-4 py-1.5 rounded-full shadow-sm">
                  {getHumanFriendlyDate(selectedDate)}
                </span>
                {selectedDate !== dates.hoy && (
                  <button
                    onClick={() => setSelectedDate(dates.hoy)}
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-[#EBEAE5] rounded-full text-[#A5A29B] hover:text-[#3D3A35] hover:bg-[#FAF9F6] transition-colors"
                  >
                    Volver a Hoy
                  </button>
                )}
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
                      Agenda y Celebraciones Litúrgicas
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const [y, m, d] = selectedDate.split('-').map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        dateObj.setDate(dateObj.getDate() - 1);
                        setSelectedDate(`${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`);
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#F5EFEB] text-[#80385e] rounded-full shadow-lg transition-all border border-slate-100 font-bold"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        const [y, m, d] = selectedDate.split('-').map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        dateObj.setDate(dateObj.getDate() + 1);
                        setSelectedDate(`${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`);
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#F5EFEB] text-[#80385e] rounded-full shadow-lg transition-all border border-slate-100 font-bold"
                    >
                      →
                    </button>
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
          <div className="flex-1 animate-fade-in bg-[#FFFDF9] p-2 md:p-6 rounded-3xl border border-[#EAE3D9]">

            {/* Cabecera Elegante Estilo Referencia */}
            <div className="mb-4 flex flex-row items-center justify-between border-b border-[#EAE3D9] pb-4 gap-4">
              <div className="flex items-center">
                <h2 className="text-lg md:text-xl font-serif text-[#3D3A35] leading-tight tracking-widest uppercase">
                  Calendario Parroquial
                </h2>
              </div>
              <div className="text-[#D0C5B5] opacity-80">
                <svg viewBox="0 0 120 120" className="w-16 h-16 md:w-20 md:h-20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Cross */}
                  <path d="M60 10 v20 M50 20 h20" />
                  {/* Steeple */}
                  <polygon points="60,30 45,55 75,55" />
                  <rect x="45" y="55" width="30" height="55" />
                  {/* Rose window */}
                  <circle cx="60" cy="70" r="5" />
                  <circle cx="60" cy="70" r="2" />
                  {/* Side Wings */}
                  <polygon points="45,75 25,90 45,90" />
                  <rect x="25" y="90" width="20" height="20" />
                  <polygon points="75,75 95,90 75,90" />
                  <rect x="75" y="90" width="20" height="20" />
                  {/* Windows */}
                  <path d="M35 98 v5 a3 3 0 0 1 -6 0 v-5 a3 3 0 0 1 6 0 z" />
                  <path d="M91 98 v5 a3 3 0 0 1 -6 0 v-5 a3 3 0 0 1 6 0 z" />
                  {/* Main Door */}
                  <path d="M52 110 v-15 a8 8 0 0 1 16 0 v15" />
                  {/* Ground */}
                  <path d="M15 110 h90" />
                </svg>
              </div>
            </div>

            {/* Controles del Calendario */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="px-4 py-2 border-b border-[#EAE3D9] bg-transparent text-sm font-serif font-bold text-[#3D3A35] focus:outline-none focus:border-[#B5336D] cursor-pointer capitalize appearance-none"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{getMonthName(i)}</option>
                  ))}
                </select>

                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="px-4 py-2 border-b border-[#EAE3D9] bg-transparent text-sm font-serif font-bold text-[#3D3A35] focus:outline-none focus:border-[#B5336D] cursor-pointer appearance-none"
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const yr = new Date().getFullYear() - 2 + i;
                    return <option key={yr} value={yr}>{yr}</option>;
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center bg-[#80385e] rounded-full hover:bg-[#964a75] text-white transition-all shadow-sm">
                  ←
                </button>
                <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center bg-[#80385e] rounded-full hover:bg-[#964a75] text-white transition-all shadow-sm">
                  →
                </button>
              </div>
            </div>

            {/* Grid del Calendario Estilo Icono Referencia */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#4a1f35]/20">
              <div className="grid grid-cols-7 bg-[#a35b80] text-center text-[10px] sm:text-xs font-sans font-bold tracking-widest py-4 text-white uppercase shadow-md relative z-10">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 p-2 sm:p-4 bg-[#80385e]">
                {calendarCells.map((cell, idx) => {
                  const cellIntenciones = initialIntenciones.filter(item => item.fechaMisaStr === cell.dateStr);
                  const cellRestricciones = restricciones.filter(r => r.fechaStr === cell.dateStr);
                  const isFullyBlocked = cellRestricciones.some(r => r.hora === null);
                  const isPartiallyBlocked = cellRestricciones.some(r => r.hora !== null);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCalendarDate(cell.dateStr)}
                      className={`min-h-[75px] p-2 flex flex-col justify-start cursor-pointer transition-all rounded-xl ${
                        cell.dateStr === dates.hoy 
                          ? 'bg-[#964a75] border-2 border-[#EADCB9] shadow-lg scale-[1.02] z-10' 
                          : 'bg-[#FFFDF9] hover:bg-[#E4CDDA] shadow-sm'
                      } ${!cell.isCurrentMonth ? 'opacity-40 hover:opacity-100' : ''}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-sm font-serif font-bold ${cell.dateStr === dates.hoy ? 'text-white' : 'text-[#3D3A35]'}`}>
                          {cell.day}
                        </span>
                        {isFullyBlocked && (
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-1 shadow-sm" />
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1 w-full">
                        {isFullyBlocked ? (
                          <div className="text-[8px] font-bold text-red-100 bg-red-900/70 px-1 py-0.5 rounded text-center truncate tracking-wider uppercase">
                            Bloq.
                          </div>
                        ) : (
                          <>
                            {cellIntenciones.length > 0 && (
                              <div className={`text-[8px] font-bold px-1 py-0.5 rounded text-center truncate tracking-wider uppercase ${cell.dateStr === dates.hoy ? 'bg-white/20 text-white' : 'text-[#5B6B5B] bg-[#E8EFE8]'}`}>
                                {cellIntenciones.length} Res.
                              </div>
                            )}
                            {isPartiallyBlocked && (
                              <div className={`text-[8px] font-bold px-1 py-0.5 rounded text-center truncate tracking-wider uppercase ${cell.dateStr === dates.hoy ? 'bg-white/20 text-white' : 'text-[#8A7042] bg-[#F5F0E6]'}`}>
                                {cellRestricciones.length} Bloq.
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
          <div className="flex-1 animate-fade-in bg-[#FFFDF9] border border-[#EAE3D9] rounded-[2rem] p-6 md:p-10 shadow-2xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto pt-4">
              {/* Columna Izquierda */}
              <div className="space-y-12">
                
                {/* Control de Sacramentos */}
                <div>
                  <h3 className="font-serif text-base text-[#3D3A35] uppercase tracking-widest border-b border-[#EAE3D9] pb-3 mb-4">
                    Control de Sacramentos
                  </h3>
                  <p className="text-[#8C7A6B] text-xs font-light mb-6 leading-relaxed">
                    Habilite o deshabilite la disponibilidad de sacramentos (Comunión y Confirmación) para las reservas públicas.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between group">
                      <span className="font-sans text-[10px] font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                        Primera Comunión
                      </span>
                      <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px] group-hover:border-[#3D3A35]/40 transition-colors"></div>
                      <button
                        onClick={() => handleToggleSacrament('habilitar_comunion', config.habilitarComunion)}
                        disabled={isPending}
                        className={`shrink-0 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center transition-all shadow-sm ${
                          config.habilitarComunion ? 'bg-[#80385e] border-transparent text-white hover:bg-[#964a75]' : 'bg-[#E4CDDA] border-transparent text-[#80385e] hover:bg-[#D8B4C8]'
                        }`}
                      >
                        {config.habilitarComunion ? 'Activado' : 'Inactivo'}
                      </button>
                    </div>

                    <div className="flex flex-row items-center justify-between group">
                      <span className="font-sans text-[10px] font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                        Confirmación
                      </span>
                      <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px] group-hover:border-[#3D3A35]/40 transition-colors"></div>
                      <button
                        onClick={() => handleToggleSacrament('habilitar_confirmacion', config.habilitarConfirmacion)}
                        disabled={isPending}
                        className={`shrink-0 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center transition-all shadow-sm ${
                          config.habilitarConfirmacion ? 'bg-[#80385e] border-transparent text-white hover:bg-[#964a75]' : 'bg-[#E4CDDA] border-transparent text-[#80385e] hover:bg-[#D8B4C8]'
                        }`}
                      >
                        {config.habilitarConfirmacion ? 'Activado' : 'Inactivo'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Datos de Sesión */}
                <div>
                  <h3 className="font-serif text-base text-[#3D3A35] uppercase tracking-widest border-b border-[#EAE3D9] pb-3 mb-4">
                    Datos de la Sesión
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between group">
                      <span className="font-sans text-[10px] font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                        Usuario Activo
                      </span>
                      <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px]"></div>
                      <span className="font-serif italic text-[#8C7A6B] text-sm shrink-0">
                        {role === 'sacerdote' ? 'Padre' : 'Administrador'}
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-between group">
                      <span className="font-sans text-[10px] font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                        Nivel de Acceso
                      </span>
                      <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px]"></div>
                      <span className="font-serif italic text-[#8C7A6B] text-sm shrink-0 uppercase">
                        {role}
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-between group">
                      <span className="font-sans text-[10px] font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                        Parroquia
                      </span>
                      <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px]"></div>
                      <span className="font-serif italic text-[#8C7A6B] text-sm shrink-0 text-right max-w-[150px] leading-tight">
                        Nuestra Señora del Patrocinio
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Gestión de Horarios de Misa */}
              <div>
                <h3 className="font-serif text-base text-[#3D3A35] uppercase tracking-widest border-b border-[#EAE3D9] pb-3 mb-4">
                  Horarios de Misa
                </h3>
                <p className="text-[#8C7A6B] text-xs font-light mb-6 leading-relaxed">
                  Administre los horarios disponibles para intenciones. Estos se reflejarán de forma inmediata en las reservas.
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="time"
                    value={newScheduleTime}
                    onChange={(e) => {
                      setNewScheduleTime(e.target.value);
                      setScheduleError(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#EAE3D9] rounded-full text-xs text-[#3D3A35] focus:outline-none focus:border-[#3D3A35] text-center font-sans tracking-wide transition-colors shadow-sm"
                  />
                  <button
                    onClick={handleAddSchedule}
                    disabled={isPending || !newScheduleTime}
                    className="shrink-0 px-6 py-2.5 rounded-full border-transparent bg-[#80385e] text-white hover:bg-[#964a75] transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 shadow-sm"
                  >
                    Añadir
                  </button>
                </div>
                {scheduleError && (
                  <span className="text-[10px] text-[#B5336D] block mt-[-15px] mb-4 font-bold uppercase tracking-wider text-center">{scheduleError}</span>
                )}

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {config.horariosMisa.length === 0 ? (
                    <div className="text-center py-6 text-[#8C7A6B] italic font-serif text-sm">
                      No hay horarios configurados.
                    </div>
                  ) : (
                    config.horariosMisa.map((horario) => (
                      <div key={horario} className="flex flex-row items-center justify-between group">
                        <span className="font-sans text-xs font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                          {horario}
                        </span>
                        <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px] group-hover:border-[#3D3A35]/40 transition-colors"></div>
                        <button
                          onClick={() => handleRemoveSchedule(horario)}
                          disabled={isPending}
                          className="shrink-0 px-4 py-1.5 rounded-full border-transparent bg-[#B5336D] text-white hover:bg-[#972658] transition-all text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center shadow-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE RESTRICCIONES (Bloquear/Habilitar horarios o días enteros, solicitado por el usuario) */}
      {selectedCalendarDate && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FFFDF9] border border-[#EAE3D9] rounded-[2rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-scale-up">
            
            {/* Cabecera del Modal */}
            <div className="flex flex-col items-center justify-center pb-6 border-b border-[#EAE3D9] mb-6 relative">
              <h3 className="font-serif text-xl sm:text-2xl text-[#3D3A35] uppercase tracking-widest text-center mt-2">
                Restricciones
              </h3>
              <p className="text-xs text-[#8C7A6B] font-light mt-2 text-center max-w-[90%] uppercase tracking-widest">
                {getHumanFriendlyDate(selectedCalendarDate)}
              </p>
              <button
                onClick={() => { setSelectedCalendarDate(null); setRestrictionMotivo(''); }}
                className="absolute top-0 right-0 text-[#A5A29B] hover:text-[#3D3A35] text-2xl font-light p-1 leading-none transition-colors"
              >
                ×
              </button>

              <div className="mt-5 w-full">
                <input
                  id="motivo"
                  type="text"
                  value={restrictionMotivo}
                  onChange={(e) => setRestrictionMotivo(e.target.value)}
                  placeholder="Motivo del bloqueo (opcional)"
                  className="w-full px-4 py-2.5 bg-white border border-[#EAE3D9] rounded-full text-xs text-[#3D3A35] placeholder:text-[#A5A29B] focus:outline-none focus:border-[#3D3A35] text-center font-sans tracking-wide transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Listado estilo Menú */}
            <div className="space-y-4 mb-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Todo el Día */}
              <div className="flex flex-row items-center justify-between group">
                <span className="font-sans text-xs font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                  Todo el día
                </span>
                <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px] group-hover:border-[#3D3A35]/40 transition-colors"></div>
                {(() => {
                  const r = activeRestrictionsForSelectedDate.find(x => x.hora === null);
                  return r ? (
                    <button
                      onClick={() => handleRemoveRestriction(r.id)}
                      disabled={isPending}
                      className="shrink-0 px-4 py-1.5 rounded-full border border-[#80385e] text-[#80385e] hover:bg-[#80385e] hover:text-white transition-all text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center shadow-sm"
                    >
                      Habilitar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddRestriction(null)}
                      disabled={isPending || isSelectedDateFullyBlocked}
                      className={`shrink-0 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center transition-all shadow-sm ${
                        isSelectedDateFullyBlocked ? 'border-[#EAE3D9] text-[#A5A29B] bg-white cursor-not-allowed' : 'bg-[#80385e] border-transparent text-white hover:bg-[#964a75]'
                      }`}
                    >
                      Bloquear
                    </button>
                  );
                })()}
              </div>

              {/* Horarios Individuales */}
              {HORARIOS_DISPONIBLES.map(h => {
                const r = activeRestrictionsForSelectedDate.find(x => x.hora === h);
                return (
                  <div key={h} className="flex flex-row items-center justify-between group">
                    <span className="font-sans text-xs font-bold text-[#3D3A35] tracking-widest uppercase shrink-0">
                      {h}
                    </span>
                    <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA] mx-4 relative top-[-1px] group-hover:border-[#3D3A35]/40 transition-colors"></div>
                    {r ? (
                      <button
                        onClick={() => handleRemoveRestriction(r.id)}
                        disabled={isPending}
                        className="shrink-0 px-4 py-1.5 rounded-full border border-[#80385e] text-[#80385e] hover:bg-[#80385e] hover:text-white transition-all text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center shadow-sm"
                      >
                        Habilitar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddRestriction(h)}
                        disabled={isPending || isSelectedDateFullyBlocked}
                        className={`shrink-0 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest min-w-[95px] text-center transition-all shadow-sm ${
                          isSelectedDateFullyBlocked ? 'border-[#EAE3D9] text-[#A5A29B] bg-white cursor-not-allowed' : 'bg-[#80385e] border-transparent text-white hover:bg-[#964a75]'
                        }`}
                      >
                        Bloquear
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 pt-6 border-t border-[#EAE3D9]">
              <button
                onClick={() => { setSelectedCalendarDate(null); setRestrictionMotivo(''); }}
                className="w-full md:w-auto px-8 py-3 border border-[#3D3A35] text-[#3D3A35] hover:bg-[#3D3A35] hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setSelectedDate(selectedCalendarDate);
                  setSelectedCalendarDate(null);
                  setActiveMenu('today');
                }}
                className="text-[9px] font-bold text-[#8C7A6B] hover:text-[#3D3A35] uppercase tracking-widest transition-colors underline underline-offset-4"
              >
                Ver Misas de este Día
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
