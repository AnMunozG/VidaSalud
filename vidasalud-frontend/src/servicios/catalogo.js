import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

export const catalogoService = {
  getCentros: () => {
    if (USE_MOCKS) return Promise.resolve([...mock.centros]);
    return api.get('/centros');
  },
  getPrestaciones: () => {
    if (USE_MOCKS) return mock.mockListPrestaciones();
    return api.get('/prestaciones');
  },
  createPrestacion: (data, actor) => {
    if (USE_MOCKS) return mock.mockCreatePrestacion(data, actor);
    return api.post('/prestaciones', data);
  },
  updatePrestacion: (id, data) => {
    if (USE_MOCKS) return mock.mockUpdatePrestacion(id, data);
    return api.patch(`/prestaciones/${id}`, data);
  },
  getBoxes: () => {
    if (USE_MOCKS) return mock.mockListBoxes();
    return api.get('/boxes');
  },
  createBox: (data, actor) => {
    if (USE_MOCKS) return mock.mockCreateBox(data, actor);
    return api.post('/boxes', data);
  },
  updateBox: (id, data) => {
    if (USE_MOCKS) return mock.mockUpdateBox(id, data);
    return api.patch(`/boxes/${id}`, data);
  },
  getCupos: (params) => {
    if (USE_MOCKS) return mock.mockListCupos(params);
    return api.get('/cupos', { params });
  },
  generarCupos: (data, actor) => {
    if (USE_MOCKS) return mock.mockGenerarCupos(data, actor);
    return api.post('/cupos/generar', data);
  },
};