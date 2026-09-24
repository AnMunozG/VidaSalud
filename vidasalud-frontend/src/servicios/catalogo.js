import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

// `true`: la pestaña Prestaciones consume el microservicio real de catálogo
// (/api/catalogo/prestaciones). Centros, boxes y cupos siguen usando los mocks
// según VITE_USE_MOCKS.
const USA_API_PRESTACIONES = import.meta.env.VITE_USE_API_PRESTACIONES === 'true';

// Duración por defecto solo para prestaciones antiguas o sin dato persisido.
const DURACION_DEFAULT = 20;

// Traduce Prestacion del backend a la forma de la UI. Los valores nuevos
// (categoria, duracionMin, requiereBox, activa) se persisten; se mantienen
// respaldos por si llegan filas sin esos datos.
const aPrestacionUI = (p) => ({
  id: p.id,
  nombre: p.nombre,
  categoria: p.categoria || 'medicina',
  duracionMin: p.duracionMin ?? DURACION_DEFAULT,
  requiereBox: p.requiereBox !== false,
  activa: p.activa !== false,
  precio: p.precio,
  codigoBox: p.codigoBox,
  cuposDisponibles: p.cuposDisponibles,
});

export const catalogoService = {
  getCentros: () => {
    if (USE_MOCKS) return Promise.resolve([...mock.centros]);
    return api.get('/centros');
  },
  getPrestaciones: () => {
    if (USA_API_PRESTACIONES) {
      return api.get('/catalogo/prestaciones').then((lista) => lista.map(aPrestacionUI));
    }
    if (USE_MOCKS) return mock.mockListPrestaciones();
    return api.get('/prestaciones');
  },
  createPrestacion: (data, actor) => {
    if (USA_API_PRESTACIONES) {
      return api
        .post('/catalogo/prestaciones', {
          nombre: data.nombre,
          categoria: data.categoria || 'medicina',
          duracionMin: Number(data.duracionMin) || DURACION_DEFAULT,
          requiereBox: data.requiereBox !== false,
          activa: data.activa !== false,
          codigoBox: '',
          cuposDisponibles: 0,
          precio: 0,
        })
        .then(aPrestacionUI);
    }
    if (USE_MOCKS) return mock.mockCreatePrestacion(data, actor);
    return api.post('/prestaciones', data);
  },
  updatePrestacion: (id, data) => {
    if (USA_API_PRESTACIONES) {
      // Se re-lee la prestación para no perder campos que la UI no edita y se
      // aplica el cambio que sí llega (p. ej. activa al activar/desactivar).
      return api.get(`/catalogo/prestaciones/${id}`).then((existente) =>
        api
          .put(`/catalogo/prestaciones/${id}`, {
            nombre: existente.nombre,
            codigoBox: existente.codigoBox,
            cuposDisponibles: existente.cuposDisponibles,
            precio: existente.precio,
            categoria: existente.categoria,
            duracionMin: existente.duracionMin,
            requiereBox: existente.requiereBox,
            activa: data.activa,
          })
          .then(aPrestacionUI)
      );
    }
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