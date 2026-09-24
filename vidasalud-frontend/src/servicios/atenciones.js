import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';

// `true`: la página Atenciones consume el microservicio real
// (/api/atenciones). Los cupos (slots) siguen usando los mocks según
// VITE_USE_MOCKS.
const USA_API_ATENCIONES = import.meta.env.VITE_USE_API_ATENCIONES === 'true';

// Estados en MAYÚSCULA que persiste el backend <=> etiquetas de la UI.
const ESTADO_A_ENUM = {
  Solicitada: 'SOLICITADA',
  Confirmada: 'CONFIRMADA',
  'En espera': 'EN_ESPERA',
  'En atención': 'EN_ATENCION',
  Cerrada: 'CERRADA',
  Cancelada: 'CANCELADA',
};
const ENUM_A_ESTADO = Object.fromEntries(Object.entries(ESTADO_A_ENUM).map(([k, v]) => [v, k]));

const nombreUsuario = (id) => {
  const u = mock.usuariosDemo.find((x) => String(x.id) === String(id));
  if (!u) return null;
  const centro = mock.centros.find((c) => c.id === u.centroId);
  return { nombre: u.nombre, centroNombre: centro?.nombre || '—' };
};

// Traduce Atencion del backend (pacienteId, prestacionId, fechaHora, estado,
// codigoBox, pacienteNombre, pacienteEmail, observaciones, centroId) a la
// forma que espera la UI. El nombre de la prestación viene del catálogo real;
// el del paciente, del backend o de los usuarios demo (si coincide).
const aAtencionUI = (a, prestaciones) => {
  const p = prestaciones.get(Number(a.prestacionId));
  const usuario = nombreUsuario(a.pacienteId);
  return {
    id: a.id,
    codigo: `VSA-${String(a.id).padStart(4, '0')}`,
    pacienteId: a.pacienteId,
    pacienteNombre: a.pacienteNombre || usuario?.nombre || `Paciente ${a.pacienteId}`,
    pacienteEmail: a.pacienteEmail || '',
    prestacionId: a.prestacionId,
    prestacion: p?.nombre || `Prestación ${a.prestacionId}`,
    categoria: p?.categoria || 'medicina',
    duracionMin: p?.duracionMin ?? 20,
    centroId: a.centroId ?? null,
    centroNombre: usuario?.centroNombre || '—',
    boxId: null,
    boxNombre: a.codigoBox || 'Sala de procedimientos',
    fecha: String(a.fechaHora).slice(0, 10),
    hora: String(a.fechaHora).slice(11, 16),
    estado: ENUM_A_ESTADO[a.estado] || a.estado,
    solicitadoPor: 'recepcionista',
    prestadorNombre: '—',
    observaciones: a.observaciones || '',
    codigoBox: a.codigoBox,
  };
};

export const atencionesService = {
  getAll: async (filtros = {}) => {
    if (USA_API_ATENCIONES) {
      const params = {};
      if (filtros.estado && filtros.estado !== 'Todas') params.estado = ESTADO_A_ENUM[filtros.estado];
      const [lista, prestaciones] = await Promise.all([
        api.get('/atenciones', { params }),
        api.get('/catalogo/prestaciones'),
      ]);
      const mapa = new Map(prestaciones.map((p) => [Number(p.id), p]));
      return lista
        .filter((a) => !filtros.fecha || String(a.fechaHora).startsWith(filtros.fecha))
        .filter((a) => !filtros.pacienteId || String(a.pacienteId) === String(filtros.pacienteId))
        .map((a) => aAtencionUI(a, mapa));
    }
    if (USE_MOCKS) return mock.mockListAppointments(filtros);
    return api.get('/appointments', { params: filtros });
  },
  create: (data, actor) => {
    if (USA_API_ATENCIONES) {
      const pacienteId = data.pacienteId || `pac-${String(data.pacienteEmail || 'anonimo').split('@')[0]}`;
      const estado = actor?.rol === 'paciente' ? 'SOLICITADA' : 'CONFIRMADA';
      return api.post('/atenciones', {
        pacienteId,
        prestacionId: Number(data.prestacionId),
        fechaHora: `${data.fecha}T${data.hora || '09:00'}`,
        estado,
        codigoBox: '',
        pacienteNombre: data.pacienteNombre || '',
        pacienteEmail: data.pacienteEmail || '',
        observaciones: data.observaciones || '',
        centroId: data.centroId ?? null,
      });
    }
    if (USE_MOCKS) return mock.mockCreateAppointment(data, actor);
    return api.post('/appointments', data);
  },
  changeEstado: (id, estado, actor) => {
    if (USA_API_ATENCIONES) {
      return api.put(`/atenciones/${id}/estado`, { estado: ESTADO_A_ENUM[estado] || estado });
    }
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