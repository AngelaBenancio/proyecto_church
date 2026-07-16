import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../lib/auth';
import { obtenerTodasLasIntenciones, obtenerTodosLosFeligreses, obtenerTodasLasRestricciones, obtenerConfiguraciones } from '../../actions/misaActions';
import AgendaClient from './AgendaClient';

export const dynamic = 'force-dynamic';

export default async function PriestAgendaPage() {
  const payload = await getSessionPayload();

  if (!payload) {
    redirect('/admin/login');
  }

  // Obtener todas las intenciones
  const intenciones = await obtenerTodasLasIntenciones();
  
  // Filtrar en el servidor para quedarnos solo con las aprobadas (listas y pagadas)
  const intencionesAprobadas = intenciones.filter(
    (int) => int.estado === 'APROBADO'
  );

  // Obtener todos los feligreses
  const feligreses = await obtenerTodosLosFeligreses();

  // Obtener restricciones de horarios
  const restricciones = await obtenerTodasLasRestricciones();

  // Obtener configuraciones del sistema
  const config = await obtenerConfiguraciones();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AgendaClient
        initialIntenciones={intencionesAprobadas}
        initialFeligreses={feligreses}
        initialRestricciones={restricciones}
        initialConfig={config}
        role={payload.role === 'superadmin' ? 'admin' : payload.role}
      />
    </div>
  );
}
