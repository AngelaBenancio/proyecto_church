import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../lib/auth';
import { obtenerTodasLasIntenciones, obtenerConfiguraciones } from '../../actions/misaActions';
import DashboardClient from './DashboardClient';

// Esta ruta debe ser dinámica porque lee cookies y consulta la base de datos en tiempo de solicitud
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const payload = await getSessionPayload();

  if (!payload) {
    redirect('/admin/login');
  }

  if (payload.role === 'superadmin') {
    redirect('/admin/super');
  }

  if (payload.role === 'sacerdote') {
    redirect('/admin/agenda');
  }

  const intenciones = await obtenerTodasLasIntenciones();
  const config = await obtenerConfiguraciones();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardClient initialIntenciones={intenciones} initialConfig={config} />
    </div>
  );
}
