import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

export const auditoriaService = {
  getAll: (filtros = {}) => {
    if (USE_MOCKS) return mock.mockListAudit(filtros);
    return api.get('/audit/eventos', { params: filtros });
  },
};