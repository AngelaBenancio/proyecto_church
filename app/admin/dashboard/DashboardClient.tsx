"use client";

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { actualizarEstadoIntencion } from '../../actions/misaActions';
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

interface DashboardClientProps {
  initialIntenciones: any[];
}

export default function DashboardClient({ initialIntenciones }: DashboardClientProps) {
  const router = useRouter();
  const [intenciones, setIntenciones] = useState<Intencion[]>(initialIntenciones as Intencion[]);
  const [isPending, startTransition] = useTransition();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div className="flex items-center gap-4">
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
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm hover:shadow-red-200 active:scale-98"
          >
            Cerrar Sesión
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
            {/* Selector de fecha personalizado */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Día Específico:</span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setActiveTab('todas'); // deselecciona tabs
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80385e]/25 text-xs text-slate-800"
              />
            </div>

            {/* Selector de categoría */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Categoría:</span>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80385e]/25 text-xs text-slate-800"
              >
                <option value="TODOS">Todos los motivos</option>
                <option value="DIFUNTO">Misa de Difunto</option>
                <option value="SALUD">Por la Salud</option>
                <option value="CUMPLEANOS">Cumpleaños</option>
                <option value="ACCION_DE_GRACIAS">Acción de Gracias</option>
                <option value="SACRAMENTO">Sacramentos (Bautizo, etc.)</option>
                <option value="OTRO">Otro motivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buscador de texto */}
        <div className="relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por solicitante, intención, celular, correo o código de operación Yape..."
            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#80385e]/25 focus:border-[#80385e] transition-colors text-sm text-slate-800"
          />
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        {filteredIntenciones.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Sin Intenciones Registradas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No hay intenciones de misa ni sacramentos agendados que coincidan con los filtros seleccionados en este momento.
            </p>
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
                      className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-emerald-100 text-center active:scale-97 disabled:opacity-50"
                    >
                      Aprobar Pago
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'RECHAZADO')}
                      disabled={isPending}
                      className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xl transition-all text-center active:scale-97 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStatusChange(item.id, 'PENDIENTE')}
                    disabled={isPending}
                    className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-center active:scale-97 disabled:opacity-50"
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
  );
}
