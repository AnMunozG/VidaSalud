import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

export const atencionesService = {
  getAll: (filtros = {}) => {
    if (USE_MOCKS) return mock.mockListAppointments(filtros);
    return api.get('/appointments', { params: filtros });
  },
  create: (data, actor) => {
    if (USE_MOCKS) return mock.mockCreateAppointment(data, actor);
    return api.post('/appointments', data);
  },
  changeEstado: (id, estado, actor) => {
    if (USE_MOCKS) return mock.mockChangeEstado(id, estado, actor);
    return api.patch(`/appointments/${id}/estado`, { estado });
  },
  getSlots: (params) => {
    if (USE_MOCKS) {
      return mock.mockListCupos({
        fecha: params.fecha,
        centroId: params.centroId,
        prestacionId: params.prestacionId,
      });
    }
    return api.get('/appointments/slots', { params });
  },
};