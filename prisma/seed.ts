import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando la carga inicial de datos litúrgicos (Seed)...");

  // 1. Cargar Catálogo de Servicios Litúrgicos con Banderas de Formulario y Precios
  const servicios = [
    {
      id: "DIFUNTO",
      nombre: "Misa de Difunto (Q.E.P.D.)",
      categoria: "INTENCION",
      montoSugerido: 10.00,
      descripcion: "Misa ofrecida por el eterno descanso de un ser querido fallecido.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Difunto",
      requiereFallecido: true,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: null,
    },
    {
      id: "HONRAS",
      nombre: "Misa de Honras",
      categoria: "INTENCION",
      montoSugerido: 15.00,
      descripcion: "Misa memorial en conmemoración del mes o cabo de año de fallecimiento.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Difunto",
      requiereFallecido: true,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: null,
    },
    {
      id: "SALUD",
      nombre: "Misa por la Salud",
      categoria: "INTENCION",
      montoSugerido: 10.00,
      descripcion: "Oración de intención por la recuperación y salud de una persona enferma.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Enfermo",
      requiereFallecido: false,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: null,
    },
    {
      id: "CUMPLEANOS",
      nombre: "Misa de Cumpleaños",
      categoria: "INTENCION",
      montoSugerido: 10.00,
      descripcion: "Misa de acción de gracias por la bendición de un año más de vida.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Cumpleañero",
      requiereFallecido: false,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: null,
    },
    {
      id: "ACCION_GRACIAS",
      nombre: "Acción de Gracias",
      categoria: "INTENCION",
      montoSugerido: 10.00,
      descripcion: "Misa general para dar gracias a Dios por favores, familia, trabajo o salud.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre de la Familia o Motivo",
      requiereFallecido: false,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: null,
    },
    {
      id: "BAUTIZO",
      nombre: "Bautizo",
      categoria: "SACRAMENTO",
      montoSugerido: 50.00,
      descripcion: "Sacramento de iniciación cristiana para infantes.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Niño/a a Bautizar",
      requiereFallecido: false,
      requiereConyuge: false,
      requierePadresPadrinos: true,
      documentosRequeridos: "DNI_NINO,ACTA_NACIMIENTO",
    },
    {
      id: "MATRIMONIO",
      nombre: "Matrimonio",
      categoria: "SACRAMENTO",
      montoSugerido: 80.00,
      descripcion: "Sacramento de la unión matrimonial eclesiástica.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Primer Contrayente (Novio/a)",
      requiereFallecido: false,
      requiereConyuge: true,
      requierePadresPadrinos: false,
      documentosRequeridos: "DNI_CONTRAYENTE_1,DNI_CONTRAYENTE_2,ACTA_BAUTISMO",
    },
    {
      id: "COMUNION",
      nombre: "Primera Comunión",
      categoria: "SACRAMENTO",
      montoSugerido: 40.00,
      descripcion: "Sacramento de comunión eucarística inicial.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Comulgante",
      requiereFallecido: false,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: "DNI_COMULGANTE,ACTA_BAUTISMO",
    },
    {
      id: "CONFIRMACION",
      nombre: "Confirmación",
      categoria: "SACRAMENTO",
      montoSugerido: 45.00,
      descripcion: "Sacramento que sella y ratifica la fe en el Espíritu Santo.",
      activo: true,
      requiereFestejado: true,
      labelFestejado: "Nombre del Confirmando",
      requiereFallecido: false,
      requiereConyuge: false,
      requierePadresPadrinos: false,
      documentosRequeridos: "DNI_CONFIRMANDO,ACTA_BAUTISMO",
    },
  ];

  for (const s of servicios) {
    await prisma.servicioLiturgico.upsert({
      where: { id: s.id },
      update: {
        nombre: s.nombre,
        categoria: s.categoria,
        montoSugerido: s.montoSugerido,
        descripcion: s.descripcion,
        activo: s.activo,
        requiereFestejado: s.requiereFestejado,
        labelFestejado: s.labelFestejado,
        requiereFallecido: s.requiereFallecido,
        requiereConyuge: s.requiereConyuge,
        requierePadresPadrinos: s.requierePadresPadrinos,
        documentosRequeridos: s.documentosRequeridos,
      },
      create: {
        id: s.id,
        nombre: s.nombre,
        categoria: s.categoria,
        montoSugerido: s.montoSugerido,
        descripcion: s.descripcion,
        activo: s.activo,
        requiereFestejado: s.requiereFestejado,
        labelFestejado: s.labelFestejado,
        requiereFallecido: s.requiereFallecido,
        requiereConyuge: s.requiereConyuge,
        requierePadresPadrinos: s.requierePadresPadrinos,
        documentosRequeridos: s.documentosRequeridos,
      },
    });
  }
  console.log("✓ Carga de Servicios Litúrgicos completada con éxito.");

  // 2. Cargar Horarios Recurrentes por Defecto (e.g. Domingos a las 7:00 AM, 6:00 PM y 7:00 PM)
  // diaSemana: 0 = Domingo, 1 = Lunes, etc.
  const horarios = [
    { hora: "07:00 AM", diaSemana: 0 },
    { hora: "06:00 PM", diaSemana: 0 },
    { hora: "07:00 PM", diaSemana: 0 },
  ];

  for (const h of horarios) {
    const existe = await prisma.horarioDisponible.findFirst({
      where: {
        hora: h.hora,
        diaSemana: h.diaSemana,
        fechaEspecifica: null,
      },
    });

    if (!existe) {
      await prisma.horarioDisponible.create({
        data: {
          hora: h.hora,
          diaSemana: h.diaSemana,
          activo: true,
        },
      });
    }
  }
  console.log("✓ Carga de Horarios Litúrgicos iniciales completada con éxito.");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar el script Seed de base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
