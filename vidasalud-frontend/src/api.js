import { atencionesService } from './servicios/atenciones.js';
import { catalogoService } from './servicios/catalogo.js';
import { dashboardService } from './servicios/dashboard.js';
import { reportesService } from './servicios/reportes.js';
import { auditoriaService } from './servicios/auditoria.js';
import * as autenticacionService from './servicios/autenticacion.js';

export {
  atencionesService,
  catalogoService,
  dashboardService,
  reportesService,
  auditoriaService,
  autenticacionService,
};

export {
  ROLES,
  ROL_LABELS,
  ESTADOS_ATENCION,
  ESTADO_COLORS,
  TRANSICIONES_ESTADO,
  TIPOS_EVENTO_AUDIT,
  CHART_COLORS,
  getEstadosDisponibles,
  formatearFecha,
  formatearFechaHora,
} from './constants.js';