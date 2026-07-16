import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../lib/auth';
import { 
  obtenerTodasLasIntenciones, 
  obtenerConfiguraciones, 
  obtenerTodosLosFeligreses, 
  obtenerTodasLasRestricciones 
} from '../../actions/misaActions';
import SuperDashboardClient from './SuperDashboardClient';

export const dynamic = 'force-dynamic';

export default async function SuperDashboardPage() {
  const payload = await getSessionPayload();

  if (!payload) {
    redirect('/admin/login');
  }

  if (payload.role !== 'superadmin') {
    if (payload.role === 'sacerdote') {
      redirect('/admin/agenda');
    } else {
      redirect('/admin/dashboard');
    }
  }

  const intenciones = await obtenerTodasLasIntenciones();
  const config = await obtenerConfiguraciones();
  const feligreses = await obtenerTodosLosFeligreses();
  const restricciones = await obtenerTodasLasRestricciones();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SuperDashboardClient 
        initialIntenciones={intenciones} 
        initialConfig={config} 
        initialFeligreses={feligreses}
        initialRestricciones={restricciones}
      />
    </div>
  );
}
