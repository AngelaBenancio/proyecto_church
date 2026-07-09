"use server";

import { prisma } from "../lib/prisma";

export interface MisaActionResponse {
  success: boolean;
  trackingId?: string;
  error?: string;
}

export async function crearIntencionMisa(formData: {
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  tipoIntencion: string;
  nombreIntencion: string;
  fechaMisaStr: string;
  horaMisa: string;
  montoOfrenda: number;
  codigoYape: string;
}): Promise<MisaActionResponse> {
  try {
    const {
      nombreSolicitante,
      emailSolicitante,
      telefonoSolicitante,
      tipoIntencion,
      nombreIntencion,
      fechaMisaStr,
      horaMisa,
      montoOfrenda,
      codigoYape,
    } = formData;

    // 1. Validaciones estrictas de Backend
    if (!nombreSolicitante || nombreSolicitante.trim().length < 3) {
      return { success: false, error: "El nombre del solicitante debe tener al menos 3 caracteres." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailSolicitante || !emailRegex.test(emailSolicitante)) {
      return { success: false, error: "El correo electrónico no es válido." };
    }

    // Teléfono de Perú: exactamente 9 números, empezando con 9
    const telefonoRegex = /^9\d{8}$/;
    if (!telefonoSolicitante || !telefonoRegex.test(telefonoSolicitante)) {
      return { success: false, error: "El teléfono debe ser un número celular válido de Perú (9 dígitos, empezando con 9)." };
    }

    if (!tipoIntencion) {
      return { success: false, error: "Debe seleccionar un tipo de intención." };
    }

    if (!nombreIntencion || nombreIntencion.trim().length < 3) {
      return { success: false, error: "El nombre de la intención debe tener al menos 3 caracteres." };
    }

    const fechaMisa = new Date(fechaMisaStr);
    if (isNaN(fechaMisa.getTime())) {
      return { success: false, error: "La fecha seleccionada no es válida." };
    }

    // Asegurarse de que la fecha sea futura o actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparacion = new Date(fechaMisa);
    fechaComparacion.setHours(0, 0, 0, 0);
    if (fechaComparacion < hoy) {
      return { success: false, error: "La fecha de la misa no puede estar en el pasado." };
    }

    if (!horaMisa) {
      return { success: false, error: "Debe seleccionar un horario para la misa." };
    }

    if (montoOfrenda < 0) {
      return { success: false, error: "El monto de ofrenda no puede ser negativo." };
    }

    // Código Yape: exactamente 3 dígitos numéricos
    const yapeRegex = /^\d{3}$/;
    if (!codigoYape || !yapeRegex.test(codigoYape)) {
      return { success: false, error: "El código de Yape debe tener exactamente 3 dígitos numéricos." };
    }

    // 2. Creación del registro en PostgreSQL
    const nuevaIntencion = await prisma.intencionMisa.create({
      data: {
        nombreSolicitante: nombreSolicitante.trim(),
        emailSolicitante: emailSolicitante.trim().toLowerCase(),
        telefonoSolicitante: telefonoSolicitante.trim(),
        tipoIntencion,
        nombreIntencion: nombreIntencion.trim(),
        fechaMisa,
        horaMisa,
        montoOfrenda,
        codigoYape: codigoYape.trim(),
        estado: "PENDIENTE",
      },
    });

    return {
      success: true,
      trackingId: nuevaIntencion.id,
    };
  } catch (error: any) {
    console.error("Error al registrar la intención de misa:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar su solicitud en el servidor. Por favor, intente de nuevo.",
    };
  }
}

// Función auxiliar para obtener fechas ocupadas o cantidad de intenciones por fecha
export async function obtenerIntencionesPorMes(anio: number, mes: number): Promise<Record<string, string[]>> {
  try {
    const fechaInicio = new Date(anio, mes, 1);
    const fechaFin = new Date(anio, mes + 1, 0, 23, 59, 59, 999);

    const intenciones = await prisma.intencionMisa.findMany({
      where: {
        fechaMisa: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      select: {
        fechaMisa: true,
        horaMisa: true,
      },
    });

    // Agrupar por fecha formateada (YYYY-MM-DD) y listar las horas ocupadas
    const ocupacionPorFecha: Record<string, string[]> = {};
    intenciones.forEach((int) => {
      const fechaLocal = int.fechaMisa.toISOString().split("T")[0];
      if (!ocupacionPorFecha[fechaLocal]) {
        ocupacionPorFecha[fechaLocal] = [];
      }
      if (!ocupacionPorFecha[fechaLocal].includes(int.horaMisa)) {
        ocupacionPorFecha[fechaLocal].push(int.horaMisa);
      }
    });

    return ocupacionPorFecha;
  } catch (error) {
    console.error("Error al obtener intenciones por mes:", error);
    return {};
  }
}
