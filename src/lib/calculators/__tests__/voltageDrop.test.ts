import { describe, expect, it } from 'vitest';

import { calculateVoltageDrop, type CalculatorInput } from '../voltageDrop';

describe('calculateVoltageDrop', () => {
  it('calculates safe single-phase voltage drop', () => {
    const input: CalculatorInput = {
      supplyVoltage: 230,
      current: 10,
      cableLengthMeters: 15,
      cableResistanceOhmPerKm: 1.83,
      phase: 'single',
    };

    const result = calculateVoltageDrop(input);

    expect(result.voltageDropVolts).toBeCloseTo(0.549, 6);
    expect(result.voltageDropPercent).toBeCloseTo(0.2386956522, 6);
    expect(result.status).toBe('safe');
  });

  it('marks status as warning between 3% and 5%', () => {
    const result = calculateVoltageDrop({
      supplyVoltage: 230,
      current: 20,
      cableLengthMeters: 120,
      cableResistanceOhmPerKm: 1.83,
      phase: 'single',
    });

    expect(result.status).toBe('warning');
    expect(result.voltageDropPercent).toBeGreaterThanOrEqual(3);
    expect(result.voltageDropPercent).toBeLessThanOrEqual(5);
  });

  it('marks status as danger above 5%', () => {
    const result = calculateVoltageDrop({
      supplyVoltage: 230,
      current: 25,
      cableLengthMeters: 250,
      cableResistanceOhmPerKm: 1.83,
      phase: 'single',
    });

    expect(result.status).toBe('danger');
    expect(result.voltageDropPercent).toBeGreaterThan(5);
  });

  it('uses three-phase multiplier', () => {
    const result = calculateVoltageDrop({
      supplyVoltage: 400,
      current: 16,
      cableLengthMeters: 80,
      cableResistanceOhmPerKm: 1.83,
      phase: 'three',
    });

    expect(result.voltageDropVolts).toBeCloseTo(4.0571558116, 6);
    expect(result.voltageDropPercent).toBeCloseTo(1.0142889529, 6);
    expect(result.status).toBe('safe');
  });

  it.each([
    ['Supply voltage', { supplyVoltage: 0, current: 10, cableLengthMeters: 10, cableResistanceOhmPerKm: 1, phase: 'single' }],
    ['Current', { supplyVoltage: 230, current: Number.POSITIVE_INFINITY, cableLengthMeters: 10, cableResistanceOhmPerKm: 1, phase: 'single' }],
    ['Cable length', { supplyVoltage: 230, current: 10, cableLengthMeters: -1, cableResistanceOhmPerKm: 1, phase: 'single' }],
    ['Cable resistance', { supplyVoltage: 230, current: 10, cableLengthMeters: 10, cableResistanceOhmPerKm: Number.NaN, phase: 'single' }],
  ] as const)('throws for invalid %s', (_, input) => {
    expect(() => calculateVoltageDrop(input)).toThrowError();
  });
});
