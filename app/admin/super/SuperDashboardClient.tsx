"use client";

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  actualizarEstadoIntencion, 
  actualizarConfiguracion, 
  agregarHorarioMisa, 
  eliminarHorarioMisa,
  agregarRestriccion,
  eliminarRestriccionPorId,
  agregarFeligres,
  eliminarFeligres,
  actualizarFeligres,
  obtenerServiciosLiturgicos,
  actualizarServicioLiturgico
} from '../../actions/misaActions';
import { logoutAdminAction } from '../../actions/authActions';

interface Feligres {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string | null;
  createdAtStr: string;
}

interface Intencion {
  id: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  tipoIntencion: string;
  nombreIntencion: string;
  fechaMisaStr: string;
  horaMisa: string;
  montoOfrenda: number;
  codigoYape: string;
  estado: string;
}

interface Restriccion {
  id: string;
  fechaStr: string;
  hora: string | null;
  motivo: string | null;
}

interface SystemConfig {
  habilitarComunion: boolean;
  habilitarConfirmacion: boolean;
  horariosMisa: string[];
}

interface SuperDashboardClientProps {
  initialIntenciones: Intencion[];
  initialConfig: SystemConfig;
  initialFeligreses: Feligres[];
  initialRestricciones: Restriccion[];
}

export default function SuperDashboardClient({
  initialIntenciones,
  initialConfig,
  initialFeligreses,
  initialRestricciones
}: SuperDashboardClientProps) {
  const router = useRouter();
  const [intenciones, setIntenciones] = useState<Intencion[]>(initialIntenciones);
  const [feligreses, setFeligreses] = useState<Feligres[]>(initialFeligreses);
  const [restricciones, setRestricciones] = useState<Restriccion[]>(initialRestricciones);
  const [config, setConfig] = useState<SystemConfig>(initialConfig);
  const [isPending, startTransition] = useTransition();

  // Navegación
  const [activeMenu, setActiveMenu] = useState<'overview' | 'requests' | 'feligreses' | 'blocks' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados de formularios y modales
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Bloqueos de fecha
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [blockMotif, setBlockMotif] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);

  // Feligrés Modal
  const [isFeligresModalOpen, setIsFeligresModalOpen] = useState(false);
  const [editingFeligres, setEditingFeligres] = useState<Feligres | null>(null);
  const [feligresNombre, setFeligresNombre] = useState("");
  const [feligresEmail, setFeligresEmail] = useState("");
  const [feligresTelefono, setFeligresTelefono] = useState("");
  const [feligresDireccion, setFeligresDireccion] = useState("");
  const [feligresError, setFeligresError] = useState<string | null>(null);

  // Gestión Dinámica de Servicios/Precios (Base de Datos)
  const [servicios, setServicios] = useState<any[]>([]);
  const [editingServicio, setEditingServicio] = useState<any | null>(null);
  const [servicioMonto, setServicioMonto] = useState("");
  const [servicioDesc, setServicioDesc] = useState("");
  const [servicioActivo, setServicioActivo] = useState(true);
  const [servicioError, setServicioError] = useState<string | null>(null);

  const cargarServicios = async () => {
    const res = await obtenerServiciosLiturgicos();
    if (res.success && res.data) {
      setServicios(res.data);
    }
  };

  const handleSaveServicio = async () => {
    if (!editingServicio) return;
    const precio = parseFloat(servicioMonto);
    if (isNaN(precio) || precio < 0) {
      setServicioError("Por favor ingrese un precio válido mayor o igual a 0.");
      return;
    }
    setServicioError(null);
    const res = await actualizarServicioLiturgico(editingServicio.id, precio, servicioDesc, servicioActivo);
    if (res.success) {
      await cargarServicios();
      setEditingServicio(null);
    } else {
      setServicioError(res.error || "No se pudo actualizar el servicio.");
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // Filtros de Solicitudes
  const [activeTab, setActiveTab] = useState<'hoy' | 'manana' | 'proximas' | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('TODOS');
  const [customDate, setCustomDate] = useState('');

  // Logout
  const handleLogout = async () => {
    if (confirm("¿Está seguro de que desea cerrar la sesión de Super Administrador?")) {
      const res = await logoutAdminAction();
      if (res.success) {
        router.push('/admin/login');
        router.refresh();
      }
    }
  };

  // Acciones: Solicitud de Misas / Sacramentos
  const handleStatusChange = async (id: string, nuevoEstado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') => {
    startTransition(async () => {
      const res = await actualizarEstadoIntencion(id, nuevoEstado);
      if (res.success && res.data) {
        setIntenciones(prev => prev.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item));
        router.refresh();
      } else {
        alert(res.error || "No se pudo actualizar el estado de la reserva.");
      }
    });
  };

  // Acciones: Sacramentos Toggle
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

  // Acciones: Horarios
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

  // Acciones: Restricciones de Fecha (Bloqueos)
  const handleAddBlock = () => {
    if (!blockDate) {
      setBlockError("Debe seleccionar una fecha para bloquear.");
      return;
    }

    const formattedTime = blockTime ? blockTime : null; // Si no hay hora, bloquea todo el día
    const motif = blockMotif ? blockMotif : "Actividad Parroquial";

    startTransition(async () => {
      const res = await agregarRestriccion(blockDate, formattedTime, motif);
      if (res.success && res.data) {
        setRestricciones(prev => [...prev, res.data as Restriccion]);
        setBlockDate("");
        setBlockTime("");
        setBlockMotif("");
        setBlockError(null);
        router.refresh();
      } else {
        setBlockError(res.error || "No se pudo agregar la restricción.");
      }
    });
  };

  const handleRemoveBlock = (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este bloqueo de horario?")) return;

    startTransition(async () => {
      const res = await eliminarRestriccionPorId(id);
      if (res.success) {
        setRestricciones(prev => prev.filter(r => r.id !== id));
        router.refresh();
      } else {
        alert(res.error || "No se pudo eliminar la restricción.");
      }
    });
  };

  // Acciones: CRUD Feligreses
  const openFeligresModal = (feligres: Feligres | null) => {
    if (feligres) {
      setEditingFeligres(feligres);
      setFeligresNombre(feligres.nombre);
      setFeligresEmail(feligres.email);
      setFeligresTelefono(feligres.telefono);
      setFeligresDireccion(feligres.direccion || "");
    } else {
      setEditingFeligres(null);
      setFeligresNombre("");
      setFeligresEmail("");
      setFeligresTelefono("");
      setFeligresDireccion("");
    }
    setFeligresError(null);
    setIsFeligresModalOpen(true);
  };

  const handleSaveFeligres = () => {
    if (!feligresNombre || !feligresEmail || !feligresTelefono) {
      setFeligresError("Nombre, Correo y Celular son requeridos.");
      return;
    }

    startTransition(async () => {
      if (editingFeligres) {
        // Editar
        const res = await actualizarFeligres(editingFeligres.id, feligresNombre, feligresEmail, feligresTelefono, feligresDireccion);
        if (res.success && res.data) {
          setFeligreses(prev => prev.map(f => f.id === editingFeligres.id ? (res.data as Feligres) : f));
          setIsFeligresModalOpen(false);
          router.refresh();
        } else {
          setFeligresError(res.error || "No se pudo actualizar el feligrés.");
        }
      } else {
        // Crear nuevo
        const res = await agregarFeligres(feligresNombre, feligresEmail, feligresTelefono, feligresDireccion);
        if (res.success && res.data) {
          setFeligreses(prev => [...prev, res.data as Feligres]);
          setIsFeligresModalOpen(false);
          router.refresh();
        } else {
          setFeligresError(res.error || "No se pudo registrar el feligrés.");
        }
      }
    });
  };

  const handleDeleteFeligres = (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este feligrés de la base de datos?")) return;

    startTransition(async () => {
      const res = await eliminarFeligres(id);
      if (res.success) {
        setFeligreses(prev => prev.filter(f => f.id !== id));
        router.refresh();
      } else {
        alert(res.error || "No se pudo eliminar el feligrés.");
      }
    });
  };

  // Filtrado de solicitudes para vista Misas y Sacramentos
  const filteredIntenciones = useMemo(() => {
    return intenciones.filter((item) => {
      // 1. Filtrado por pestaña de tiempo
      const itemDate = new Date(item.fechaMisaStr + "T00:00:00");
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (activeTab === 'hoy') {
        const itemDateStr = item.fechaMisaStr;
        const todayStr = today.toISOString().split('T')[0];
        if (itemDateStr !== todayStr) return false;
      } else if (activeTab === 'manana') {
        const itemDateStr = item.fechaMisaStr;
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        if (itemDateStr !== tomorrowStr) return false;
      } else if (activeTab === 'proximas') {
        if (itemDate < today) return false;
      }

      // 2. Filtrado por fecha personalizada
      if (customDate) {
        if (item.fechaMisaStr !== customDate) return false;
      }

      // 3. Filtrado por Tipo
      if (selectedTipo !== 'TODOS') {
        if (selectedTipo === 'SACRAMENTO') {
          const sacramentos = ['BAUTIZO', 'COMUNION', 'CONFIRMACION', 'MATRIMONIO'];
          if (!sacramentos.includes(item.tipoIntencion)) return false;
        } else {
          if (item.tipoIntencion !== selectedTipo) return false;
        }
      }

      // 4. Filtrado por Buscador
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
  }, [intenciones, activeTab, searchQuery, selectedTipo, customDate]);

  // Métricas para pestaña Overview
  const metrics = useMemo(() => {
    const total = intenciones.length;
    const pendientes = intenciones.filter(i => i.estado === 'PENDIENTE').length;
    const aprobadas = intenciones.filter(i => i.estado === 'APROBADO');
    const ofrendaTotal = aprobadas.reduce((sum, item) => sum + item.montoOfrenda, 0);

    // Contadores por sacramentos / tipo
    const counts = intenciones.reduce((acc, curr) => {
      acc[curr.tipoIntencion] = (acc[curr.tipoIntencion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      pendientes,
      aprobadas: aprobadas.length,
      ofrendaTotal,
      counts
    };
  }, [intenciones]);

  // Etiquetas para tipo de intención
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

  const getHumanFriendlyDate = (fechaStr: string) => {
    try {
      const parts = fechaStr.split('-');
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

      {/* SIDEBAR SUPER ADMIN */}
      <aside className={`no-print w-64 bg-[#FAF9F6] border-r border-[#EBEAE5] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo Parroquia */}
          <div className="p-6 flex items-center gap-3">
            <div className="text-amber-600 shrink-0">
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
              <h2 className="font-serif text-[#5C4E3C] font-bold text-base leading-tight uppercase tracking-wider">
                Parroquia
              </h2>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-none block">
                Super Admin
              </span>
            </div>
          </div>

          {/* Menú */}
          <nav className="px-3 mt-6 space-y-1.5 font-sans">
            {/* Overview */}
            <button
              onClick={() => { setActiveMenu('overview'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'overview' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-amber-600' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                <span>Monitoreo</span>
              </div>
            </button>

            {/* Solicitudes */}
            <button
              onClick={() => { setActiveMenu('requests'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'requests' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-amber-600' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Solicitudes</span>
              </div>
            </button>

            {/* Feligreses */}
            <button
              onClick={() => { setActiveMenu('feligreses'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'feligreses' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-amber-600' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Feligreses</span>
              </div>
            </button>

            {/* Bloqueos */}
            <button
              onClick={() => { setActiveMenu('blocks'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'blocks' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-amber-600' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Restricciones</span>
              </div>
            </button>

            {/* Configuración */}
            <button
              onClick={() => { setActiveMenu('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-r-4 ${activeMenu === 'settings' ? 'bg-[#F5EFEB] text-[#5C4E3C] border-amber-600' : 'text-[#7A766F] hover:text-[#3D3A35] hover:bg-[#FAF9F6] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Ajustes Parroquia</span>
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        
        {/* ============================================= */}
        {/* 1. SECCIÓN DE MONITOREO (OVERVIEW)           */}
        {/* ============================================= */}
        {activeMenu === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                ☰
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">
                  Panel de Monitoreo General
                </h1>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Super Administrador / Vista Global
                </p>
              </div>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudación Total</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs text-slate-400">S/.</span>
                  <span className="text-3xl font-bold text-slate-950">{metrics.ofrendaTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solicitudes Pendientes</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-amber-500">{metrics.pendientes}</span>
                  <span className="text-xs text-slate-500">verificar pago</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feligreses Activos</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-indigo-500">{feligreses.length}</span>
                  <span className="text-xs text-slate-500">registrados</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fechas Restringidas</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-rose-500">{restricciones.length}</span>
                  <span className="text-xs text-slate-500">bloqueos activos</span>
                </div>
              </div>
            </div>

            {/* Distribución por Categorías */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Reservas por Categoría / Sacramento
                </h3>
                <div className="space-y-3">
                  {Object.entries(getIntencionLabelMap(metrics.counts)).map(([tipo, count]) => {
                    const pct = metrics.total ? Math.round((count / metrics.total) * 100) : 0;
                    return (
                      <div key={tipo} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span>{getIntencionLabel(tipo)}</span>
                          <span className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-amber-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                    Estado del Servidor y Base de Datos
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl">
                      <span className="font-bold">Salud del Sistema:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">ÓPTIMO</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-2xl">
                      <span className="font-bold">Base de Datos PostgreSQL:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200">CONECTADO</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl">
                      <span className="font-bold">Cliente Prisma:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300">ACTIVO</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 italic text-center mt-4">
                  Sistema Parroquial Digital - Versión 1.2 (Turbopack)
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================= */}
        {/* 2. SECCIÓN DE SOLICITUDES                     */}
        {/* ============================================= */}
        {activeMenu === 'requests' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                ☰
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">
                  Control de Solicitudes y Sacramentos
                </h1>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Super Administrador / Control Total
                </p>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* Tabs */}
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
                  {/* Selector Fecha */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Fecha:</span>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setActiveTab('todas');
                      }}
                      className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  {/* Selector Tipo */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Tipo:</span>
                    <select
                      value={selectedTipo}
                      onChange={(e) => setSelectedTipo(e.target.value)}
                      className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-600"
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
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-[#FAF9F6]/50 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Listado */}
            <div className="space-y-4 font-sans">
              {filteredIntenciones.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                  </svg>
                  <p className="text-slate-500 font-bold text-sm">No se encontraron solicitudes</p>
                </div>
              ) : (
                filteredIntenciones.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${item.estado === 'PENDIENTE' ? 'border-amber-100' : item.estado === 'APROBADO' ? 'border-emerald-100' : 'border-red-100'}`}
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getTipoBadgeStyle(item.tipoIntencion)}`}>
                          {getIntencionLabel(item.tipoIntencion)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                          🕒 {item.horaMisa}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.estado === 'APROBADO' ? 'bg-emerald-50 text-emerald-700' : item.estado === 'RECHAZADO' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          {item.estado}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-800">
                          Intención: <span className="font-serif italic text-slate-900 font-normal">"{item.nombreIntencion}"</span>
                        </h3>
                        <p className="text-xs font-semibold text-amber-600 mt-1">
                          📅 {getHumanFriendlyDate(item.fechaMisaStr)}
                        </p>
                      </div>

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

                    <div className="flex flex-row md:flex-col justify-end gap-2.5 md:w-44 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {item.estado === 'PENDIENTE' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, 'APROBADO')}
                            disabled={isPending}
                            className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm text-center active:scale-97 disabled:opacity-50 cursor-pointer"
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

        {/* ============================================= */}
        {/* 3. SECCIÓN DE FELIGRESES                      */}
        {/* ============================================= */}
        {activeMenu === 'feligreses' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-slate-200 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  ☰
                </button>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">
                    Registro de Feligreses
                  </h1>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Super Administrador / Comunidad
                  </p>
                </div>
              </div>
              <button
                onClick={() => openFeligresModal(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                Registrar Feligrés
              </button>
            </div>

            {/* Listado de Feligreses */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Nombre Completo</th>
                    <th className="py-3 px-4">Correo Electrónico</th>
                    <th className="py-3 px-4">Teléfono Celular</th>
                    <th className="py-3 px-4">Dirección</th>
                    <th className="py-3 px-4">Fecha de Registro</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {feligreses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                        No hay feligreses registrados en el sistema.
                      </td>
                    </tr>
                  ) : (
                    feligreses.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-950">{f.nombre}</td>
                        <td className="py-3 px-4 font-mono">{f.email}</td>
                        <td className="py-3 px-4">{f.telefono}</td>
                        <td className="py-3 px-4 truncate max-w-[200px]">{f.direccion || <span className="text-slate-300 italic">No especificado</span>}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{f.createdAtStr}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openFeligresModal(f)}
                            className="p-1 px-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer text-[10px]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteFeligres(f.id)}
                            className="p-1 px-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 cursor-pointer text-[10px]"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================= */}
        {/* 4. SECCIÓN DE RESTRICCIONES (BLOQUEOS)        */}
        {/* ============================================= */}
        {activeMenu === 'blocks' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                ☰
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">
                  Restricciones de Horarios y Calendario
                </h1>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Super Administrador / Bloqueos de Fechas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario de Bloqueo */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm h-fit">
                <h3 className="font-serif font-bold text-[#5C4E3C] text-sm mb-4 border-b border-[#FAF9F6] pb-2">
                  Bloquear Fecha / Horario
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-6">
                  Bloquee un día completo o un horario específico para que los feligreses no puedan agendar misas en momentos de mantenimiento, actividades especiales o feriados.
                </p>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha a Bloquear *</label>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => {
                        setBlockDate(e.target.value);
                        setBlockError(null);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Horario Específico (Opcional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 06:00 PM (Dejar vacío para todo el día)"
                      value={blockTime}
                      onChange={(e) => setBlockTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800 placeholder-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Motivo o Descripción</label>
                    <input
                      type="text"
                      placeholder="e.g. Mantenimiento del Altar"
                      value={blockMotif}
                      onChange={(e) => setBlockMotif(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800"
                    />
                  </div>

                  {blockError && (
                    <span className="text-[10px] text-red-600 font-medium block mt-1">{blockError}</span>
                  )}

                  <button
                    onClick={handleAddBlock}
                    disabled={isPending}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-97 cursor-pointer"
                  >
                    Registrar Restricción
                  </button>
                </div>
              </div>

              {/* Lista de Restricciones */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm lg:col-span-2">
                <h3 className="font-serif font-bold text-[#5C4E3C] text-sm mb-4 border-b border-[#FAF9F6] pb-2">
                  Bloqueos Activos en el Sistema ({restricciones.length})
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 text-xs">
                  {restricciones.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      No hay bloqueos registrados.
                    </div>
                  ) : (
                    restricciones.map(r => (
                      <div key={r.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-amber-600/30 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 font-mono">{r.fechaStr}</span>
                            <span className="px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase bg-rose-50 text-rose-700 border-rose-100">
                              {r.hora ? r.hora : "Todo el Día"}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] font-semibold">{r.motivo || 'Actividad Parroquial'}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveBlock(r.id)}
                          disabled={isPending}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all active:scale-95 cursor-pointer"
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

        {/* ============================================= */}
        {/* 5. SECCIÓN DE AJUSTES                         */}
        {/* ============================================= */}
        {activeMenu === 'settings' && (
          <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-[#3D3A35] hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                ☰
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">
                  Configuración del Sistema
                </h1>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Super Administrador / Ajustes Parroquia
                </p>
              </div>
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
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${config.habilitarComunion ? 'bg-amber-600' : 'bg-slate-300'}`}
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
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${config.habilitarConfirmacion ? 'bg-amber-600' : 'bg-slate-300'}`}
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
                        className="w-full px-3 py-2 border border-[#EBEAE5] bg-white rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:ring-1 focus:ring-amber-600"
                      />
                    </div>
                    <button
                      onClick={handleAddSchedule}
                      disabled={isPending || !newScheduleTime}
                      className="py-2 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 shrink-0 cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                  {scheduleError && (
                    <span className="text-[10px] text-red-600 block mt-2 font-medium">{scheduleError}</span>
                  )}
                </div>

                {/* Listado de horarios actuales */}
                <div className="flex-1 text-xs">
                  <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2">
                    Horarios Disponibles ({config.horariosMisa.length})
                  </span>

                  {config.horariosMisa.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic border border-dashed border-[#EBEAE5] rounded-2xl bg-slate-50">
                      No hay horarios configurados en el sistema.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {config.horariosMisa.map((horario) => (
                        <div
                          key={horario}
                          className="flex items-center justify-between p-3 border border-[#EBEAE5] rounded-xl bg-white hover:border-amber-600/30 transition-all"
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

            {/* Gestión de Tarifas de Ofrendas y Requisitos */}
            <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 shadow-sm">
              <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-2 border-b border-[#FAF9F6] pb-2">
                Tarifario de Ofrendas y Requisitos de Servicios
              </h3>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-6">
                Configure los montos sugeridos de las ofrendas para intenciones de misas y sacramentos. También puede ajustar las descripciones y requisitos de cada celebración.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="border border-[#EBEAE5] rounded-2xl p-4 bg-[#FAF9F6] hover:border-amber-600/30 transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-100">
                        <span className="font-bold text-[#5C4E3C] text-xs truncate max-w-[140px]" title={servicio.nombre}>
                          {servicio.nombre}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          servicio.categoria === "SACRAMENTO"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {servicio.categoria}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed mb-3 h-8">
                        {servicio.description || "Sin descripción cargada."}
                      </p>
                      
                      {/* Detalles de Configuración / Banderas */}
                      <div className="space-y-1 text-[9px] text-slate-400 font-semibold mb-4 border-t border-slate-100 pt-2">
                        <div className="flex justify-between">
                          <span>Monto Sugerido:</span>
                          <span className="text-slate-700 font-bold">S/. {servicio.montoSugerido.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Requiere Festejado:</span>
                          <span className="text-slate-600">{servicio.requiereFestejado ? "Sí" : "No"}</span>
                        </div>
                        {servicio.requierePadresPadrinos && (
                          <div className="flex justify-between">
                            <span>Padres/Padrinos:</span>
                            <span className="text-slate-600">Sí</span>
                          </div>
                        )}
                        {servicio.documentosRequeridos && (
                          <div className="flex justify-between">
                            <span>Documentos:</span>
                            <span className="text-slate-500 text-right truncate max-w-[120px]">{servicio.documentosRequeridos}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingServicio(servicio);
                        setServicioMonto(servicio.montoSugerido.toString());
                        setServicioDesc(servicio.description);
                        setServicioActivo(servicio.activo);
                        setServicioError(null);
                      }}
                      className="w-full py-2 bg-white border border-[#EBEAE5] text-[#5C4E3C] hover:bg-slate-50 text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-3xs active:scale-98"
                    >
                      ✏️ Editar Servicio
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal para Editar Servicio */}
            {editingServicio && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white rounded-3xl border border-[#EBEAE5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center border-b border-[#FAF9F6] pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-[#5C4E3C] text-base">
                        Editar Servicio Parroquial
                      </h4>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        {editingServicio.nombre}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingServicio(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {servicioError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                      ⚠️ {servicioError}
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5C4E3C] uppercase tracking-wider mb-1.5">
                        Monto Ofrenda Sugerida (S/.) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={servicioMonto}
                        onChange={(e) => setServicioMonto(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#5C4E3C] uppercase tracking-wider mb-1.5">
                        Descripción o Requisitos
                      </label>
                      <textarea
                        rows={3}
                        value={servicioDesc}
                        onChange={(e) => setServicioDesc(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-700 text-xs resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <span className="font-bold text-[#5C4E3C] text-xs block">Estado de Servicio</span>
                        <span className="text-[10px] text-slate-400">Permitir reservas de este servicio</span>
                      </div>
                      <button
                        onClick={() => setServicioActivo(!servicioActivo)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${servicioActivo ? 'bg-amber-600' : 'bg-slate-300'}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${servicioActivo ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditingServicio(null)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-3xs"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveServicio}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-3xs"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ============================================= */}
      {/* MODAL: CREAR / EDITAR FELIGRÉS                */}
      {/* ============================================= */}
      {isFeligresOpenModalCheck(isFeligresModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#EBEAE5] rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-scale-up">
            <h3 className="font-serif font-bold text-[#5C4E3C] text-base mb-4 border-b border-slate-100 pb-2">
              {editingFeligres ? "Modificar Datos de Feligrés" : "Registrar Nuevo Feligrés"}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="e.g. Juan Pérez"
                  value={feligresNombre}
                  onChange={(e) => setFeligresNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  placeholder="e.g. juan.perez@email.com"
                  value={feligresEmail}
                  onChange={(e) => setFeligresEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Celular / Teléfono *</label>
                <input
                  type="text"
                  placeholder="e.g. 912345678"
                  value={feligresTelefono}
                  onChange={(e) => setFeligresTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección (Opcional)</label>
                <input
                  type="text"
                  placeholder="e.g. Av. Larco 123, Lima"
                  value={feligresDireccion}
                  onChange={(e) => setFeligresDireccion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-800"
                />
              </div>

              {feligresError && (
                <span className="text-[10px] text-red-600 font-medium block">{feligresError}</span>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsFeligresModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFeligres}
                  disabled={isPending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-sm active:scale-97 cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                >
                  Guardar Feligrés
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helpers locales
function isFeligresOpenModalCheck(open: boolean) {
  return open;
}

function getIntencionLabelMap(counts: Record<string, number>) {
  // Asegura retornar un mapa ordenado para evitar errores de renderizado
  return counts;
}
