import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

export const dashboardService = {
  kpis: () => {
    if (USE_MOCKS) return mock.mockDashboardKpis();
    return api.get('/dashboard/kpis');
  },
  salaEspera: () => {
    if (USE_MOCKS) return mock.mockSalaEspera();
    return api.get('/dashboard/sala-espera');
  },
  proximasAtenciones: (pacienteId) => {
    if (USE_MOCKS) return mock.mockProximasAtenciones(pacienteId);
    return api.get(`/dashboard/proximas/${pacienteId}`);
  },
};