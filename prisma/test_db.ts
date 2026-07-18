import "dotenv/config";
import { prisma } from "../app/lib/prisma";

async function main() {
  console.log("=== DIAGNÓSTICO DE BASE DE DATOS ===");
  try {
    const settings = await prisma.systemSetting.findMany();
    console.log("SystemSettings:");
    settings.forEach(s => {
      console.log(`- ${s.key}: ${s.value}`);
    });

    const servicios = await prisma.servicioLiturgico.findMany();
    console.log("\nServicios Litúrgicos:");
    servicios.forEach(s => {
      console.log(`- ID: ${s.id} | Nombre: ${s.nombre} | Activo: ${s.activo} | Monto: ${s.montoSugerido}`);
    });
  } catch (err) {
    console.error("Error al consultar la base de datos:", err);
  }
}

main();
