import { describe, it, expect } from 'vitest'
import { getEstadosDisponibles, ESTADOS_ATENCION, ESTADO_COLORS } from '../constants'

describe('Flujo de estados de atención', () => {
  it('expone los 6 estados del ciclo de vida', () => {
    expect(ESTADOS_ATENCION).toHaveLength(6)
    expect(ESTADOS_ATENCION).toContain('Solicitada')
    expect(ESTADOS_ATENCION).toContain('Cerrada')
  })

  it('todo estado tiene un color definido', () => {
    ESTADOS_ATENCION.forEach((e) => {
      expect(ESTADO_COLORS[e]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('un recepcionista puede confirmar una solicitud', () => {
    const disponibles = getEstadosDisponibles('Solicitada', 'recepcionista')
    expect(disponibles).toContain('Confirmada')
    expect(disponibles).toContain('Cancelada')
  })

  it('un paciente solo puede cancelar su atención', () => {
    const disponibles = getEstadosDisponibles('Confirmada', 'paciente')
    expect(disponibles).toEqual(['Cancelada'])
  })

  it('no permite saltos inválidos (Confirmada → Cerrada directly)', () => {
    const disponibles = getEstadosDisponibles('Confirmada', 'admin')
    expect(disponibles).not.toContain('Cerrada')
  })

  it('una cerrada y una cancelada son estados terminales', () => {
    expect(getEstadosDisponibles('Cerrada', 'admin')).toEqual([])
    expect(getEstadosDisponibles('Cancelada', 'admin')).toEqual([])
  })
})