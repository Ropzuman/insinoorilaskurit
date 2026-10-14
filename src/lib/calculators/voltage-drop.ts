export interface CalculatorInput {
  supplyVoltage: number;
  current: number;
  cableLengthMeters: number;
  cableResistanceOhmPerKm: number;
  phase: 'single' | 'three';
}

export interface CalculatorResult {
  voltageDropVolts: number;
  voltageDropPercent: number;
  status: 'safe' | 'warning' | 'danger';
}

const WARNING_THRESHOLD_PERCENT = 3;
const DANGER_THRESHOLD_PERCENT = 5;

function assertPositive(value: number, fieldName: string): void {
  if (value <= 0 || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a positive finite number.`);
  }
}

export function calculateVoltageDrop(input: CalculatorInput): CalculatorResult {
  assertPositive(input.supplyVoltage, 'Supply voltage');
  assertPositive(input.current, 'Current');
  assertPositive(input.cableLengthMeters, 'Cable length');
  assertPositive(input.cableResistanceOhmPerKm, 'Cable resistance');

  const lengthKm = input.cableLengthMeters / 1000;
  const multiplier = input.phase === 'three' ? Math.sqrt(3) : 2;
  const voltageDropVolts = input.current * input.cableResistanceOhmPerKm * lengthKm * multiplier;
  const voltageDropPercent = (voltageDropVolts / input.supplyVoltage) * 100;

  const status: CalculatorResult['status'] =
    voltageDropPercent > DANGER_THRESHOLD_PERCENT
      ? 'danger'
      : voltageDropPercent >= WARNING_THRESHOLD_PERCENT
        ? 'warning'
        : 'safe';

  return {
    voltageDropVolts,
    voltageDropPercent,
    status,
  };
}
