"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { crearIntencionMisa, obtenerIntencionesPorMes } from "../../actions/misaActions";

const HORARIOS_MISA = ["07:00 AM", "06:00 PM", "07:00 PM"];
const TIPOS_INTENCION = [
  { id: "DIFUNTO", label: "Difunto 🕯️", description: "Oración por el eterno descanso" },
  { id: "SALUD", label: "Salud 🏥", description: "Petición por la recuperación y sanación" },
  { id: "ACCION_DE_GRACIAS", label: "Acción de Gracias 🙌", description: "Agradecimiento por favores concedidos" },
  { id: "CUMPLEANOS", label: "Cumpleaños 🎂", description: "Acción de gracias por un año más de vida" },
  { id: "OTRO", label: "Otro motivo 🌟", description: "Intenciones varias de la comunidad" },
];

export default function NuevaMisaPage() {
  // Estados de carga y éxito
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ trackingId: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Datos de la intención (Fecha y Hora)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>("");

  // Datos del formulario
  const [nombreSolicitante, setNombreSolicitante] = useState("");
  const [emailSolicitante, setEmailSolicitante] = useState("");
  const [telefonoSolicitante, setTelefonoSolicitante] = useState("");
  const [tipoIntencion, setTipoIntencion] = useState("DIFUNTO");
  const [nombreIntencion, setNombreIntencion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [montoOfrenda, setMontoOfrenda] = useState("10.00");
  const [codigoYape, setCodigoYape] = useState("");

  // Registro de intenciones previas para mostrar en el calendario
  const [intencionesPorFecha, setIntencionesPorFecha] = useState<Record<string, string[]>>({});

  // Navegación del Calendario
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-indexed

  // Cargar intenciones del mes seleccionado para mostrar ocupación
  useEffect(() => {
    async function cargarIntenciones() {
      const data = await obtenerIntencionesPorMes(currentYear, currentMonth);
      setIntencionesPorFecha(data);
    }
    cargarIntenciones();
  }, [currentYear, currentMonth]);

  // Validaciones del formulario
  const isNombreValido = nombreSolicitante.trim().length >= 3;
  const isEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSolicitante);
  const isTelefonoValido = /^9\d{8}$/.test(telefonoSolicitante);
  const isNombreIntencionValido = nombreIntencion.trim().length >= 3;
  const isFechaValida = selectedDate !== null;
  const isHoraValida = selectedHour !== "";
  const isMontoValido = parseFloat(montoOfrenda) >= 0 && !isNaN(parseFloat(montoOfrenda));
  const isYapeValido = /^\d{3}$/.test(codigoYape);

  const isFormValido =
    isNombreValido &&
    isEmailValido &&
    isTelefonoValido &&
    isNombreIntencionValido &&
    isFechaValida &&
    isHoraValida &&
    isMontoValido &&
    isYapeValido;

  // Filtros de Teclado Estrictos (Front-End)
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/\D/g, ""); // Solo dígitos
    const trimmedVal = cleanVal.slice(0, 9); // Recortar estrictamente a 9
    setTelefonoSolicitante(trimmedVal);
  };

  const handleYapeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/\D/g, ""); // Solo dígitos
    const trimmedVal = cleanVal.slice(0, 3); // Recortar estrictamente a 3
    setCodigoYape(trimmedVal);
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Solo permitir números y un punto decimal
    const cleanVal = rawVal.replace(/[^0-9.]/g, "");
    // Evitar múltiples puntos decimales
    const parts = cleanVal.split(".");
    if (parts.length > 2) return;
    setMontoOfrenda(cleanVal);
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValido || !selectedDate) return;

    setLoading(true);
    setServerError(null);

    // Formatear fecha local a string ISO seguro
    const anio = selectedDate.getFullYear();
    const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dia = String(selectedDate.getDate()).padStart(2, "0");
    const fechaMisaStr = `${anio}-${mes}-${dia}`;

    const res = await crearIntencionMisa({
      nombreSolicitante,
      emailSolicitante,
      telefonoSolicitante,
      tipoIntencion,
      nombreIntencion,
      fechaMisaStr,
      horaMisa: selectedHour,
      montoOfrenda: parseFloat(montoOfrenda) || 0,
      codigoYape,
    });

    setLoading(false);

    if (res.success && res.trackingId) {
      setSuccessData({ trackingId: res.trackingId });
    } else {
      setServerError(res.error || "Ocurrió un error al procesar el formulario.");
    }
  };

  // Generador de Días del Calendario
  const obtenerDiasEnMes = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const obtenerPrimerDiaSemana = (year: number, month: number) => new Date(year, month, 1).getDay();

  const diasEnMes = obtenerDiasEnMes(currentYear, currentMonth);
  const primerDiaSemana = obtenerPrimerDiaSemana(currentYear, currentMonth); // 0 (Dom) a 6 (Sab)

  // Crear la cuadrícula del calendario
  const celdasCalendario: (Date | null)[] = [];
  // Celdas vacías antes del primer día
  for (let i = 0; i < primerDiaSemana; i++) {
    celdasCalendario.push(null);
  }
  // Celdas con días
  for (let i = 1; i <= diasEnMes; i++) {
    celdasCalendario.push(new Date(currentYear, currentMonth, i));
  }

  // Navegar meses
  const mesSiguiente = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const mesAnterior = () => {
    // No permitir ir al pasado del mes actual
    const fechaActual = new Date();
    if (currentYear === fechaActual.getFullYear() && currentMonth === fechaActual.getMonth()) {
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Comprobar si una fecha está en el pasado
  const esFechaPasada = (date: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy < hoy;
  };

  // Comprobar si una fecha está seleccionada
  const esFechaSeleccionada = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 pb-24 font-sans selection:bg-amber-100">
      {/* Header Fino de Navegación */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-stone-200/60 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
          >
            <span className="text-sm font-semibold">&larr;</span> Volver al Inicio
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Despacho Parroquial</span>
          </div>
        </div>
      </header>

      {/* Título Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2 block">
            Misas Parroquiales
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-800 tracking-tight leading-tight">
            Registrar Intención de Misa
          </h1>
          <p className="text-sm text-stone-500 mt-2 font-light max-w-xl">
            Complete los datos de la intención y adjunte la ofrenda comunitaria vía Yape. Su intención se leerá durante la liturgia en el día y hora indicados.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {successData ? (
          /* PANTALLA DE ÉXITO */
          <div className="max-w-2xl mx-auto bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
            
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-800 tracking-tight mb-3">
              ¡Intención Registrada!
            </h2>
            <p className="text-sm text-stone-500 font-light mb-8 max-w-md mx-auto">
              Su solicitud fue enviada con éxito. El despacho parroquial verificará su ofrenda y le enviará la confirmación correspondiente.
            </p>

            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 text-left mb-8 max-w-md mx-auto">
              <div className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4 border-b border-stone-200/60 pb-2">
                Resumen de Solicitud
              </div>
              <div className="grid grid-cols-3 gap-y-3 text-xs">
                <span className="text-stone-400 font-light">Código de Seguimiento:</span>
                <span className="col-span-2 font-mono font-bold text-stone-700 break-all select-all">{successData.trackingId}</span>

                <span className="text-stone-400 font-light">Solicitante:</span>
                <span className="col-span-2 text-stone-700 font-medium">{nombreSolicitante}</span>

                <span className="text-stone-400 font-light">Intención por:</span>
                <span className="col-span-2 text-stone-700 font-medium">{nombreIntencion} ({tipoIntencion})</span>

                <span className="text-stone-400 font-light">Fecha de Misa:</span>
                <span className="col-span-2 text-stone-700 font-medium">
                  {selectedDate?.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>

                <span className="text-stone-400 font-light">Horario:</span>
                <span className="col-span-2 text-stone-700 font-medium">{selectedHour}</span>

                <span className="text-stone-400 font-light">Ofrenda Yape:</span>
                <span className="col-span-2 text-stone-700 font-medium">S/. {montoOfrenda} (Código: ***{codigoYape})</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setNombreSolicitante("");
                  setEmailSolicitante("");
                  setTelefonoSolicitante("");
                  setNombreIntencion("");
                  setMensaje("");
                  setCodigoYape("");
                  setSelectedDate(null);
                  setSelectedHour("");
                }}
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors rounded-xl cursor-pointer"
              >
                Registrar Otra Intención
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 transition-colors rounded-xl"
              >
                Volver a la Página Principal
              </Link>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO EN DOS COLUMNAS */
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* COLUMNA IZQUIERDA: CALENDARIO E INSTRUCCIONES DE YAPE */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              
              {/* Bloque 1: Calendario de Selección de Fecha */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">1. Seleccione la Fecha</h3>
                    <p className="text-[10px] text-stone-400 font-light">Disponibilidad en tiempo real</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={mesAnterior}
                      className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={
                        currentYear === new Date().getFullYear() &&
                        currentMonth === new Date().getMonth()
                      }
                    >
                      &larr;
                    </button>
                    <span className="text-xs font-bold text-stone-700 min-w-[100px] text-center">
                      {mesesNombres[currentMonth]} {currentYear}
                    </span>
                    <button
                      type="button"
                      onClick={mesSiguiente}
                      className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 cursor-pointer"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>

                {/* Grid del Calendario */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 uppercase mb-2">
                  <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {celdasCalendario.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const esPasado = esFechaPasada(day);
                    const esSeleccionada = esFechaSeleccionada(day);
                    const formattedDate = day.toISOString().split("T")[0];
                    const horasOcupadas = intencionesPorFecha[formattedDate] || [];
                    const esDiaLleno = horasOcupadas.length >= HORARIOS_MISA.length;

                    return (
                      <button
                        key={formattedDate}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day);
                          setServerError(null);
                          setSelectedHour(""); // Resetear hora seleccionada al cambiar de fecha
                        }}
                        disabled={esPasado || esDiaLleno}
                        className={`
                          aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 border transition-all duration-200 cursor-pointer
                          ${esPasado 
                            ? "bg-stone-50 text-stone-300 border-stone-100/50 cursor-not-allowed" 
                            : esSeleccionada
                              ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/20"
                              : esDiaLleno
                                ? "bg-red-50 border-red-200/70 text-red-400/80 cursor-not-allowed line-through"
                                : horasOcupadas.length > 0
                                  ? "bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200/70"
                                  : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200/60"
                          }
                        `}
                      >
                        <span className="text-xs font-medium self-start">{day.getDate()}</span>
                        {!esPasado && esDiaLleno && (
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-red-100 text-red-600 uppercase scale-90 tracking-wide font-sans">
                            Lleno
                          </span>
                        )}
                        {!esPasado && !esDiaLleno && horasOcupadas.length > 0 && (
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-800 uppercase scale-90 tracking-wide font-sans">
                            {horasOcupadas.length}/3
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mostrar fecha elegida */}
                {selectedDate && (
                  <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-600 font-light flex items-center justify-between">
                    <span>Fecha elegida:</span>
                    <strong className="text-stone-800 font-semibold">
                      {selectedDate.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </strong>
                  </div>
                )}
              </div>

              {/* Bloque 2: Selección de Horario */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">2. Seleccione el Horario</h3>
                <p className="text-[10px] text-stone-400 font-light mb-4">Celebraciones litúrgicas disponibles</p>

                <div className="grid grid-cols-3 gap-3">
                  {HORARIOS_MISA.map((hora) => {
                    const esSeleccionado = selectedHour === hora;
                    
                    // Comprobar si este horario está ocupado en la fecha seleccionada
                    const formattedSelectedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
                    const horasOcupadas = intencionesPorFecha[formattedSelectedDate] || [];
                    const esHoraOcupada = horasOcupadas.includes(hora);

                    return (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => setSelectedHour(hora)}
                        disabled={esHoraOcupada}
                        className={`
                          py-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center
                          ${esHoraOcupada
                            ? "bg-stone-50 text-stone-300 border-stone-100/50 cursor-not-allowed line-through"
                            : esSeleccionado
                              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                              : "bg-white text-stone-700 border-stone-200/60 hover:bg-stone-50"
                          }
                        `}
                      >
                        <span>{hora}</span>
                        {esHoraOcupada && (
                          <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider scale-90 mt-0.5">
                            Ocupado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloque 3: Instrucciones de Ofrenda Yape */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">3. Ofrenda de la Intención</h3>
                  <p className="text-[10px] text-stone-400 font-light mb-3">La ofrenda comunitaria es voluntaria (sugerido S/. 10.00)</p>
                  
                  <ul className="text-xs text-stone-500 font-light space-y-1.5 list-disc pl-4 mb-4">
                    <li>Escanee el código QR con su aplicativo de Yape.</li>
                    <li>O yapee directo al nro de teléfono: <strong className="text-stone-700 font-bold">987 654 321</strong>.</li>
                    <li>Destinatario: <span className="italic">Parroquia Patrocinio</span>.</li>
                    <li>Ingrese los <strong className="text-stone-800 font-bold">últimos 3 dígitos</strong> del número de operación en el formulario.</li>
                  </ul>
                </div>
                {/* QR Mockup */}
                <div className="w-32 h-32 border border-stone-200 bg-stone-50 rounded-2xl flex flex-col items-center justify-center p-3 select-none relative shrink-0">
                  {/* Purple Yape Border simulated */}
                  <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-purple-600 flex items-center justify-center text-[7px] text-white font-bold">
                    Y
                  </div>
                  {/* Fake QR pattern using SVGs */}
                  <svg className="w-24 h-24 text-stone-700" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="25" height="25" />
                    <rect x="5" y="5" width="15" height="15" fill="white" />
                    <rect x="75" y="0" width="25" height="25" />
                    <rect x="80" y="5" width="15" height="15" fill="white" />
                    <rect x="0" y="75" width="25" height="25" />
                    <rect x="5" y="80" width="15" height="15" fill="white" />
                    {/* Random small blocks to simulate QR code */}
                    <rect x="35" y="10" width="10" height="10" />
                    <rect x="50" y="25" width="15" height="10" />
                    <rect x="35" y="45" width="20" height="20" />
                    <rect x="65" y="50" width="10" height="15" />
                    <rect x="80" y="75" width="10" height="10" />
                    <rect x="45" y="80" width="15" height="15" />
                    <rect x="15" y="40" width="10" height="10" />
                  </svg>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-purple-600 mt-1">Escanear Yape</span>
                </div>
              </div>

            </div>

            {/* COLUMNA DERECHA: FORMULARIO DE DATOS */}
            <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 border-b border-stone-100 pb-3">
                4. Complete la Información
              </h3>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 mt-4 mb-2 flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}

              <div className="space-y-4 mt-6">
                {/* Nombre Solicitante */}
                <div>
                  <label htmlFor="nombre" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Nombre del Solicitante *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombreSolicitante}
                    onChange={(e) => setNombreSolicitante(e.target.value)}
                    placeholder="Ej. Juan Pérez Ramos"
                    className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800"
                  />
                  {nombreSolicitante && !isNombreValido && (
                    <span className="text-[9px] text-red-500 mt-1 block">El nombre debe tener al menos 3 caracteres.</span>
                  )}
                </div>

                {/* Email y Teléfono (Dos columnas en tablet/desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={emailSolicitante}
                      onChange={(e) => setEmailSolicitante(e.target.value)}
                      placeholder="solicitante@correo.com"
                      className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800"
                    />
                    {emailSolicitante && !isEmailValido && (
                      <span className="text-[9px] text-red-500 mt-1 block">Ingrese un correo electrónico válido.</span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="telefono" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Teléfono Celular *
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      required
                      value={telefonoSolicitante}
                      onChange={handleTelefonoChange}
                      placeholder="Ej. 987654321"
                      className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800"
                    />
                    {telefonoSolicitante && !isTelefonoValido && (
                      <span className="text-[9px] text-red-500 mt-1 block">
                        Debe ser exactamente 9 números y empezar con 9.
                      </span>
                    )}
                    {telefonoSolicitante && isTelefonoValido && (
                      <span className="text-[9px] text-emerald-600 mt-1 block font-medium">✓ Teléfono celular de 9 dígitos.</span>
                    )}
                  </div>
                </div>

                {/* Selector visual de Tipo de Intención */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Tipo de Intención *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TIPOS_INTENCION.map((tipo) => {
                      const esSeleccionado = tipoIntencion === tipo.id;
                      return (
                        <button
                          key={tipo.id}
                          type="button"
                          onClick={() => setTipoIntencion(tipo.id)}
                          className={`
                            p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-16
                            ${esSeleccionado
                              ? "bg-amber-50/60 border-amber-600 shadow-sm"
                              : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/60"
                            }
                          `}
                        >
                          <span className="text-xs font-bold text-stone-800">{tipo.label}</span>
                          <span className="text-[9px] text-stone-400 font-light leading-tight">{tipo.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nombre de la Intención */}
                <div>
                  <label htmlFor="nombreIntencion" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Nombre para la Intención *
                  </label>
                  <input
                    id="nombreIntencion"
                    type="text"
                    required
                    value={nombreIntencion}
                    onChange={(e) => setNombreIntencion(e.target.value)}
                    placeholder="Ej. Por el alma de María Ruiz Espinoza"
                    className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800"
                  />
                  {nombreIntencion && !isNombreIntencionValido && (
                    <span className="text-[9px] text-red-500 mt-1 block">El motivo de oración debe tener al menos 3 caracteres.</span>
                  )}
                </div>

                {/* Mensaje u Observaciones */}
                <div>
                  <label htmlFor="mensaje" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Mensaje / Observaciones adicionales (Opcional)
                  </label>
                  <textarea
                    id="mensaje"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Ej. Ofrecimiento por el primer año de su partida"
                    rows={2}
                    className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800 resize-none"
                  />
                </div>

                {/* Monto y Código Yape (Ofrenda) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div>
                    <label htmlFor="monto" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Monto de Ofrenda (S/.) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">S/.</span>
                      <input
                        id="monto"
                        type="text"
                        required
                        value={montoOfrenda}
                        onChange={handleMontoChange}
                        placeholder="10.00"
                        className="w-full text-xs pl-9 pr-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800"
                      />
                    </div>
                    {montoOfrenda && !isMontoValido && (
                      <span className="text-[9px] text-red-500 mt-1 block">Ingrese un monto numérico válido.</span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="yape" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Últimos 3 dígitos de operación Yape *
                    </label>
                    <input
                      id="yape"
                      type="text"
                      required
                      value={codigoYape}
                      onChange={handleYapeChange}
                      placeholder="Ej. 182"
                      className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800 font-mono"
                    />
                    {codigoYape && !isYapeValido && (
                      <span className="text-[9px] text-red-500 mt-1 block">
                        Debe tener exactamente 3 dígitos numéricos (ej. 142).
                      </span>
                    )}
                    {codigoYape && isYapeValido && (
                      <span className="text-[9px] text-emerald-600 mt-1 block font-medium">✓ Código válido de 3 dígitos.</span>
                    )}
                  </div>
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={!isFormValido || loading}
                  className={`
                    w-full py-4 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all shadow-sm duration-200 mt-6 cursor-pointer
                    ${isFormValido && !loading
                      ? "bg-amber-600 hover:bg-amber-700 hover:shadow active:scale-99"
                      : "bg-stone-300 text-stone-500 cursor-not-allowed"
                    }
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando Solicitud...
                    </span>
                  ) : (
                    "Registrar Intención"
                  )}
                </button>

                {/* Validación resumida al fondo */}
                {!isFormValido && (
                  <p className="text-[10px] text-center text-stone-400 font-light mt-4">
                    * Complete la selección de fecha, hora y todos los campos obligatorios para activar el botón.
                  </p>
                )}
              </div>
            </div>

          </form>
        )}
      </div>
    </main>
  );
}
