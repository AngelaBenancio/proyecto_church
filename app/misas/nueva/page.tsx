"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { crearIntencionMisa, obtenerIntencionesPorMes } from "../../actions/misaActions";

const HORARIOS_MISA = ["07:00 AM", "06:00 PM", "07:00 PM"];
const TIPOS_INTENCION = [
  { id: "DIFUNTO", label: "Difunto 🕯️", description: "Oración por el eterno descanso", defaultPrice: "10.00", isSacrament: false },
  { id: "SALUD", label: "Salud 🏥", description: "Petición por la recuperación y sanación", defaultPrice: "10.00", isSacrament: false },
  { id: "ACCION_DE_GRACIAS", label: "Acción de Gracias 🙌", description: "Agradecimiento por favores concedidos", defaultPrice: "10.00", isSacrament: false },
  { id: "CUMPLEANOS", label: "Cumpleaños 🎂", description: "Acción de gracias por un año más de vida", defaultPrice: "10.00", isSacrament: false },
  { id: "BAUTIZO", label: "Bautizo 🕊️", description: "Celebración del bautismo", defaultPrice: "50.00", isSacrament: true },
  { id: "COMUNION", label: "Primera Comunión 🥖", description: "Recepción de la Eucaristía", defaultPrice: "30.00", isSacrament: true },
  { id: "CONFIRMACION", label: "Confirmación 🔥", description: "Unción del Espíritu Santo", defaultPrice: "50.00", isSacrament: true },
  { id: "MATRIMONIO", label: "Matrimonio 💍", description: "Celebración de boda eclesiástica", defaultPrice: "80.00", isSacrament: true },
  { id: "OTRO", label: "Otro motivo 🌟", description: "Intenciones varias de la comunidad", defaultPrice: "10.00", isSacrament: false },
];

export default function NuevaMisaPage() {
  // Asistente (Wizard): Estado del paso actual (1 a 4)
  const [step, setStep] = useState(1);

  // Estados de carga y éxito
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ trackingId: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Paso 1: Datos de la intención (Fecha y Hora)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [tipoIntencion, setTipoIntencion] = useState("DIFUNTO");
  const [selectedSacraments, setSelectedSacraments] = useState<string[]>([]);

  // Paso 2: Datos del formulario y campos condicionales
  const [nombreSolicitante, setNombreSolicitante] = useState("");
  const [emailSolicitante, setEmailSolicitante] = useState("");
  const [telefonoSolicitante, setTelefonoSolicitante] = useState("");
  const [nombreIntencion, setNombreIntencion] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  const [isMismaPersona, setIsMismaPersona] = useState<boolean | null>(null);
  const [nombreSegundaPersona, setNombreSegundaPersona] = useState("");
  const [dniSegundaPersona, setDniSegundaPersona] = useState("");

  const [padresNombres, setPadresNombres] = useState("");
  const [padrinosNombres, setPadrinosNombres] = useState("");
  const [conyugeNombre, setConyugeNombre] = useState("");

  // Paso 3: Estados de archivos (Documentación)
  const [fileDniNino, setFileDniNino] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);
  const [fileActaNacimiento, setFileActaNacimiento] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);
  const [fileDniContrayente1, setFileDniContrayente1] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);
  const [fileDniContrayente2, setFileDniContrayente2] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);
  const [fileActaBautismo, setFileActaBautismo] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);
  const [fileDniComulgante, setFileDniComulgante] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);
  const [fileDniConfirmando, setFileDniConfirmando] = useState<{ name: string; progress: number; isValid: boolean } | null>(null);

  // Paso 4: Ofrenda y pago
  const [montoOfrenda, setMontoOfrenda] = useState("10.00");
  const [codigoYape, setCodigoYape] = useState("");

  // Registro de intenciones previas para mostrar en el calendario
  const [intencionesPorFecha, setIntencionesPorFecha] = useState<Record<string, string[]>>({});

  // Navegación del Calendario
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-indexed

  // Cargar intenciones del mes seleccionado y fusionar con datos simulados de ocupación para demostración
  useEffect(() => {
    async function cargarIntenciones() {
      const dbData = await obtenerIntencionesPorMes(currentYear, currentMonth);

      // Generar fechas simuladas para el mes y año en curso
      const anioStr = currentYear;
      const mesStr = String(currentMonth + 1).padStart(2, "0");

      // Simular fechas: 05 (lleno), 12 (semi-lleno con 1 hora ocupada), 18 (semi-lleno con 2 horas ocupadas), 25 (lleno)
      const simData: Record<string, string[]> = {
        [`${anioStr}-${mesStr}-05`]: ["07:00 AM", "06:00 PM", "07:00 PM"], // Lleno (Red)
        [`${anioStr}-${mesStr}-12`]: ["07:00 AM"], // Semi-lleno (Amber - 1 hora)
        [`${anioStr}-${mesStr}-18`]: ["06:00 PM", "07:00 PM"], // Semi-lleno (Amber - 2 horas)
        [`${anioStr}-${mesStr}-25`]: ["07:00 AM", "06:00 PM", "07:00 PM"], // Lleno (Red)
      };

      // Fusionar datos reales y simulados
      const mergedData = { ...simData, ...dbData };
      setIntencionesPorFecha(mergedData);
    }
    cargarIntenciones();
  }, [currentYear, currentMonth]);

  // Simulación de carga de archivos (Paso 3)
  const simularCargaArchivo = (
    setter: React.Dispatch<React.SetStateAction<{ name: string; progress: number; isValid: boolean } | null>>,
    fileName: string
  ) => {
    setter({ name: fileName, progress: 0, isValid: false });
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        clearInterval(interval);
        setter({ name: fileName, progress: 100, isValid: true });
      } else {
        setter({ name: fileName, progress: prog, isValid: false });
      }
    }, 120);
  };

  // Función para calcular precio de ofrenda dinámica
  const calcularPrecioOfrenda = (sacramentos: string[]) => {
    if (sacramentos.length === 0) return "10.00";
    
    let sum = 0;
    sacramentos.forEach(id => {
      const sac = TIPOS_INTENCION.find(t => t.id === id);
      if (sac) sum += parseFloat(sac.defaultPrice);
    });
    
    const tieneBautizo = sacramentos.includes("BAUTIZO");
    const tieneComunion = sacramentos.includes("COMUNION");
    const tieneConfirmacion = sacramentos.includes("CONFIRMACION");
    
    // Descuentos para combinaciones comunes
    if (sacramentos.length === 3 && tieneBautizo && tieneComunion && tieneConfirmacion) {
      return "110.00";
    }
    if (sacramentos.length === 2 && tieneBautizo && tieneComunion) {
      return "75.00";
    }
    if (sacramentos.length === 2 && tieneComunion && tieneConfirmacion) {
      return "70.00";
    }
    
    // Descuento genérico de S/. 5 por cada sacramento adicional
    if (sacramentos.length >= 2) {
      const descuento = (sacramentos.length - 1) * 5;
      return (sum - descuento).toFixed(2);
    }
    
    return sum.toFixed(2);
  };

  // Helper functions para etiquetas dinámicas
  const obtenerLabelNombreIntencion = () => {
    if (selectedSacraments.length > 0) {
      const tieneBautizo = selectedSacraments.includes("BAUTIZO");
      const tieneMatrimonio = selectedSacraments.includes("MATRIMONIO");
      const tieneConfirmacion = selectedSacraments.includes("CONFIRMACION");
      const tieneComunion = selectedSacraments.includes("COMUNION");

      if (tieneBautizo && tieneMatrimonio) return "Nombres del Primer Contrayente (Novio/a) y del Niño/a *";
      if (tieneBautizo) return "Nombre del Niño/a a Bautizar *";
      if (tieneMatrimonio) return "Nombre del Primer Contrayente (Novio/a) *";
      if (tieneConfirmacion) return "Nombre del Confirmando *";
      if (tieneComunion) return "Nombre de quien recibirá la Comunión *";
      return "Nombre del destinatario del Sacramento *";
    }
    
    switch (tipoIntencion) {
      case "DIFUNTO":
        return "Nombre del Difunto *";
      case "SALUD":
        return "Nombre de la persona por quien se pide Salud *";
      case "CUMPLEANOS":
        return "Nombre del Cumpleañero *";
      case "ACCION_DE_GRACIAS":
        return "Nombre de la persona o motivo de Acción de Gracias *";
      default:
        return "Nombre para la Intención *";
    }
  };

  const obtenerPlaceholderNombreIntencion = () => {
    if (selectedSacraments.length > 0) {
      return "Ej. Juan Pablo Torres Ramos";
    }
    switch (tipoIntencion) {
      case "DIFUNTO":
        return "Ej. María Luz Ruíz Ramos (Q.E.P.D.)";
      case "SALUD":
        return "Ej. Carlos Mendoza Gil (por su recuperación)";
      case "CUMPLEANOS":
        return "Ej. Sofía Benancio Ramos";
      default:
        return "Ej. Familia Espinoza Ramos";
    }
  };

  // Validaciones del formulario divididas por Paso
  const isNombreValido = nombreSolicitante.trim().length >= 3;
  const isEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSolicitante);
  const isTelefonoValido = /^9\d{8}$/.test(telefonoSolicitante);
  const isNombreIntencionValido = nombreIntencion.trim().length >= 3;
  
  const isFechaValida = selectedDate !== null;
  const isHoraValida = selectedHour !== "";
  const isMontoValido = parseFloat(montoOfrenda) >= 0 && !isNaN(parseFloat(montoOfrenda));
  const isYapeValido = /^\d{3}$/.test(codigoYape);

  // Validación de segunda persona para combos sacramentales
  const requierePreguntaMismaPersona = selectedSacraments.length >= 2;
  const isPreguntaRespondida = !requierePreguntaMismaPersona || isMismaPersona !== null;
  const isSegundaPersonaValida =
    !requierePreguntaMismaPersona ||
    isMismaPersona === true ||
    (isMismaPersona === false &&
      nombreSegundaPersona.trim().length >= 3 &&
      /^\d{8}$/.test(dniSegundaPersona));

  // Validación de campos condicionales sacramentales (Paso 2)
  const tieneBautizoSeleccionado = selectedSacraments.includes("BAUTIZO");
  const tieneMatrimonioSeleccionado = selectedSacraments.includes("MATRIMONIO");
  const tieneConfirmacionSeleccionado = selectedSacraments.includes("CONFIRMACION");
  const tieneComunionSeleccionado = selectedSacraments.includes("COMUNION");
  
  const isCamposBautizoValidos = !tieneBautizoSeleccionado || (padresNombres.trim().length >= 5 && padrinosNombres.trim().length >= 5);
  const isCamposMatrimonioValidos = !tieneMatrimonioSeleccionado || conyugeNombre.trim().length >= 3;

  // Estados de validación por paso
  const isStep1Valido = isFechaValida && isHoraValida;
  const isStep2Valido =
    isNombreValido &&
    isEmailValido &&
    isTelefonoValido &&
    isNombreIntencionValido &&
    isPreguntaRespondida &&
    isSegundaPersonaValida &&
    isCamposBautizoValidos &&
    isCamposMatrimonioValidos;

  const isStep3Valido =
    selectedSacraments.length === 0 ||
    ((!tieneBautizoSeleccionado || (fileDniNino?.isValid && fileActaNacimiento?.isValid)) &&
      (!tieneMatrimonioSeleccionado || (fileDniContrayente1?.isValid && fileDniContrayente2?.isValid && fileActaBautismo?.isValid)) &&
      (!tieneConfirmacionSeleccionado || (fileDniConfirmando?.isValid && fileActaBautismo?.isValid)) &&
      (!tieneComunionSeleccionado || (fileDniComulgante?.isValid && fileActaBautismo?.isValid)));

  const isStep4Valido = isYapeValido && isMontoValido;

  // Manejo de Avance y Retroceso del Wizard
  const handleNextStep = () => {
    if (step === 1 && isStep1Valido) {
      setStep(2);
    } else if (step === 2 && isStep2Valido) {
      // Si es intención clásica (sin sacramentos), saltar directamente al Paso 4 (Pago)
      if (selectedSacraments.length === 0) {
        setStep(4);
      } else {
        setStep(3);
      }
    } else if (step === 3 && isStep3Valido) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step === 4) {
      // Si es intención clásica, regresar al Paso 2
      if (selectedSacraments.length === 0) {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

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
    const cleanVal = rawVal.replace(/[^0-9.]/g, "");
    const parts = cleanVal.split(".");
    if (parts.length > 2) return;
    setMontoOfrenda(cleanVal);
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valido || !isStep2Valido || !isStep3Valido || !isStep4Valido || !selectedDate) return;

    setLoading(true);
    setServerError(null);

    // Formatear fecha local a string ISO seguro
    const anio = selectedDate.getFullYear();
    const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dia = String(selectedDate.getDate()).padStart(2, "0");
    const fechaMisaStr = `${anio}-${mes}-${dia}`;

    // Construir tipoIntencion y nombreIntencion final
    let finalTipoIntencion = tipoIntencion;
    let finalNombreIntencion = nombreIntencion;
    let finalMensaje = mensaje;

    if (selectedSacraments.length > 0) {
      finalTipoIntencion = selectedSacraments
        .map((id) => TIPOS_INTENCION.find((t) => t.id === id)?.label || id)
        .join(", ");
    }

    if (selectedSacraments.includes("BAUTIZO")) {
      finalMensaje = `${finalMensaje}\n[Bautizo - Padres: ${padresNombres} | Padrinos: ${padrinosNombres}]`;
    }

    if (selectedSacraments.includes("MATRIMONIO")) {
      if (selectedSacraments.length >= 2 && isMismaPersona === false) {
        finalNombreIntencion = `${nombreIntencion} (Primer Contrayente) y ${nombreSegundaPersona} (Segundo Sacramento) [Cónyuge/Novio/a: ${conyugeNombre}]`;
      } else {
        finalNombreIntencion = `${nombreIntencion} y ${conyugeNombre}`;
      }
      finalMensaje = `${finalMensaje}\n[Matrimonio - Contrayentes: ${nombreIntencion} y ${conyugeNombre}]`;
    } else if (selectedSacraments.length >= 2 && isMismaPersona === false) {
      finalNombreIntencion = `${nombreIntencion} y ${nombreSegundaPersona}`;
      finalMensaje = `${finalMensaje}\n[Segunda persona sacramental: ${nombreSegundaPersona} - DNI: ${dniSegundaPersona}]`;
    }

    // Agregar nombres de los archivos subidos al mensaje de la base de datos
    const archivosMensaje: string[] = [];
    if (fileDniNino) archivosMensaje.push(`DNI Niño: ${fileDniNino.name}`);
    if (fileActaNacimiento) archivosMensaje.push(`Acta Nacimiento: ${fileActaNacimiento.name}`);
    if (fileDniContrayente1) archivosMensaje.push(`DNI Novio 1: ${fileDniContrayente1.name}`);
    if (fileDniContrayente2) archivosMensaje.push(`DNI Novio 2: ${fileDniContrayente2.name}`);
    if (fileActaBautismo) archivosMensaje.push(`Acta Bautismo: ${fileActaBautismo.name}`);
    if (fileDniComulgante) archivosMensaje.push(`DNI Comulgante: ${fileDniComulgante.name}`);
    if (fileDniConfirmando) archivosMensaje.push(`DNI Confirmando: ${fileDniConfirmando.name}`);

    if (archivosMensaje.length > 0) {
      finalMensaje = `${finalMensaje}\n[Documentos Cargados: ${archivosMensaje.join(" | ")}]`;
    }

    const res = await crearIntencionMisa({
      nombreSolicitante,
      emailSolicitante,
      telefonoSolicitante,
      tipoIntencion: finalTipoIntencion,
      nombreIntencion: finalNombreIntencion,
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

  // Generador de Días del Calendario (Paso 1)
  const obtenerDiasEnMes = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const obtenerPrimerDiaSemana = (year: number, month: number) => new Date(year, month, 1).getDay();

  const diasEnMes = obtenerDiasEnMes(currentYear, currentMonth);
  const primerDiaSemana = obtenerPrimerDiaSemana(currentYear, currentMonth);

  const celdasCalendario: (Date | null)[] = [];
  for (let i = 0; i < primerDiaSemana; i++) {
    celdasCalendario.push(null);
  }
  for (let i = 1; i <= diasEnMes; i++) {
    celdasCalendario.push(new Date(currentYear, currentMonth, i));
  }

  const mesSiguiente = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const mesAnterior = () => {
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

  const esFechaPasada = (date: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy < hoy;
  };

  const esFechaSeleccionada = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Manejo de cambio de archivo (Paso 3)
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<{ name: string; progress: number; isValid: boolean } | null>>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validación básica: menor de 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo supera el límite permitido de 5MB.");
      return;
    }
    // Validación de extensiones
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "pdf"].includes(extension || "")) {
      alert("Formato no soportado. Suba archivos JPG, PNG o PDF.");
      return;
    }

    simularCargaArchivo(setter, file.name);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2 block">
            Misas y Sacramentos
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-800 tracking-tight leading-tight">
            Separación de Misa y Trámite
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light max-w-xl">
            Siga el asistente por pasos para agendar la fecha, ingresar los datos solicitados, adjuntar los documentos y realizar el aporte voluntario.
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
              ¡Reserva Enviada Exitosamente!
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-light mb-8 max-w-md mx-auto leading-relaxed">
              Su solicitud fue enviada con éxito. El despacho parroquial verificará su ofrenda y la documentación provista, enviándole una confirmación a su correo.
            </p>

            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 text-left mb-8 max-w-md mx-auto">
              <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4 border-b border-stone-200/60 pb-2">
                Resumen del Registro
              </div>
              <div className="grid grid-cols-3 gap-y-3 text-xs">
                <span className="text-stone-400 font-light">Seguimiento:</span>
                <span className="col-span-2 font-mono font-bold text-stone-700 break-all select-all">{successData.trackingId}</span>

                <span className="text-stone-400 font-light">Solicitante:</span>
                <span className="col-span-2 text-stone-700 font-medium">{nombreSolicitante}</span>

                <span className="text-stone-400 font-light">Destinado a:</span>
                <span className="col-span-2 text-stone-700 font-medium">
                  {nombreIntencion}
                  {selectedSacraments.length >= 2 && isMismaPersona === false && ` y ${nombreSegundaPersona}`}
                  {" "}
                  <span className="text-[10px] text-stone-400 block font-normal mt-0.5">
                    ({selectedSacraments.length > 0
                      ? selectedSacraments.map(id => TIPOS_INTENCION.find(t => t.id === id)?.label || id).join(", ")
                      : TIPOS_INTENCION.find(t => t.id === tipoIntencion)?.label || tipoIntencion})
                  </span>
                </span>

                <span className="text-stone-400 font-light">Fecha de Misa:</span>
                <span className="col-span-2 text-stone-700 font-medium">
                  {selectedDate?.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>

                <span className="text-stone-400 font-light">Horario:</span>
                <span className="col-span-2 text-stone-700 font-medium">{selectedHour}</span>

                <span className="text-stone-400 font-light">Ofrenda Yape:</span>
                <span className="col-span-2 text-stone-700 font-medium">S/. {montoOfrenda} (Op: ***{codigoYape})</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setStep(1);
                  setSuccessData(null);
                  setNombreSolicitante("");
                  setEmailSolicitante("");
                  setTelefonoSolicitante("");
                  setNombreIntencion("");
                  setMensaje("");
                  setCodigoYape("");
                  setSelectedDate(null);
                  setSelectedHour("");
                  setSelectedSacraments([]);
                  setIsMismaPersona(null);
                  setNombreSegundaPersona("");
                  setDniSegundaPersona("");
                  setPadresNombres("");
                  setPadrinosNombres("");
                  setConyugeNombre("");
                  setFileDniNino(null);
                  setFileActaNacimiento(null);
                  setFileDniContrayente1(null);
                  setFileDniContrayente2(null);
                  setFileActaBautismo(null);
                  setFileDniComulgante(null);
                  setFileDniConfirmando(null);
                }}
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors rounded-xl cursor-pointer"
              >
                Registrar Otra Solicitud
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 transition-colors rounded-xl"
              >
                Volver a Inicio
              </Link>
            </div>
          </div>
        ) : (
          /* ASISTENTE MULTIPASOS */
          <div className="max-w-4xl mx-auto">
            {/* Barra de Progreso Superior */}
            <div className="flex items-center justify-between mb-8 px-4 py-2 border border-stone-200/80 bg-white rounded-2xl shadow-sm">
              {[
                { number: 1, label: "Programación" },
                { number: 2, label: "Información" },
                { 
                  number: 3, 
                  label: "Documentos",
                  isOmitted: selectedSacraments.length === 0 
                },
                { number: 4, label: "Pago Final" }
              ].map((s) => {
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                const isSkipped = s.number === 3 && s.isOmitted;
                
                return (
                  <div key={s.number} className="flex items-center gap-2">
                    <span
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors
                        ${isSkipped
                          ? "bg-stone-100 text-stone-300 border-stone-200 line-through"
                          : isActive
                            ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                            : isCompleted
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : "bg-white border-stone-200 text-stone-400"
                        }
                      `}
                    >
                      {isCompleted && !isSkipped ? "✓" : s.number}
                    </span>
                    <span
                      className={`
                        text-[10px] sm:text-xs font-medium tracking-tight hidden md:inline
                        ${isSkipped
                          ? "text-stone-300 line-through"
                          : isActive
                            ? "text-stone-800 font-bold"
                            : isCompleted
                              ? "text-stone-600"
                              : "text-stone-400"
                        }
                      `}
                    >
                      {s.label} {isSkipped ? "(Omitido)" : ""}
                    </span>
                    {s.number < 4 && (
                      <span className="text-stone-300 text-xs hidden md:inline mx-1 sm:mx-3">&rarr;</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contenedor del Paso Activo */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-sm relative">
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 mb-6 flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}

              {/* PASO 1: PROGRAMACIÓN DE FECHA, HORA Y CELEBRACIÓN */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Calendario */}
                    <div className="lg:col-span-7 bg-stone-50/50 border border-stone-200/60 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">1. Seleccione la Fecha</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={mesAnterior}
                            disabled={currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth()}
                            className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 disabled:opacity-30 cursor-pointer"
                          >
                            &larr;
                          </button>
                          <span className="text-[10px] font-bold text-stone-700 min-w-[90px] text-center">
                            {mesesNombres[currentMonth]} {currentYear}
                          </span>
                          <button
                            type="button"
                            onClick={mesSiguiente}
                            className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 cursor-pointer"
                          >
                            &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Cuadrícula */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-stone-400 uppercase mb-2">
                        <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
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
                                setSelectedHour(""); // Reset hora al cambiar de día
                              }}
                              disabled={esPasado || esDiaLleno}
                              className={`
                                aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 border transition-all duration-200 cursor-pointer
                                ${esPasado 
                                  ? "bg-stone-50 text-stone-300 border-stone-100/50 cursor-not-allowed" 
                                  : esSeleccionada
                                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                    : esDiaLleno
                                      ? "bg-rose-50 border-rose-200/70 text-rose-400/80 cursor-not-allowed line-through"
                                      : horasOcupadas.length === 2
                                        ? "bg-orange-50/70 hover:bg-orange-100/80 text-orange-900 border-orange-200"
                                        : horasOcupadas.length === 1
                                          ? "bg-amber-50/50 hover:bg-amber-100/80 text-amber-900 border-amber-200"
                                          : "bg-emerald-50/40 hover:bg-emerald-100/60 text-emerald-900 border-emerald-100"
                                }
                              `}
                            >
                              <span className="text-xs font-semibold self-start">{day.getDate()}</span>
                              {!esPasado && esDiaLleno && (
                                <span className="text-[6px] font-bold px-0.5 rounded bg-rose-100 text-rose-600 uppercase">Lleno</span>
                              )}
                              {!esPasado && !esDiaLleno && horasOcupadas.length > 0 && (
                                <span className={`text-[6px] font-bold px-0.5 rounded ${
                                  horasOcupadas.length === 2 
                                    ? "bg-orange-100 text-orange-800" 
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {horasOcupadas.length}/3
                                </span>
                              )}
                              {!esPasado && horasOcupadas.length === 0 && (
                                <span className="text-[6px] font-bold px-0.5 rounded bg-emerald-100/70 text-emerald-700">Libre</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Leyenda de Colores */}
                      <div className="mt-4 pt-3.5 border-t border-stone-200/50 flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[9px] font-medium text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-50 border border-emerald-150" />
                          <span>Libre</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-50 border border-amber-200" />
                          <span>1/3 Ocupado</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-50 border border-orange-200" />
                          <span>2/3 Ocupado</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-50 border border-rose-200" />
                          <span>Lleno</span>
                        </div>
                      </div>
                    </div>

                    {/* Horarios */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-stone-50/50 border border-stone-200/60 rounded-2xl p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">2. Seleccione el Horario</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                          {HORARIOS_MISA.map((hora) => {
                            const esSeleccionado = selectedHour === hora;
                            const formattedSelectedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
                            const horasOcupadas = intencionesPorFecha[formattedSelectedDate] || [];
                            const esHoraOcupada = horasOcupadas.includes(hora);

                            return (
                              <button
                                key={hora}
                                type="button"
                                onClick={() => setSelectedHour(hora)}
                                disabled={esHoraOcupada || !selectedDate}
                                className={`
                                  py-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex justify-between px-4 items-center
                                  ${esHoraOcupada
                                    ? "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed line-through"
                                    : !selectedDate
                                      ? "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed"
                                      : esSeleccionado
                                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                                  }
                                `}
                              >
                                <span>{hora}</span>
                                {esHoraOcupada && (
                                  <span className="text-[8px] text-red-500 font-bold uppercase">Ocupado</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Celebración / Sacramentos */}
                  <div className="border-t border-stone-100 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                      3. Tipo de Celebración (Selección Múltiple para Sacramentos)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {TIPOS_INTENCION.map((tipo) => {
                        const esSeleccionado = tipo.isSacrament
                          ? selectedSacraments.includes(tipo.id)
                          : (tipoIntencion === tipo.id && selectedSacraments.length === 0);

                        return (
                          <button
                            key={tipo.id}
                            type="button"
                            onClick={() => {
                              if (!tipo.isSacrament) {
                                setSelectedSacraments([]);
                                setTipoIntencion(tipo.id);
                                setMontoOfrenda(tipo.defaultPrice);
                                setIsMismaPersona(null);
                                setNombreSegundaPersona("");
                                setDniSegundaPersona("");
                                setPadresNombres("");
                                setPadrinosNombres("");
                                setConyugeNombre("");
                              } else {
                                let nuevosSacramentos = [...selectedSacraments];
                                if (nuevosSacramentos.includes(tipo.id)) {
                                  nuevosSacramentos = nuevosSacramentos.filter((id) => id !== tipo.id);
                                } else {
                                  if (nuevosSacramentos.length >= 3) return;
                                  nuevosSacramentos.push(tipo.id);
                                }
                                setSelectedSacraments(nuevosSacramentos);

                                if (nuevosSacramentos.length === 0) {
                                  setTipoIntencion("DIFUNTO");
                                  setMontoOfrenda("10.00");
                                  setIsMismaPersona(null);
                                  setNombreSegundaPersona("");
                                  setDniSegundaPersona("");
                                } else {
                                  setTipoIntencion(nuevosSacramentos.join(","));
                                  setMontoOfrenda(calcularPrecioOfrenda(nuevosSacramentos));
                                  if (nuevosSacramentos.length < 2) {
                                    setIsMismaPersona(null);
                                    setNombreSegundaPersona("");
                                    setDniSegundaPersona("");
                                  }
                                }
                              }
                            }}
                            className={`
                              p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-20
                              ${esSeleccionado
                                ? "bg-amber-50/60 border-amber-600 shadow-sm"
                                : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/60"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-stone-800">{tipo.label}</span>
                              {tipo.isSacrament && (
                                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] transition-colors shrink-0 ${
                                  esSeleccionado 
                                    ? "bg-amber-600 border-amber-600 text-white font-bold" 
                                    : "border-stone-300 bg-white"
                                }`}>
                                  {esSeleccionado && "✓"}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-stone-400 font-light leading-tight mt-1">{tipo.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: INGRESAR DATOS BÁSICOS E INFORMACIÓN ADICIONAL */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-3">
                    Información del Solicitante y Celebración
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-800 transition-all"
                      />
                      {nombreSolicitante && !isNombreValido && (
                        <span className="text-[9px] text-red-500 mt-1 block">El nombre debe tener al menos 3 caracteres.</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                        Celular (Perú) *
                      </label>
                      <input
                        id="telefono"
                        type="tel"
                        required
                        value={telefonoSolicitante}
                        onChange={handleTelefonoChange}
                        placeholder="Ej. 987654321"
                        className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-800 transition-all"
                      />
                      {telefonoSolicitante && !isTelefonoValido && (
                        <span className="text-[9px] text-red-500 mt-1 block">Debe ser celular de 9 dígitos y empezar con 9.</span>
                      )}
                    </div>
                  </div>

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
                      placeholder="ejemplo@correo.com"
                      className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-800 transition-all"
                    />
                    {emailSolicitante && !isEmailValido && (
                      <span className="text-[9px] text-red-500 mt-1 block">Ingrese un correo electrónico válido.</span>
                    )}
                  </div>

                  {/* Combo sacramental - Pregunta de misma persona */}
                  {selectedSacraments.length >= 2 && (
                    <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 sm:p-5 space-y-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        ¿Los sacramentos seleccionados son para la misma persona? *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMismaPersona(true);
                            setNombreSegundaPersona("");
                            setDniSegundaPersona("");
                          }}
                          className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            isMismaPersona === true
                              ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          Sí, son para la misma persona
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMismaPersona(false)}
                          className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            isMismaPersona === false
                              ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          No, son para distintas personas (ej. Bautizo del hijo)
                        </button>
                      </div>
                      
                      {isMismaPersona === false && (
                        <div className="border-t border-stone-200/60 pt-4 space-y-3">
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                            Datos de la Segunda Persona
                          </h4>
                          <div>
                            <label htmlFor="nombreSegunda" className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                              Nombre completo de la segunda persona *
                            </label>
                            <input
                              id="nombreSegunda"
                              type="text"
                              required
                              value={nombreSegundaPersona}
                              onChange={(e) => setNombreSegundaPersona(e.target.value)}
                              placeholder="Ej. Nombre del segundo festejado"
                              className="w-full text-xs px-4 py-3 bg-white border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 text-slate-800"
                            />
                            {nombreSegundaPersona && nombreSegundaPersona.trim().length < 3 && (
                              <span className="text-[9px] text-red-500 mt-1 block">Debe tener al menos 3 caracteres.</span>
                            )}
                          </div>
                          <div>
                            <label htmlFor="dniSegunda" className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                              DNI de la segunda persona *
                            </label>
                            <input
                              id="dniSegunda"
                              type="text"
                              required
                              value={dniSegundaPersona}
                              onChange={(e) => setDniSegundaPersona(e.target.value.replace(/\D/g, "").slice(0, 8))}
                              placeholder="DNI de 8 dígitos"
                              className="w-full text-xs px-4 py-3 bg-white border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-800"
                            />
                            {dniSegundaPersona && dniSegundaPersona.length !== 8 && (
                              <span className="text-[9px] text-red-500 mt-1 block">Debe tener exactamente 8 números.</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nombre del festejado principal (Dinámico) */}
                  <div className="pt-2 border-t border-stone-100">
                    <label htmlFor="nombreIntencion" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      {obtenerLabelNombreIntencion()}
                    </label>
                    <input
                      id="nombreIntencion"
                      type="text"
                      required
                      value={nombreIntencion}
                      onChange={(e) => setNombreIntencion(e.target.value)}
                      placeholder={obtenerPlaceholderNombreIntencion()}
                      className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-800 transition-all"
                    />
                    {nombreIntencion && !isNombreIntencionValido && (
                      <span className="text-[9px] text-red-500 mt-1 block">El nombre debe tener al menos 3 caracteres.</span>
                    )}
                  </div>

                  {/* Datos condicionales de Bautizos (Padres/Padrinos) */}
                  {selectedSacraments.includes("BAUTIZO") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/50 border border-stone-200/50 rounded-2xl p-4">
                      <div>
                        <label htmlFor="padres" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                          Nombres de los Padres *
                        </label>
                        <input
                          id="padres"
                          type="text"
                          required
                          value={padresNombres}
                          onChange={(e) => setPadresNombres(e.target.value)}
                          placeholder="Ej. Pedro Pérez y Ana Ramos"
                          className="w-full text-xs px-4 py-3 bg-white border border-stone-200/85 rounded-xl focus:outline-none focus:border-amber-600 text-slate-800"
                        />
                        {padresNombres && padresNombres.trim().length < 5 && (
                          <span className="text-[9px] text-red-500 mt-1 block">Mínimo 5 caracteres.</span>
                        )}
                      </div>
                      <div>
                        <label htmlFor="padrinos" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                          Nombres de los Padrinos *
                        </label>
                        <input
                          id="padrinos"
                          type="text"
                          required
                          value={padrinosNombres}
                          onChange={(e) => setPadrinosNombres(e.target.value)}
                          placeholder="Ej. Juan Ruiz y Rosa Medina"
                          className="w-full text-xs px-4 py-3 bg-white border border-stone-200/85 rounded-xl focus:outline-none focus:border-amber-600 text-slate-800"
                        />
                        {padrinosNombres && padrinosNombres.trim().length < 5 && (
                          <span className="text-[9px] text-red-500 mt-1 block">Mínimo 5 caracteres.</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Datos condicionales de Matrimonio (Cónyuge) */}
                  {selectedSacraments.includes("MATRIMONIO") && (
                    <div className="bg-stone-50/50 border border-stone-200/50 rounded-2xl p-4">
                      <label htmlFor="conyuge" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                        Nombre del Cónyuge / Segundo Contrayente *
                      </label>
                      <input
                        id="conyuge"
                        type="text"
                        required
                        value={conyugeNombre}
                        onChange={(e) => setConyugeNombre(e.target.value)}
                        placeholder="Ej. Nombre del segundo contrayente"
                        className="w-full text-xs px-4 py-3 bg-white border border-stone-200/85 rounded-xl focus:outline-none focus:border-amber-600 text-slate-800"
                      />
                      {conyugeNombre && conyugeNombre.trim().length < 3 && (
                        <span className="text-[9px] text-red-500 mt-1 block">Mínimo 3 caracteres.</span>
                      )}
                    </div>
                  )}

                  {/* Mensaje u Observaciones */}
                  <div>
                    <label htmlFor="mensaje" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Observaciones / Peticiones Especiales (Opcional)
                    </label>
                    <textarea
                      id="mensaje"
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Ej. Intención por primer mes de fallecido o detalles específicos"
                      rows={3}
                      className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-800 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* PASO 3: CARGA DE DOCUMENTOS (Solo para Sacramentos) */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-3">
                    Requisitos Documentales Obligatorios
                  </h3>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    Adjunte copias digitales de los documentos solicitados. Solo se permiten formatos **PDF, JPG, JPEG o PNG** con tamaño máximo de **5MB**.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Requisitos para Bautizo */}
                    {tieneBautizoSeleccionado && (
                      <>
                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">DNI del Niño/a a Bautizar *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Copia simple del documento de identidad o certificado de nacido vivo.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileDniNino)}
                              className="hidden"
                              id="file-dni-nino"
                            />
                            <label
                              htmlFor="file-dni-nino"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileDniNino && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileDniNino.name} 
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileDniNino.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileDniNino.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileDniNino.isValid ? "Validado ✓" : `Subiendo... ${fileDniNino.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">Acta de Nacimiento *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Acta oficial de RENIEC legible.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileActaNacimiento)}
                              className="hidden"
                              id="file-acta-nacimiento"
                            />
                            <label
                              htmlFor="file-acta-nacimiento"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileActaNacimiento && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileActaNacimiento.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileActaNacimiento.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileActaNacimiento.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileActaNacimiento.isValid ? "Validado ✓" : `Subiendo... ${fileActaNacimiento.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Requisitos para Matrimonio */}
                    {tieneMatrimonioSeleccionado && (
                      <>
                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">DNI del Primer Contrayente *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Copia simple del DNI del novio o la novia.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileDniContrayente1)}
                              className="hidden"
                              id="file-dni-con1"
                            />
                            <label
                              htmlFor="file-dni-con1"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileDniContrayente1 && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileDniContrayente1.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileDniContrayente1.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileDniContrayente1.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileDniContrayente1.isValid ? "Validado ✓" : `Subiendo... ${fileDniContrayente1.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">DNI del Segundo Contrayente *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Copia simple del DNI de la pareja.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileDniContrayente2)}
                              className="hidden"
                              id="file-dni-con2"
                            />
                            <label
                              htmlFor="file-dni-con2"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileDniContrayente2 && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileDniContrayente2.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileDniContrayente2.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileDniContrayente2.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileDniContrayente2.isValid ? "Validado ✓" : `Subiendo... ${fileDniContrayente2.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px] md:col-span-2">
                          <div>
                            <div className="text-xs font-bold text-stone-800">Partida de Bautizo de ambos Contrayentes *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Actas de bautismo legalizadas emitidas por sus parroquias de origen.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileActaBautismo)}
                              className="hidden"
                              id="file-acta-bautismo-mat"
                            />
                            <label
                              htmlFor="file-acta-bautismo-mat"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileActaBautismo && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileActaBautismo.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileActaBautismo.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileActaBautismo.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileActaBautismo.isValid ? "Validado ✓" : `Subiendo... ${fileActaBautismo.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Requisitos para Primera Comunión (Solo si no es bautizo o matrimonio que lo incluye) */}
                    {tieneComunionSeleccionado && !tieneBautizoSeleccionado && !tieneMatrimonioSeleccionado && (
                      <>
                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">DNI del Comulgante *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Copia del DNI del menor o adulto.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileDniComulgante)}
                              className="hidden"
                              id="file-dni-com"
                            />
                            <label
                              htmlFor="file-dni-com"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileDniComulgante && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileDniComulgante.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileDniComulgante.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileDniComulgante.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileDniComulgante.isValid ? "Validado ✓" : `Subiendo... ${fileDniComulgante.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">Fe de Bautismo *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Constancia de bautismo del comulgante.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileActaBautismo)}
                              className="hidden"
                              id="file-acta-com"
                            />
                            <label
                              htmlFor="file-acta-com"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileActaBautismo && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileActaBautismo.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileActaBautismo.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileActaBautismo.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileActaBautismo.isValid ? "Validado ✓" : `Subiendo... ${fileActaBautismo.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Requisitos para Confirmación (Solo si no es bautizo o matrimonio que lo incluye) */}
                    {tieneConfirmacionSeleccionado && !tieneBautizoSeleccionado && !tieneMatrimonioSeleccionado && (
                      <>
                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">DNI del Confirmando *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Copia simple del DNI vigente.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileDniConfirmando)}
                              className="hidden"
                              id="file-dni-conf"
                            />
                            <label
                              htmlFor="file-dni-conf"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileDniConfirmando && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileDniConfirmando.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileDniConfirmando.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileDniConfirmando.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileDniConfirmando.isValid ? "Validado ✓" : `Subiendo... ${fileDniConfirmando.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-xs font-bold text-stone-800">Partida de Bautizo *</div>
                            <p className="text-[10px] text-stone-400 mt-1">Constancia oficial de bautismo del confirmando.</p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setFileActaBautismo)}
                              className="hidden"
                              id="file-acta-conf"
                            />
                            <label
                              htmlFor="file-acta-conf"
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-600 cursor-pointer shadow-xs"
                            >
                              📁 Seleccionar Archivo
                            </label>
                            {fileActaBautismo && (
                              <div className="mt-2 text-[10px] font-medium text-stone-600">
                                📄 {fileActaBautismo.name}
                                <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1 overflow-hidden relative">
                                  <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${fileActaBautismo.progress}%` }} />
                                </div>
                                <span className={`text-[9px] font-bold mt-1 block ${fileActaBautismo.isValid ? "text-emerald-600" : "text-stone-400 animate-pulse"}`}>
                                  {fileActaBautismo.isValid ? "Validado ✓" : `Subiendo... ${fileActaBautismo.progress}%`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* PASO 4: PAGO DE OFRENDA POR YAPE Y CONFIRMACIÓN */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-3">
                    Ofrenda de la Celebración y Pago Vía Yape
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-6 items-center bg-stone-50/50 border border-stone-200/50 rounded-2xl p-6">
                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Aporte Sugerido</span>
                        <div className="text-2xl font-serif font-semibold text-stone-800">
                          S/. {montoOfrenda}
                        </div>
                        {selectedSacraments.length >= 2 && (
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                            Descuento por Combo Aplicado
                          </span>
                        )}
                      </div>

                      <ul className="text-xs text-stone-500 font-light space-y-1.5 list-disc pl-4">
                        <li>Escanee el código QR con su aplicativo de Yape.</li>
                        <li>O yapee directo al nro de teléfono: <strong className="text-stone-700 font-bold">987 654 321</strong>.</li>
                        <li>Destinatario: <span className="italic">Parroquia Patrocinio</span>.</li>
                        <li>Ingrese los <strong className="text-stone-800 font-bold">últimos 3 dígitos</strong> del número de operación en el formulario.</li>
                      </ul>
                    </div>

                    {/* QR Mockup */}
                    <div className="w-32 h-32 border border-stone-200 bg-white rounded-2xl flex flex-col items-center justify-center p-3 select-none relative shrink-0">
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-purple-600 flex items-center justify-center text-[7px] text-white font-bold">
                        Y
                      </div>
                      <svg className="w-24 h-24 text-stone-700" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="0" y="0" width="25" height="25" />
                        <rect x="5" y="5" width="15" height="15" fill="white" />
                        <rect x="75" y="0" width="25" height="25" />
                        <rect x="80" y="5" width="15" height="15" fill="white" />
                        <rect x="0" y="75" width="25" height="25" />
                        <rect x="5" y="80" width="15" height="15" fill="white" />
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          className="w-full text-xs pl-9 pr-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-800"
                        />
                      </div>
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
                        className="w-full text-xs px-4 py-3 bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white font-mono text-slate-800"
                      />
                      {codigoYape && !isYapeValido && (
                        <span className="text-[9px] text-red-500 mt-1 block">Debe tener exactamente 3 dígitos numéricos.</span>
                      )}
                      {codigoYape && isYapeValido && (
                        <span className="text-[9px] text-emerald-600 mt-1 block font-medium">✓ Código ingresado correctamente.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Navegación del Wizard */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={step === 1 || loading}
                  className={`
                    px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer
                    ${step === 1
                      ? "text-stone-300 border border-stone-100 cursor-not-allowed"
                      : "text-stone-600 bg-stone-100 hover:bg-stone-200"
                    }
                  `}
                >
                  &larr; Anterior
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      (step === 1 && !isStep1Valido) ||
                      (step === 2 && !isStep2Valido) ||
                      (step === 3 && !isStep3Valido)
                    }
                    className={`
                      px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-colors cursor-pointer
                      ${((step === 1 && isStep1Valido) || (step === 2 && isStep2Valido) || (step === 3 && isStep3Valido))
                        ? "bg-amber-600 hover:bg-amber-700 shadow-xs"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                      }
                    `}
                  >
                    Siguiente &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStep4Valido || loading}
                    className={`
                      px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all cursor-pointer
                      ${isStep4Valido && !loading
                        ? "bg-amber-600 hover:bg-amber-700 shadow-sm active:scale-99"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                      }
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      "Confirmar y Registrar"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
