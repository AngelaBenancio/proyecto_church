"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { crearIntencionMisa, obtenerIntencionesPorMes, obtenerConfiguraciones, obtenerServiciosLiturgicos, obtenerHorariosDisponibles } from "../../actions/misaActions";

const HORARIOS_MISA = ["07:00 AM", "06:00 PM", "07:00 PM"];
const TIPOS_INTENCION = [
  { id: "DIFUNTO", label: "Difunto", description: "Oración por el eterno descanso", defaultPrice: "10.00", isSacrament: false },
  { id: "SALUD", label: "Salud", description: "Petición por la recuperación y sanación", defaultPrice: "10.00", isSacrament: false },
  { id: "ACCION_DE_GRACIAS", label: "Acción de Gracias", description: "Agradecimiento por favores concedidos", defaultPrice: "10.00", isSacrament: false },
  { id: "CUMPLEANOS", label: "Cumpleaños", description: "Acción de gracias por un año más de vida", defaultPrice: "10.00", isSacrament: false },
  { id: "BAUTIZO", label: "Bautizo", description: "Celebración del bautismo", defaultPrice: "50.00", isSacrament: true },
  { id: "COMUNION", label: "Primera Comunión", description: "Recepción de la Eucaristía", defaultPrice: "30.00", isSacrament: true },
  { id: "CONFIRMACION", label: "Confirmación", description: "Unción del Espíritu Santo", defaultPrice: "50.00", isSacrament: true },
  { id: "MATRIMONIO", label: "Matrimonio", description: "Celebración de boda eclesiástica", defaultPrice: "80.00", isSacrament: true },
  { id: "OTRO", label: "Otro motivo", description: "Intenciones varias de la comunidad", defaultPrice: "10.00", isSacrament: false },
];

export default function NuevaMisaPage() {
  // Asistente (Wizard): Estado del paso actual (1 a 4)
  const [step, setStep] = useState(1);

  // Estado de configuración de sacramentos y horarios
  const [config, setConfig] = useState({
    habilitarComunion: false,
    habilitarConfirmacion: false,
    horariosMisa: ["07:00 AM", "06:00 PM", "07:00 PM"]
  });

  const [serviciosDb, setServiciosDb] = useState<any[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>(["07:00 AM", "06:00 PM", "07:00 PM"]);

  // Cargar configuraciones del sistema
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await obtenerConfiguraciones();
        if (res) {
          setConfig(res);
        }
      } catch (err) {
        console.error("Error al cargar configuraciones de la parroquia:", err);
      }
    }
    loadConfig();
  }, []);

  // Cargar Catálogo de Servicios desde la Base de Datos
  useEffect(() => {
    async function loadServicios() {
      try {
        const res = await obtenerServiciosLiturgicos();
        if (res.success && res.data) {
          setServiciosDb(res.data);
        }
      } catch (error) {
        console.error("Error al cargar catálogo de servicios de la BD:", error);
      }
    }
    loadServicios();
  }, []);

  const listadoServicios = serviciosDb.length > 0 ? serviciosDb : TIPOS_INTENCION;

  // Filtrar intenciones según configuración
  const tiposIntencionFiltrados = listadoServicios.filter(tipo => {
    if (tipo.id === "COMUNION" && !config.habilitarComunion) return false;
    if (tipo.id === "CONFIRMACION" && !config.habilitarConfirmacion) return false;
    if (tipo.activo === false) return false;
    return true;
  });

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

      const defaultHrs = config.horariosMisa.length > 0 ? config.horariosMisa : ["07:00 AM", "06:00 PM", "07:00 PM"];

      // Simular fechas: 05 (lleno), 12 (semi-lleno con 1 hora ocupada), 18 (semi-lleno con 2 horas ocupadas), 25 (lleno)
      const simData: Record<string, string[]> = {
        [`${anioStr}-${mesStr}-05`]: [...defaultHrs], // Lleno
        [`${anioStr}-${mesStr}-12`]: defaultHrs.slice(0, 1), // 1 ocupado (Semi-lleno)
        [`${anioStr}-${mesStr}-18`]: defaultHrs.slice(1, 3), // 2 ocupado (Semi-lleno)
        [`${anioStr}-${mesStr}-25`]: [...defaultHrs], // Lleno
      };

      // Fusionar datos reales y simulados
      const mergedData = { ...simData, ...dbData };
      setIntencionesPorFecha(mergedData);
    }
    cargarIntenciones();
  }, [currentYear, currentMonth, config.horariosMisa]);

  // Cargar dinámicamente los horarios disponibles según la fecha seleccionada
  useEffect(() => {
    async function loadHorarios() {
      if (!selectedDate) {
        setHorariosDisponibles([]);
        return;
      }
      try {
        const anio = selectedDate.getFullYear();
        const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dia = String(selectedDate.getDate()).padStart(2, "0");
        const fechaStr = `${anio}-${mes}-${dia}`;
        const res = await obtenerHorariosDisponibles(fechaStr);
        if (res.success && res.data) {
          setHorariosDisponibles(res.data);
        } else {
          setHorariosDisponibles(config.horariosMisa);
        }
      } catch (err) {
        console.error("Error al cargar horarios del servidor:", err);
        setHorariosDisponibles(config.horariosMisa);
      }
    }
    loadHorarios();
  }, [selectedDate, config.horariosMisa]);

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
      const sac = listadoServicios.find(t => t.id === id);
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
        return "Ej. Sofia Swilan Dan";
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
  const isHourValida = selectedHour !== "";
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

  // Banderas de requisitos dinámicos basados en la base de datos
  const requiereCamposPadresPadrinos = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.requierePadresPadrinos);
  const requiereCamposConyuge = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.requiereConyuge);

  // Banderas de documentos requeridos
  const requiereDniNino = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("DNI_NINO"));
  const requiereActaNacimiento = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("ACTA_NACIMIENTO"));
  const requiereDniContrayente1 = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("DNI_CONTRAYENTE_1"));
  const requiereDniContrayente2 = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("DNI_CONTRAYENTE_2"));
  const requiereActaBautismo = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("ACTA_BAUTISMO"));
  const requiereDniComulgante = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("DNI_COMULGANTE"));
  const requiereDniConfirmando = selectedSacraments.some(id => listadoServicios.find(s => s.id === id)?.documentosRequeridos?.includes("DNI_CONFIRMANDO"));

  // Variables de UI para secciones de renderizado
  const tieneBautizoSeleccionado = selectedSacraments.includes("BAUTIZO");
  const tieneMatrimonioSeleccionado = selectedSacraments.includes("MATRIMONIO");
  const tieneConfirmacionSeleccionado = selectedSacraments.includes("CONFIRMACION");
  const tieneComunionSeleccionado = selectedSacraments.includes("COMUNION");

  const isCamposBautizoValidos = !requiereCamposPadresPadrinos || (padresNombres.trim().length >= 5 && padrinosNombres.trim().length >= 5);
  const isCamposMatrimonioValidos = !requiereCamposConyuge || conyugeNombre.trim().length >= 3;

  // Estados de validación por paso
  const isStep1Valido = isFechaValida && isHourValida;
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
    ((!requiereDniNino || fileDniNino?.isValid) &&
     (!requiereActaNacimiento || fileActaNacimiento?.isValid) &&
     (!requiereDniContrayente1 || fileDniContrayente1?.isValid) &&
     (!requiereDniContrayente2 || fileDniContrayente2?.isValid) &&
     (!requiereActaBautismo || fileActaBautismo?.isValid) &&
     (!requiereDniComulgante || fileDniComulgante?.isValid) &&
     (!requiereDniConfirmando || fileDniConfirmando?.isValid));

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

    try {
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
          .map((id) => listadoServicios.find((t) => t.id === id)?.label || id)
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

      if (res.success && res.trackingId) {
        // Disparar el envío de correo de ticket a través de la API Route en segundo plano
        try {
          fetch("/api/send-ticket", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombreSolicitante,
              telefonoSolicitante,
              emailSolicitante,
              tipoCelebracion: selectedSacraments.length > 0 ? "SACRAMENTO" : "INTENCION",
              tipoIntencion: finalTipoIntencion,
              nombreIntencion: finalNombreIntencion,
              fechaMisa: fechaMisaStr,
              horaMisa: selectedHour,
              montoOfrenda: parseFloat(montoOfrenda) || 0,
              codigoOperacion: codigoYape,
              documentos: archivosMensaje,
            }),
          }).catch((err) => console.error("Error asíncrono al disparar el ticket:", err));
        } catch (err) {
          console.error("Error al llamar a la API de tickets:", err);
        }

        setSuccessData({ trackingId: res.trackingId });
      } else {
        setServerError(res.error || "Ocurrió un error al procesar el formulario.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error de excepción en el registro:", err);
      setServerError("Ocurrió un problema de red o conexión al comunicarse con el servidor. Intente de nuevo.");
      setLoading(false);
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
    <main className="min-h-screen bg-gradient-to-tr from-[#E3DFD2] via-[#F5F2EA] to-[#EAE5D8] text-[#2B2B2B] pb-24 font-sans selection:bg-[#E69526]/20">
      
      {/* Importar fuentes premium de Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', Georgia, serif !important;
        }
        .font-sans {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif !important;
        }
        
        /* Ocultar barra de scroll para navegación de pasos en móviles */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header con Pasos Integrados y Degradado Litúrgico */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#80385e] via-[#a35b80] to-[#964a75] text-white py-3 px-4 sm:px-8 shadow-md border-b border-[#a35b80]/20 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full min-h-[40px] gap-3">
          {/* Volver al Inicio (Alineado a la Izquierda) */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white transition-colors shrink-0"
          >
            <span className="text-sm font-semibold">&larr;</span> <span className="hidden sm:inline">Volver al Inicio</span><span className="sm:hidden">Inicio</span>
          </Link>
          
          {/* Pasos Centrados en el Header */}
          <div className="flex-1 flex items-center justify-center gap-x-2 sm:gap-x-6 select-none overflow-x-auto no-scrollbar py-1">
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
                <div key={s.number} className="relative flex flex-col items-center shrink-0">
                  <span
                    className={`
                      text-[10px] sm:text-xs font-bold uppercase tracking-wider px-1.5 pb-1 border-b-2 transition-all duration-200
                      ${isSkipped
                        ? "text-white/20 border-transparent line-through cursor-not-allowed text-[8px]"
                        : isActive
                          ? "text-white border-[#E5B23B]" // Dorado brillante litúrgico
                          : isCompleted
                            ? "text-white/80 border-transparent hover:text-white"
                            : "text-white/50 border-transparent hover:text-white/70"
                      }
                    `}
                  >
                    {isSkipped ? (
                      <span className="line-through">
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{s.number}</span>
                      </span>
                    ) : (
                      <>
                        <span className="sm:hidden">{isActive ? s.label : s.number}</span>
                        <span className="hidden sm:inline">{s.label}</span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {successData ? (
          /* PANTALLA DE ÉXITO */
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-white to-[#FAF8F5]/90 border border-white/60 rounded-3xl p-8 sm:p-12 shadow-xl shadow-[#9E9A85]/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#a35b80] via-[#a35b80] to-[#E69526]" />
            
            <div className="w-16 h-16 bg-[#a35b80]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#a35b80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B2B2B] tracking-tight mb-3">
              ¡Reserva Enviada Exitosamente!
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] font-light mb-8 max-w-md mx-auto leading-relaxed">
              Su solicitud fue enviada con éxito. El despacho parroquial verificará su ofrenda y la documentación provista, enviándole una confirmación a su correo.
            </p>

            <div className="bg-[#FAF8F3] border border-[#EADCB9]/40 rounded-2xl p-6 text-left mb-8 max-w-md mx-auto shadow-2xs">
              <div className="text-[10px] uppercase tracking-widest text-[#8C6B2F] font-bold mb-4 border-b border-[#E0E0E0] pb-2">
                Resumen del Registro
              </div>
              <div className="grid grid-cols-3 gap-y-3 text-xs text-[#2B2B2B]">
                <span className="text-[#666666] font-light">Seguimiento:</span>
                <span className="col-span-2 font-mono font-bold text-[#a35b80] break-all select-all">{successData.trackingId}</span>

                <span className="text-[#666666] font-light">Solicitante:</span>
                <span className="col-span-2 font-medium">{nombreSolicitante}</span>

                <span className="text-[#666666] font-light">Destinado a:</span>
                <span className="col-span-2 font-medium">
                  {nombreIntencion}
                  {selectedSacraments.length >= 2 && isMismaPersona === false && ` y ${nombreSegundaPersona}`}
                  {" "}
                  <span className="text-[10px] text-[#666666] block font-normal mt-0.5">
                    ({selectedSacraments.length > 0
                      ? selectedSacraments.map(id => listadoServicios.find(t => t.id === id)?.label || id).join(", ")
                      : listadoServicios.find(t => t.id === tipoIntencion)?.label || tipoIntencion})
                  </span>
                </span>

                <span className="text-[#666666] font-light">Fecha de Misa:</span>
                <span className="col-span-2 font-medium">
                  {selectedDate?.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>

                <span className="text-[#666666] font-light">Horario:</span>
                <span className="col-span-2 font-medium">{selectedHour}</span>

                <span className="text-[#666666] font-light">Ofrenda Yape:</span>
                <span className="col-span-2 font-medium">S/. {montoOfrenda} (Op: ***{codigoYape})</span>
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
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#2B2B2B] bg-transparent border border-[#2B2B2B] hover:bg-[#D3CEBA]/30 transition-colors rounded-xl cursor-pointer"
              >
                Registrar Otra Solicitud
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#a35b80] to-[#8c456b] hover:from-[#8c456b] hover:to-[#6e3152] transition-all rounded-xl shadow-md"
              >
                Volver a Inicio
              </Link>
            </div>
          </div>
        ) : (
          /* ASISTENTE MULTIPASOS */
          <div className="max-w-6xl mx-auto">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 mb-6 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            {step === 1 ? (
              /* PASO 1: PROGRAMACIÓN FUERA DE LA TARJETA PRINCIPAL (EN EL BODY) */
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Calendario en su propia tarjeta con Fondo Sólido */}
                  <div 
                    className="lg:col-span-7 bg-[#FFFDF9] border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-[#E0E0E0]/60 pb-3 gap-4 md:gap-0">
                        <div className="flex items-center justify-between w-full md:w-auto">
                          <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2B2B2B] whitespace-nowrap">1. Seleccione la Fecha</h3>
                          
                          {/* SVG para Móvil (Visible solo en pantallas pequeñas) */}
                          <div className="md:hidden flex justify-center">
                            <svg className="w-10 h-10 text-[#9A8F82] opacity-70 drop-shadow-sm transition-all" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 90 L90 90" />
                              <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                              <path d="M50 3 L50 12 M46 7 L54 7" />
                              <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                              <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                              <circle cx="50" cy="50" r="5" />
                              <circle cx="50" cy="50" r="1.5" />
                              <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                              <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                              <path d="M35 53 L20 60 M65 53 L80 60" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* SVG Centrado (Solo Escritorio) */}
                        <div className="hidden md:flex flex-1 justify-center mx-4">
                          <svg className="w-12 h-12 lg:w-16 lg:h-16 text-[#9A8F82] opacity-70 drop-shadow-sm transition-all" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 90 L90 90" />
                            <path d="M40 40 L50 15 L60 40 L60 90 L40 90 Z" />
                            <path d="M50 3 L50 12 M46 7 L54 7" />
                            <path d="M20 90 L20 60 L40 50 M80 90 L80 60 L60 50" />
                            <path d="M43 90 L43 70 A7 7 0 0 1 57 70 L57 90" />
                            <circle cx="50" cy="50" r="5" />
                            <circle cx="50" cy="50" r="1.5" />
                            <path d="M26 80 L26 70 A4 4 0 0 1 34 70 L34 80 Z" />
                            <path d="M66 80 L66 70 A4 4 0 0 1 74 70 L74 80 Z" />
                            <path d="M35 53 L20 60 M65 53 L80 60" />
                          </svg>
                        </div>
                        
                        {/* Controles del Mes con Estética Límpida */}
                        <div className="flex items-center justify-between md:justify-start gap-1.5 bg-[#FAF8F3]/80 border border-[#EADCB9]/40 p-1 rounded-xl shadow-2xs shrink-0 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={mesAnterior}
                            disabled={currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth()}
                            className="p-1.5 rounded-lg bg-white border border-[#E0E0E0] hover:bg-[#D3CEBA]/20 text-[#2B2B2B] disabled:opacity-30 cursor-pointer transition-all font-bold text-xs"
                          >
                            &larr;
                          </button>
                          <span className="text-[10px] font-bold text-[#8C6B2F] min-w-[90px] text-center uppercase tracking-wider font-sans">
                            {mesesNombres[currentMonth]} {currentYear}
                          </span>
                          <button
                            type="button"
                            onClick={mesSiguiente}
                            className="p-1.5 rounded-lg bg-white border border-[#E0E0E0] hover:bg-[#D3CEBA]/20 text-[#2B2B2B] cursor-pointer transition-all font-bold text-xs"
                          >
                            &rarr;
                          </button>
                        </div>
                      </div>



                      {/* Cuadrícula de Fechas */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#8C6B2F] uppercase mb-4 tracking-wider">
                        <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
                      </div>
                      <div className="grid grid-cols-7 gap-x-1 sm:gap-x-2 gap-y-2 sm:gap-y-4">
                        {celdasCalendario.map((day, idx) => {
                          if (day === null) {
                            return <div key={`empty-${idx}`} className="aspect-square bg-transparent" />;
                          }

                          const esPasado = esFechaPasada(day);
                          const esSeleccionada = esFechaSeleccionada(day);
                          const formattedDate = day.toISOString().split("T")[0];
                          const horasOcupadas = intencionesPorFecha[formattedDate] || [];
                          const esDiaLleno = horasOcupadas.length >= config.horariosMisa.length;

                          // Días del pasado: burbuja gris atenuada inhabilitada
                          if (esPasado) {
                            return (
                              <div key={formattedDate} className="aspect-square flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 relative select-none">
                                <div className="w-full max-w-[48px] aspect-square text-xs sm:text-sm md:text-base rounded-full bg-[#D3CEBA]/25 border border-[#E0E0E0]/20 text-[#2B2B2B]/35 flex items-center justify-center font-bold cursor-not-allowed">
                                  {day.getDate()}
                                </div>
                              </div>
                            );
                          }

                          // Burbuja seleccionada: Sólido Fucsia con halo doble rosado
                          if (esSeleccionada) {
                            return (
                              <div key={formattedDate} className="aspect-square flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(day);
                                    setSelectedHour("");
                                  }}
                                  className="w-full max-w-[48px] aspect-square text-xs sm:text-sm md:text-base rounded-full bg-[#a35b80] text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-[#a35b80]/20 ring-offset-2 ring-offset-white transition-all duration-200 cursor-pointer select-none shrink-0"
                                >
                                  {day.getDate()}
                                </button>
                              </div>
                            );
                          }

                          // Burbuja Lleno / Ocupado total: Sólido Carmesí Ocupado (#bd3a42)
                          if (esDiaLleno) {
                            return (
                              <div key={formattedDate} className="aspect-square flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 relative">
                                <button
                                  type="button"
                                  disabled
                                  className="w-full max-w-[48px] aspect-square text-xs sm:text-sm md:text-base rounded-full bg-[#bd3a42] border-2 border-[#a82931] text-white flex flex-col items-center justify-center font-bold cursor-not-allowed select-none shrink-0 relative opacity-95 shadow-md"
                                >
                                  <span className="line-through text-white/90">{day.getDate()}</span>
                                  <span className="text-[7px] font-black uppercase tracking-widest text-white/90 mt-0.5 block scale-90">Lleno</span>
                                </button>
                              </div>
                            );
                          }

                          // Burbuja Parcial (1/3 o 2/3): Rellenado hasta la mitad con dorado
                          if (horasOcupadas.length > 0) {
                            return (
                              <div key={formattedDate} className="aspect-square flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(day);
                                    setSelectedHour("");
                                  }}
                                  className="w-full max-w-[48px] aspect-square text-xs sm:text-sm md:text-base rounded-full bg-gradient-to-r from-[#E69526] from-50% to-white to-50% border-2 border-[#E69526] text-[#2B2B2B] flex items-center justify-center font-bold hover:scale-105 transition-all duration-200 cursor-pointer select-none shrink-0 shadow-2xs"
                                >
                                  {day.getDate()}
                                </button>
                              </div>
                            );
                          }

                          // Burbuja Libre (0/3): Fondo Blanco con Borde Dorado
                          return (
                            <div key={formattedDate} className="aspect-square flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDate(day);
                                  setSelectedHour("");
                                }}
                                className="w-full max-w-[48px] aspect-square text-xs sm:text-sm md:text-base rounded-full bg-white text-[#2B2B2B] flex items-center justify-center font-bold border-2 border-[#E69526] hover:bg-[#E69526]/5 hover:scale-105 transition-all duration-200 cursor-pointer select-none shrink-0 shadow-2xs"
                              >
                                {day.getDate()}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Leyenda de Burbujas Sincronizada */}
                      <div className="mt-6 pt-4 border-t border-[#E0E0E0]/60 flex justify-center items-center gap-6 text-[10px] font-bold text-[#8C6B2F] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#E69526] shadow-3xs" />
                          <span>Libre</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#E69526] from-50% to-white to-50% border-2 border-[#E69526] shadow-3xs" />
                          <span>Parcial</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#bd3a42] border-2 border-[#a82931] shadow-3xs" />
                          <span>Lleno</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horario y Celebración en la columna derecha */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Tarjeta de Horario */}
                    <div className="bg-[#FFFDF9] border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 border-b border-[#E0E0E0]/60 pb-3">
                        <h3 className="font-serif text-lg font-medium text-[#2B2B2B]">2. Horario</h3>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                         {horariosDisponibles.map((hora) => {
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
                                group flex items-center justify-between py-1 transition-all w-full text-left
                                ${esHoraOcupada ? "opacity-50 cursor-not-allowed" : !selectedDate ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                              `}
                            >
                              <span className={`font-serif text-[11px] tracking-wider uppercase ${esSeleccionado ? "text-[#80385e] font-bold" : "text-[#5C554B]"}`}>
                                {hora}
                              </span>
                              <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-4px]" />
                              <span className={`
                                px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shrink-0
                                ${esHoraOcupada 
                                  ? "bg-[#D3CEBA]/30 text-red-700/60 line-through" 
                                  : esSeleccionado 
                                    ? "bg-[#80385e] text-white shadow-sm" 
                                    : "bg-[#EADCB9]/40 text-[#5C554B] group-hover:bg-[#EADCB9]/70"
                                }
                              `}>
                                {esHoraOcupada ? "Ocupado" : "Seleccionar"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tarjeta de Tipo de Celebración (Movida a la derecha) */}
                    <div className="bg-[#FFFDF9] border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 border-b border-[#E0E0E0]/60 pb-3">
                        <h3 className="font-serif text-lg font-medium text-[#2B2B2B]">3. Tipo de Celebración</h3>
                      </div>
                      
                      <div className="flex flex-col gap-5">
                        {tiposIntencionFiltrados.map((tipo) => {
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
                              className="group flex items-start sm:items-center justify-between transition-all cursor-pointer w-full text-left"
                            >
                              <div className="flex-1 pr-2">
                                <span className={`font-serif text-[10px] sm:text-[11px] tracking-wider uppercase block leading-tight mt-0.5 ${esSeleccionado ? "text-[#80385e] font-bold" : "text-[#5C554B]"}`}>
                                  {tipo.label}
                                </span>
                              </div>
                              <div className="hidden sm:block flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 mx-3 relative top-[-6px]" />
                              <div className="shrink-0 pt-1 sm:pt-0">
                                <span className={`
                                  px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest transition-all block text-center
                                  ${esSeleccionado 
                                    ? "bg-[#80385e] text-white shadow-sm" 
                                    : "bg-[#EADCB9]/40 text-[#5C554B] group-hover:bg-[#EADCB9]/70"
                                  }
                                `}>
                                  S/. {tipo.defaultPrice}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Botón Continuar (Paso 1) - Movido al pie de página */}
                <div className="flex justify-end items-center pt-6 border-t border-[#EADCB9]/40 mt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStep1Valido}
                    className={`
                      w-full sm:w-auto px-8 py-3.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm
                      ${isStep1Valido
                        ? "bg-[#80385e] text-white hover:bg-[#964a75] active:scale-95"
                        : "bg-[#F9F5EC] text-[#8C7A6B]/50 border border-[#EADCB9]/40 cursor-not-allowed"
                      }
                    `}
                  >
                    Continuar &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* PASOS 2, 3 Y 4: DENTRO DE LA TARJETA BLANCA PRINCIPAL */
              <div className="bg-[#FFFDF9] border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-10 shadow-sm relative">

                {step === 2 && (
                  <div className="space-y-8 animate-fadeIn">
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-[#2B2B2B] uppercase tracking-tight border-b border-[#EADCB9]/40 pb-4 mb-6">
                      Información del Solicitante y Celebración
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6">
                      <div>
                        <label htmlFor="nombre" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                          Nombre del Solicitante *
                        </label>
                        <input
                          id="nombre"
                          type="text"
                          required
                          value={nombreSolicitante}
                          onChange={(e) => setNombreSolicitante(e.target.value)}
                          placeholder="Ej. Maha Torres Swilan"
                          className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                        />
                        {nombreSolicitante && !isNombreValido && (
                          <span className="text-[9px] text-[#80385e] mt-1 block font-medium">El nombre debe tener al menos 3 caracteres.</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="telefono" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                          Celular (Perú) *
                        </label>
                        <input
                          id="telefono"
                          type="tel"
                          required
                          value={telefonoSolicitante}
                          onChange={handleTelefonoChange}
                          placeholder="Ej. 987654321"
                          className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                        />
                        {telefonoSolicitante && !isTelefonoValido && (
                          <span className="text-[9px] text-[#80385e] mt-1 block font-medium">Debe ser celular de 9 dígitos y empezar con 9.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                        Correo Electrónico *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={emailSolicitante}
                        onChange={(e) => setEmailSolicitante(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                      />
                      {emailSolicitante && !isEmailValido && (
                        <span className="text-[9px] text-[#80385e] mt-1 block font-medium">Ingrese un correo electrónico válido.</span>
                      )}
                    </div>

                    {/* Combo sacramental - Pregunta de misma persona */}
                    {selectedSacraments.length >= 2 && (
                      <div className="bg-transparent border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-8 space-y-6">
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
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
                            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                              isMismaPersona === true
                                ? "bg-[#80385e] text-white shadow-sm"
                                : "bg-transparent text-[#8C7A6B] border border-[#EADCB9] hover:bg-[#FFFDF9]"
                            }`}
                          >
                            Sí, misma persona
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsMismaPersona(false)}
                            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                              isMismaPersona === false
                                ? "bg-[#80385e] text-white shadow-sm"
                                : "bg-transparent text-[#8C7A6B] border border-[#EADCB9] hover:bg-[#FFFDF9]"
                            }`}
                          >
                            No, personas distintas
                          </button>
                        </div>
                        
                        {isMismaPersona === false && (
                          <div className="border-t border-[#D3CEBA]/50 pt-6 space-y-6 mt-6">
                            <h4 className="font-serif text-lg font-light text-[#80385e] tracking-tight">
                              Datos de la Segunda Persona
                            </h4>
                            <div>
                              <label htmlFor="nombreSegunda" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                                Nombre completo *
                              </label>
                              <input
                                id="nombreSegunda"
                                type="text"
                                required
                                value={nombreSegundaPersona}
                                onChange={(e) => setNombreSegundaPersona(e.target.value)}
                                placeholder="Ej. Nombre del segundo festejado"
                                className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                              />
                              {nombreSegundaPersona && nombreSegundaPersona.trim().length < 3 && (
                                <span className="text-[9px] text-[#80385e] mt-1 block">Debe tener al menos 3 caracteres.</span>
                              )}
                            </div>
                            <div>
                              <label htmlFor="dniSegunda" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                                DNI *
                              </label>
                              <input
                                id="dniSegunda"
                                type="text"
                                required
                                value={dniSegundaPersona}
                                onChange={(e) => setDniSegundaPersona(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                placeholder="DNI de 8 dígitos"
                                className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                              />
                              {dniSegundaPersona && dniSegundaPersona.length !== 8 && (
                                <span className="text-[9px] text-[#80385e] mt-1 block">Debe tener exactamente 8 números.</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nombre del festejado principal (Dinámico) */}
                    <div>
                      <label htmlFor="nombreIntencion" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                        {obtenerLabelNombreIntencion()}
                      </label>
                      <input
                        id="nombreIntencion"
                        type="text"
                        required
                        value={nombreIntencion}
                        onChange={(e) => setNombreIntencion(e.target.value)}
                        placeholder={obtenerPlaceholderNombreIntencion()}
                        className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                      />
                      {nombreIntencion && !isNombreIntencionValido && (
                        <span className="text-[9px] text-[#80385e] mt-1 block font-medium">El nombre debe tener al menos 3 caracteres.</span>
                      )}
                    </div>

                    {/* Datos condicionales de Bautizos (Padres/Padrinos) */}
                    {requiereCamposPadresPadrinos && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6 bg-transparent border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-8">
                        <div>
                          <label htmlFor="padres" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                            Nombres de los Padres *
                          </label>
                          <input
                            id="padres"
                            type="text"
                            required
                            value={padresNombres}
                            onChange={(e) => setPadresNombres(e.target.value)}
                            placeholder="Ej. Pedro Pérez y Ana Ramos"
                            className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                          />
                          {padresNombres && padresNombres.trim().length < 5 && (
                            <span className="text-[9px] text-[#80385e] mt-1 block">Mínimo 5 caracteres.</span>
                          )}
                        </div>
                        <div>
                          <label htmlFor="padrinos" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                            Nombres de los Padrinos *
                          </label>
                          <input
                            id="padrinos"
                            type="text"
                            required
                            value={padrinosNombres}
                            onChange={(e) => setPadrinosNombres(e.target.value)}
                            placeholder="Ej. Juan Ruiz y Rosa Medina"
                            className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                          />
                          {padrinosNombres && padrinosNombres.trim().length < 5 && (
                            <span className="text-[9px] text-[#80385e] mt-1 block">Mínimo 5 caracteres.</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Datos condicionales de Matrimonio (Cónyuge) */}
                    {requiereCamposConyuge && (
                      <div className="bg-transparent border border-[#EADCB9]/40 rounded-3xl p-6 sm:p-8">
                        <label htmlFor="conyuge" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                          Nombre del Cónyuge / Segundo Contrayente *
                        </label>
                        <input
                          id="conyuge"
                          type="text"
                          required
                          value={conyugeNombre}
                          onChange={(e) => setConyugeNombre(e.target.value)}
                          placeholder="Ej. Nombre del segundo contrayente"
                          className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA]"
                        />
                        {conyugeNombre && conyugeNombre.trim().length < 3 && (
                          <span className="text-[9px] text-[#80385e] mt-1 block">Mínimo 3 caracteres.</span>
                        )}
                      </div>
                    )}

                    {/* Mensaje u Observaciones */}
                    <div>
                      <label htmlFor="mensaje" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8C7A6B] mb-1.5">
                        Observaciones / Peticiones Especiales (Opcional)
                      </label>
                      <textarea
                        id="mensaje"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        placeholder="Ej. por sus 16 años, primer mes de fallecido, u otros detalles"
                        rows={3}
                        className="w-full text-sm px-4 py-3 bg-[#F9F5EC]/50 border border-[#EADCB9] rounded-2xl focus:outline-none focus:border-[#80385e] focus:ring-1 focus:ring-[#80385e] text-[#2B2B2B] font-light transition-all placeholder:text-[#D3CEBA] resize-none mt-2"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg font-medium text-[#2B2B2B] border-b border-[#E0E0E0] pb-3">
                      Requisitos Documentales Obligatorios
                    </h3>
                    <p className="text-[11px] text-[#666666] font-light leading-relaxed">
                      Adjunte copias digitales de los documentos solicitados. Solo se permiten formatos **PDF, JPG, JPEG o PNG** con tamaño máximo de **5MB**.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Requisitos para Bautizo */}
                      {tieneBautizoSeleccionado && (
                        <>
                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">DNI del Niño/a a Bautizar *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Copia simple del documento de identidad o certificado de nacido vivo.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileDniNino && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileDniNino.name} 
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileDniNino.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileDniNino.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileDniNino.isValid ? "Validado ✓" : `Subiendo... ${fileDniNino.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">Acta de Nacimiento *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Acta oficial de RENIEC legible.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileActaNacimiento && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileActaNacimiento.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileActaNacimiento.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileActaNacimiento.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
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
                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">DNI del Primer Contrayente *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Copia simple del DNI del novio o la novia.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileDniContrayente1 && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileDniContrayente1.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileDniContrayente1.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileDniContrayente1.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileDniContrayente1.isValid ? "Validado ✓" : `Subiendo... ${fileDniContrayente1.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">DNI del Segundo Contrayente *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Copia simple del DNI de la pareja.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileDniContrayente2 && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileDniContrayente2.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileDniContrayente2.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileDniContrayente2.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileDniContrayente2.isValid ? "Validado ✓" : `Subiendo... ${fileDniContrayente2.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] md:col-span-2 shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">Partida de Bautizo de ambos Contrayentes *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Actas de bautismo legalizadas emitidas por sus parroquias de origen.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileActaBautismo && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileActaBautismo.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileActaBautismo.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileActaBautismo.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileActaBautismo.isValid ? "Validado ✓" : `Subiendo... ${fileActaBautismo.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Requisitos para Primera Comunión */}
                      {tieneComunionSeleccionado && !tieneBautizoSeleccionado && !tieneMatrimonioSeleccionado && (
                        <>
                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">DNI del Comulgante *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Copia del DNI del menor o adulto.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileDniComulgante && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileDniComulgante.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileDniComulgante.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileDniComulgante.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileDniComulgante.isValid ? "Validado ✓" : `Subiendo... ${fileDniComulgante.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">Fe de Bautismo *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Constancia de bautismo del comulgante.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileActaBautismo && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileActaBautismo.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileActaBautismo.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileActaBautismo.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileActaBautismo.isValid ? "Validado ✓" : `Subiendo... ${fileActaBautismo.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Requisitos para Confirmación */}
                      {tieneConfirmacionSeleccionado && !tieneBautizoSeleccionado && !tieneMatrimonioSeleccionado && (
                        <>
                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">DNI del Confirmando *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Copia simple del DNI vigente.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileDniConfirmando && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileDniConfirmando.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileDniConfirmando.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileDniConfirmando.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
                                    {fileDniConfirmando.isValid ? "Validado ✓" : `Subiendo... ${fileDniConfirmando.progress}%`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border border-[#EADCB9]/40 rounded-2xl p-4 bg-[#FAF8F3] flex flex-col justify-between min-h-[140px] shadow-2xs">
                            <div>
                              <div className="text-xs font-bold text-[#2B2B2B]">Partida de Bautizo *</div>
                              <p className="text-[10px] text-[#666666] mt-1">Constancia oficial de bautismo del confirmando.</p>
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-xl bg-[#FFFFFF] hover:bg-[#D3CEBA]/20 text-[10px] font-bold text-[#2B2B2B] cursor-pointer shadow-2xs"
                              >
                                📁 Seleccionar Archivo
                              </label>
                              {fileActaBautismo && (
                                <div className="mt-2 text-[10px] font-medium text-[#666666]">
                                  📄 {fileActaBautismo.name}
                                  <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full mt-1 overflow-hidden relative">
                                    <div className="bg-[#a35b80] h-full transition-all duration-300" style={{ width: `${fileActaBautismo.progress}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1 block ${fileActaBautismo.isValid ? "text-emerald-700" : "text-[#666666] animate-pulse"}`}>
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

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg font-medium text-[#2B2B2B] border-b border-[#E0E0E0] pb-3">
                      Ofrenda de Celebración
                    </h3>

                    {/* Tarjeta de Resumen Detallado (Estilo Elegante Spa/Iglesia) */}
                    <div className="bg-[#FCFAF8] border border-[#F2EFE9] rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-2xl relative">
                      
                      {/* Cabecera con título e ilustración */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="pt-2">
                          <h3 className="font-serif text-2xl tracking-[0.2em] text-[#3A332B] uppercase leading-tight">
                            Resumen<br/>
                            <span className="font-light text-[#5C5346]">Solicitud</span>
                          </h3>
                        </div>
                        <div className="shrink-0 opacity-80">
                          {/* Ilustración de Iglesia en líneas finas */}
                          <svg viewBox="0 0 100 100" fill="none" stroke="#9A8C78" strokeWidth="0.7" className="w-24 h-24 -mt-4 -mr-4">
                            <path d="M50 8 v12 M46 12 h8" strokeLinecap="round" />
                            <path d="M50 20 L30 40 v50 h40 V40 z" strokeLinejoin="round" />
                            <path d="M30 40 L20 50 v40 h10 M70 40 L80 50 v40 h-10" strokeLinejoin="round" />
                            <path d="M42 90 V75 a8 8 0 0 1 16 0 V90" />
                            <circle cx="50" cy="52" r="5" />
                            <path d="M24 65 h4 v15 h-4 z M72 65 h4 v15 h-4 z" />
                            {/* Detalles de vitrales simples */}
                            <path d="M46 60 h8 M46 64 h8 M46 68 h8" strokeWidth="0.4" strokeDasharray="1 1" />
                          </svg>
                        </div>
                      </div>

                      {/* Línea divisoria */}
                      <div className="w-full h-px bg-[#EADCB9]/50 mb-6" />

                      {/* Descripción */}
                      <p className="text-[11px] text-[#8C7A6B] font-light leading-relaxed mb-8 pr-4 max-w-[90%] sm:max-w-[80%]">
                        Verifica los detalles de tu celebración.
                      </p>

                      {/* Lista de Detalles */}
                      <div className="space-y-6">
                        
                        {/* Ítem 1: Celebración */}
                        <div className="flex items-end gap-3">
                          <div className="flex flex-col">
                            <span className="font-serif text-[12px] sm:text-[13px] text-[#3A332B] uppercase tracking-wider">
                              {selectedSacraments.length > 0 
                                ? selectedSacraments.map(id => listadoServicios.find(t => t.id === id)?.label || id).join(", ")
                                : listadoServicios.find(t => t.id === tipoIntencion)?.label || tipoIntencion
                              }
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-[#9A8C78] font-light tracking-wide">Celebración</span>
                          </div>
                          
                          <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                          
                          <div className="shrink-0 pb-0.5">
                            <span className="bg-[#F0EBE1] text-[#7A6B58] text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider whitespace-nowrap">
                              S/ {montoOfrenda}
                            </span>
                          </div>
                        </div>

                        {/* Ítem 2: Intención (Si existe) */}
                        {nombreIntencion && (
                          <div className="flex items-end gap-3">
                            <div className="flex flex-col">
                              <span className="font-serif text-[12px] sm:text-[13px] text-[#3A332B] uppercase tracking-wider line-clamp-1">
                                {nombreIntencion}
                                {conyugeNombre && ` y ${conyugeNombre}`}
                                {nombreSegundaPersona && isMismaPersona === false && ` y ${nombreSegundaPersona}`}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-[#9A8C78] font-light tracking-wide">Festejado / Intención</span>
                            </div>
                            
                            <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                            
                            <div className="shrink-0 pb-0.5">
                              <span className="bg-[#EAE5DA] text-[#6B5A47] text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider whitespace-nowrap">
                                {tipoIntencion === 'DIFUNTO' ? 'EN MEMORIA' 
                                 : ['BAUTIZO', 'COMUNION', 'CONFIRMACION', 'MATRIMONIO', 'CUMPLEANOS'].includes(tipoIntencion) ? 'FESTEJADO' 
                                 : 'INTENCIÓN'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Ítem 3: Fecha y Hora */}
                        <div className="flex items-end gap-3">
                          <div className="flex flex-col">
                            <span className="font-serif text-[12px] sm:text-[13px] text-[#3A332B] uppercase tracking-wider">
                              {selectedDate ? selectedDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-[#9A8C78] font-light tracking-wide">Fecha Litúrgica</span>
                          </div>
                          
                          <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                          
                          <div className="shrink-0 pb-0.5">
                            <span className="bg-[#E4E9E1] text-[#5A6B55] text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider whitespace-nowrap">
                              {selectedHour}
                            </span>
                          </div>
                        </div>

                        {/* Ítem 4: Solicitante */}
                        <div className="flex items-end gap-3">
                          <div className="flex flex-col w-[50%] sm:w-auto">
                            <span className="font-serif text-[12px] sm:text-[13px] text-[#3A332B] uppercase tracking-wider truncate max-w-[200px] sm:max-w-[250px]">
                              {nombreSolicitante}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-[#9A8C78] font-light tracking-wide truncate">Contacto: {emailSolicitante}</span>
                          </div>
                          
                          <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                          
                          <div className="shrink-0 pb-0.5">
                            <span className="bg-[#EBE2E3] text-[#78595D] text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider whitespace-nowrap">
                              {telefonoSolicitante}
                            </span>
                          </div>
                        </div>

                        {/* Ítem 5: Observación (Si existe) */}
                        {mensaje && (
                          <div className="flex items-end gap-3 mt-4">
                            <div className="flex flex-col w-[70%] sm:w-[80%]">
                              <span className="font-serif text-[12px] sm:text-[13px] text-[#3A332B] uppercase tracking-wider line-clamp-2" title={mensaje}>
                                {mensaje}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-[#9A8C78] font-light tracking-wide">Observación Especial</span>
                            </div>
                            
                            <div className="flex-1 border-b-[1.5px] border-dotted border-[#D3CEBA]/70 relative top-[-6px]" />
                            
                            <div className="shrink-0 pb-0.5">
                              <span className="bg-[#E4E4E9] text-[#555B6B] text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider whitespace-nowrap">
                                DETALLE
                              </span>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Documentos Cargados (Opcional) */}
                      {(fileDniNino || fileActaNacimiento || fileDniContrayente1 || fileDniContrayente2 || fileActaBautismo || fileDniComulgante || fileDniConfirmando) && (
                        <div className="mt-8 border-t border-[#EADCB9]/40 pt-5">
                          <span className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest mb-3">Documentos Adjuntos</span>
                          <div className="flex flex-wrap gap-2">
                            {fileDniNino && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ DNI Niño</span>}
                            {fileActaNacimiento && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ Acta Nacimiento</span>}
                            {fileDniContrayente1 && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ DNI Novio 1</span>}
                            {fileDniContrayente2 && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ DNI Novio 2</span>}
                            {fileActaBautismo && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ Acta Bautismo</span>}
                            {fileDniComulgante && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ DNI Comulgante</span>}
                            {fileDniConfirmando && <span className="bg-white text-[#7A6B58] border border-[#EADCB9] text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">✓ DNI Confirmando</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 items-center bg-[#FCFAF8] border border-[#F2EFE9] rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A8C78]">Aporte</span>
                          <div className="text-4xl font-serif font-semibold text-[#3A332B] mt-1 tracking-tight">
                            S/ {montoOfrenda}
                          </div>
                          {selectedSacraments.length >= 2 && (
                            <span className="text-[9px] text-[#5A6B55] font-bold bg-[#E4E9E1] px-3 py-1.5 rounded-full mt-3 inline-block tracking-widest uppercase">
                              Descuento de Combo Aplicado
                            </span>
                          )}
                        </div>

                        <div className="w-12 h-px bg-[#EADCB9]/80" />

                        <ul className="text-[11px] text-[#8C7A6B] font-light space-y-2.5 list-none">
                          <li className="flex items-start gap-2">
                            <span className="text-[#D3CEBA] text-[14px] leading-none mt-0.5">•</span>
                            <span>Escanea el código QR desde tu aplicación Yape.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#D3CEBA] text-[14px] leading-none mt-0.5">•</span>
                            <span>O yapea al número <strong className="text-[#3A332B] font-medium tracking-wide">987 654 321</strong> (Parroquia Patrocinio).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#D3CEBA] text-[14px] leading-none mt-0.5">•</span>
                            <span>Ingresa los <strong className="text-[#3A332B] font-medium tracking-wide">últimos 3 dígitos</strong> de la operación debajo.</span>
                          </li>
                        </ul>
                      </div>

                      {/* QR Minimalista Elegante */}
                      <div className="w-36 h-36 sm:w-44 sm:h-44 border border-[#F2EFE9] bg-white rounded-[2rem] flex flex-col items-center justify-center p-5 relative shrink-0 shadow-sm group hover:shadow-md transition-all">
                        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#742384] shadow-md flex items-center justify-center text-[16px] text-white font-bold tracking-tighter border-[3px] border-white z-10">
                          Y
                        </div>
                        <svg className="w-20 h-20 sm:w-24 sm:h-24 text-[#3A332B] opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100" fill="currentColor">
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
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7A6B] mt-3">Escanear</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="monto" className="block text-[10px] font-bold uppercase tracking-wider text-[#8C6B2F] mb-1.5">
                          Monto de Ofrenda (S/.) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B] font-medium">S/.</span>
                          <input
                            id="monto"
                            type="text"
                            required
                            readOnly
                            value={montoOfrenda}
                            placeholder="10.00"
                            className="w-full text-xs pl-9 pr-4 py-3 bg-[#F5F2EA] border border-[#E1DBCB]/70 rounded-xl text-[#7A6B58] font-bold cursor-not-allowed select-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="yape" className="block text-[10px] font-bold uppercase tracking-wider text-[#8C6B2F] mb-1.5">
                          Últimos 3 dígitos de operación Yape *
                        </label>
                        <input
                          id="yape"
                          type="text"
                          required
                          value={codigoYape}
                          onChange={handleYapeChange}
                          placeholder="Ej. 182"
                          className="w-full text-xs px-4 py-3 bg-[#FFFFFF] border border-[#E1DBCB] rounded-xl focus:outline-none focus:border-[#E69526] focus:ring-4 focus:ring-[#E69526]/10 font-mono text-[#2B2B2B]"
                        />
                        {codigoYape && !isYapeValido && (
                          <span className="text-[9px] text-red-500 mt-1 block font-medium">Debe tener exactamente 3 dígitos numéricos.</span>
                        )}
                        {codigoYape && isYapeValido && (
                          <span className="text-[9px] text-emerald-700 mt-1 block font-medium">✓ Código ingresado correctamente.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de Navegación del Wizard para Pasos 2, 3 y 4 */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#EADCB9]/40">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="px-6 py-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer border bg-transparent text-[#8C7A6B] border-[#EADCB9] hover:bg-[#FFFDF9]"
                  >
                    &larr; Anterior
                  </button>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        (step === 2 && !isStep2Valido) ||
                        (step === 3 && !isStep3Valido)
                      }
                      className={`
                        px-8 py-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm
                        ${((step === 2 && isStep2Valido) || (step === 3 && isStep3Valido))
                          ? "bg-[#80385e] text-white hover:bg-[#964a75]"
                          : "bg-[#F9F5EC] text-[#8C7A6B]/50 border border-[#EADCB9]/40 cursor-not-allowed"
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
                        px-8 py-3.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm
                        ${isStep4Valido && !loading
                          ? "bg-[#80385e] text-white hover:bg-[#964a75] active:scale-95"
                          : "bg-[#F9F5EC] text-[#8C7A6B]/50 border border-[#EADCB9]/40 cursor-not-allowed"
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
            )}
          </div>
        )}
      </div>
    </main>
  );
}
