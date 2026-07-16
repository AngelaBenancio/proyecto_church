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

    // Cargar restricciones para este mes
    const restricciones = await prisma.horarioRestringido.findMany({
      where: {
        fechaStr: {
          startsWith: `${anio}-${String(mes + 1).padStart(2, '0')}`
        }
      }
    });

    // Listado de todos los horarios disponibles por defecto en el sistema
    const config = await obtenerConfiguraciones();
    const todosHorarios = config.horariosMisa;

    restricciones.forEach((res) => {
      if (!ocupacionPorFecha[res.fechaStr]) {
        ocupacionPorFecha[res.fechaStr] = [];
      }

      if (res.hora === null) {
        // Bloquear todo el día: agregar todas las horas posibles
        todosHorarios.forEach(h => {
          if (!ocupacionPorFecha[res.fechaStr].includes(h)) {
            ocupacionPorFecha[res.fechaStr].push(h);
          }
        });
      } else {
        // Bloquear una hora específica
        if (!ocupacionPorFecha[res.fechaStr].includes(res.hora)) {
          ocupacionPorFecha[res.fechaStr].push(res.hora);
        }
      }
    });

    return ocupacionPorFecha;
  } catch (error) {
    console.error("Error al obtener intenciones por mes:", error);
    return {};
  }
}

// Obtener todas las intenciones de misa detalladas para la administración/sacerdote
export async function obtenerTodasLasIntenciones() {
  try {
    const intenciones = await prisma.intencionMisa.findMany({
      orderBy: [
        { fechaMisa: "asc" },
        { horaMisa: "asc" }
      ]
    });
    
    // Mapear Decimal a número para evitar problemas de serialización en Server Components
    return intenciones.map(int => ({
      ...int,
      montoOfrenda: Number(int.montoOfrenda),
      // Formatear fechas
      fechaMisaStr: int.fechaMisa.toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error("Error al obtener todas las intenciones detalladas:", error);
    return [];
  }
}

// Actualizar el estado de una intención (ej. de PENDIENTE a APROBADO o RECHAZADO)
export async function actualizarEstadoIntencion(id: string, nuevoEstado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') {
  try {
    const intencionActualizada = await prisma.intencionMisa.update({
      where: { id },
      data: { estado: nuevoEstado }
    });
    
    return {
      success: true,
      data: {
        ...intencionActualizada,
        montoOfrenda: Number(intencionActualizada.montoOfrenda)
      }
    };
  } catch (error: any) {
    console.error("Error al actualizar estado de la intención:", error);
    return { success: false, error: "No se pudo actualizar el estado de la intención." };
  }
}

// Obtener la lista de todos los feligreses
export async function obtenerTodosLosFeligreses() {
  try {
    const feligreses = await prisma.feligres.findMany({
      orderBy: { nombre: 'asc' }
    });
    
    return feligreses.map(f => ({
      ...f,
      createdAtStr: f.createdAt.toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error("Error al obtener feligreses:", error);
    return [];
  }
}

// Obtener todas las restricciones de horarios
export async function obtenerTodasLasRestricciones() {
  try {
    return await prisma.horarioRestringido.findMany({
      orderBy: [
        { fechaStr: 'asc' },
        { hora: 'asc' }
      ]
    });
  } catch (error) {
    console.error("Error al obtener restricciones:", error);
    return [];
  }
}

// Agregar una restricción de horario (bloqueo)
export async function agregarRestriccion(fechaStr: string, hora: string | null, motivo: string | null) {
  try {
    const restriccion = await prisma.horarioRestringido.create({
      data: {
        fechaStr,
        hora,
        motivo: motivo || 'Actividad Parroquial'
      }
    });
    return { success: true, data: restriccion };
  } catch (error: any) {
    console.error("Error al agregar restricción:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Ya existe un bloqueo registrado para esta fecha y hora." };
    }
    return { success: false, error: "No se pudo registrar el bloqueo." };
  }
}

// Eliminar una restricción de horario
export async function eliminarRestriccion(fechaStr: string, hora: string | null) {
  try {
    await prisma.horarioRestringido.delete({
      where: {
        fechaStr_hora: {
          fechaStr,
          hora: hora || "" // En schema.prisma, el campo @unique requiere valor o null. 
          // Wait! Si hora es null en base de datos, el where compuesto con unique es { fechaStr, hora: null }.
          // En Prisma, podemos pasar `hora: null` en Prisma query y lo resolverá correctamente.
          // Let's pass: hora: hora === null ? null : hora
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar restricción:", error);
    return { success: false, error: "No se pudo eliminar el bloqueo." };
  }
}

// Eliminar restricción por ID (más seguro)
export async function eliminarRestriccionPorId(id: string) {
  try {
    await prisma.horarioRestringido.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar restricción por ID:", error);
    return { success: false, error: "No se pudo eliminar el bloqueo." };
  }
}

// Obtener configuraciones del sistema (sacramentos y horarios de misa)
export async function obtenerConfiguraciones() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));

    const habilitarComunion = settingsMap.get("habilitar_comunion") === "true";
    const habilitarConfirmacion = settingsMap.get("habilitar_confirmacion") === "true";
    
    const horariosMisaStr = settingsMap.get("horarios_misa");
    const horariosMisa = horariosMisaStr
      ? horariosMisaStr.split(",").map(h => h.trim()).filter(Boolean)
      : ["07:00 AM", "06:00 PM", "07:00 PM"];

    return {
      habilitarComunion,
      habilitarConfirmacion,
      horariosMisa
    };
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    return {
      habilitarComunion: false,
      habilitarConfirmacion: false,
      horariosMisa: ["07:00 AM", "06:00 PM", "07:00 PM"]
    };
  }
}

// Actualizar o crear una configuración específica
export async function actualizarConfiguracion(key: string, value: string) {
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    return { success: true };
  } catch (error) {
    console.error(`Error al actualizar configuración ${key}:`, error);
    return { success: false, error: "No se pudo guardar la configuración." };
  }
}

// Añadir un nuevo horario de misa a la lista
export async function agregarHorarioMisa(nuevoHorario: string) {
  try {
    const config = await obtenerConfiguraciones();
    
    // Validar formato simple HH:MM AM/PM
    const regex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i;
    if (!regex.test(nuevoHorario.trim())) {
      return { success: false, error: "El formato del horario debe ser HH:MM AM/PM (ej. 08:00 AM)." };
    }

    const horarioFormateado = nuevoHorario.trim().toUpperCase();

    if (config.horariosMisa.includes(horarioFormateado)) {
      return { success: false, error: "Este horario ya existe." };
    }

    const nuevosHorarios = [...config.horariosMisa, horarioFormateado];
    
    // Ordenar horarios cronológicamente
    nuevosHorarios.sort((a, b) => {
      const toMinutes = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return toMinutes(a) - toMinutes(b);
    });

    const res = await actualizarConfiguracion("horarios_misa", nuevosHorarios.join(","));
    if (res.success) {
      return { success: true, horariosMisa: nuevosHorarios };
    }
    return { success: false, error: res.error };
  } catch (error) {
    console.error("Error al agregar horario de misa:", error);
    return { success: false, error: "No se pudo agregar el horario." };
  }
}

// Eliminar un horario de misa de la lista
export async function eliminarHorarioMisa(horarioEliminar: string) {
  try {
    const config = await obtenerConfiguraciones();
    const horarioFormateado = horarioEliminar.trim().toUpperCase();

    if (!config.horariosMisa.includes(horarioFormateado)) {
      return { success: false, error: "El horario a eliminar no existe." };
    }

    const nuevosHorarios = config.horariosMisa.filter(h => h !== horarioFormateado);
    const res = await actualizarConfiguracion("horarios_misa", nuevosHorarios.join(","));
    
    if (res.success) {
      return { success: true, horariosMisa: nuevosHorarios };
    }
    return { success: false, error: res.error };
  } catch (error) {
    console.error("Error al eliminar horario de misa:", error);
    return { success: false, error: "No se pudo eliminar el horario." };
  }
}

// Agregar un nuevo feligrés (Super Admin)
export async function agregarFeligres(nombre: string, email: string, telefono: string, direccion?: string) {
  try {
    const feligresExistente = await prisma.feligres.findUnique({
      where: { email }
    });
    if (feligresExistente) {
      return { success: false, error: "Ya existe un feligrés registrado con este correo electrónico." };
    }

    const nuevoFeligres = await prisma.feligres.create({
      data: {
        nombre,
        email,
        telefono,
        direccion: direccion || null
      }
    });

    return {
      success: true,
      data: {
        ...nuevoFeligres,
        createdAtStr: nuevoFeligres.createdAt.toISOString().split('T')[0]
      }
    };
  } catch (error) {
    console.error("Error al agregar feligrés:", error);
    return { success: false, error: "No se pudo registrar el feligrés." };
  }
}

// Eliminar un feligrés (Super Admin)
export async function eliminarFeligres(id: string) {
  try {
    await prisma.feligres.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar feligrés:", error);
    return { success: false, error: "No se pudo eliminar el feligrés." };
  }
}

// Actualizar datos de un feligrés (Super Admin)
export async function actualizarFeligres(id: string, nombre: string, email: string, telefono: string, direccion?: string) {
  try {
    const feligresEmailExistente = await prisma.feligres.findFirst({
      where: {
        email,
        NOT: { id }
      }
    });
    if (feligresEmailExistente) {
      return { success: false, error: "Ya existe otro feligrés registrado con este correo electrónico." };
    }

    const feligresActualizado = await prisma.feligres.update({
      where: { id },
      data: {
        nombre,
        email,
        telefono,
        direccion: direccion || null
      }
    });

    return {
      success: true,
      data: {
        ...feligresActualizado,
        createdAtStr: feligresActualizado.createdAt.toISOString().split('T')[0]
      }
    };
  } catch (error) {
    console.error("Error al actualizar feligrés:", error);
    return { success: false, error: "No se pudo actualizar la información del feligrés." };
  }
}



