import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

export const reportesService = {
  porHora: (filtros = {}) => {
    if (USE_MOCKS) return mock.mockReportsPorHora(filtros);
    return api.get('/reports/atenciones-por-hora', { params: filtros });
  },
  tiemposEspera: (filtros = {}) => {
    if (USE_MOCKS) return mock.mockReportesTiempos(filtros);
    return api.get('/reports/tiempos-espera', { params: filtros });
  },
  prestacionesDemandadas: (filtros = {}) => {
    if (USE_MOCKS) return mock.mockPrestacionesDemandadas(filtros);
    return api.get('/reports/prestaciones-demandadas', { params: filtros });
  },
};