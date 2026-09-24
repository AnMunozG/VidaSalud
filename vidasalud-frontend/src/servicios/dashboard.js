import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';
import { atencionesService } from './atenciones.js';

export const dashboardService = {
  kpis: () => {
    if (USE_MOCKS) return mock.mockDashboardKpis();
    return api.get('/dashboard/kpis');
  },
  // La sala de espera depende de las atenciones: si estas van al microservicio
  // real, la sala también debe calcularse desde ahí.
  salaEspera: () => atencionesService.salaEspera(),
  proximasAtenciones: (pacienteId) => {
    if (USE_MOCKS) return mock.mockProximasAtenciones(pacienteId);
    return api.get(`/dashboard/proximas/${pacienteId}`);
  },
};