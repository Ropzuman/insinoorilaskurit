export type ThreePhaseCalculationMode =
	| "fromCurrent"
	| "fromActivePower"
	| "fromApparentPower";

export type ActivePowerType = "electrical" | "shaft";

export interface ThreePhasePowerInput {
	voltage: number; // Line voltage U_L (V), e.g., 400
	current?: number; // Current I (A)
	activePowerKW?: number; // Electrical active or motor shaft power (kW)
	activePowerType?: ActivePowerType; // Meaning of activePowerKW, defaults to motor shaft power
	apparentPowerKVA?: number; // Apparent power S (kVA)
	powerFactor?: number; // cos(phi), range (0, 1]
	efficiency?: number; // eta (%), range (1, 100], default 100%
	calculationMode: ThreePhaseCalculationMode;
}

export interface ThreePhasePowerResult {
	voltageLine: number; // Line voltage U_L (V)
	voltagePhase: number; // Phase voltage U_P = U_L / sqrt(3) (V)
	current: number; // Current I (A)
	electricalActivePowerW: number; // Electrical input active power P_e (W)
	electricalActivePowerKW: number; // Electrical input active power P_e (kW)
	shaftOutputPowerW: number; // Motor shaft output power P_shaft (W)
	shaftOutputPowerKW: number; // Motor shaft output power P_shaft (kW)
	apparentPowerVA: number; // Apparent power S (VA)
	apparentPowerKVA: number; // Apparent power S (kVA)
	reactivePowerVar: number; // Reactive power Q (var)
	reactivePowerKVar: number; // Reactive power Q (kvar)
	powerFactor: number; // cos(phi)
	phiDegrees: number; // phi angle in degrees
	efficiency: number; // eta (%)
	isValid: boolean;
	errorMessage?: string;
}

/**
 * Calculates 3-phase AC power components (P_e, P_shaft, S, Q, I, cos phi).
 * Formula: P_e = sqrt(3) * U_L * I * cos(phi)
 * Formula: P_shaft = P_e * eta
 * Formula: S = sqrt(3) * U_L * I
 * Formula: Q = sqrt(S^2 - P_e^2)
 */
export function calculateThreePhasePower(
	input: ThreePhasePowerInput,
): ThreePhasePowerResult {
	const {
		voltage,
		current = 0,
		activePowerKW = 0,
		activePowerType = "shaft",
		apparentPowerKVA = 0,
		powerFactor = 0.85,
		efficiency = 100,
		calculationMode,
	} = input;

	// Validation
	if (voltage <= 0) {
		return createErrorResult("Jännitteen (U) täytyy olla suurempi kuin 0 V.");
	}

	if (powerFactor <= 0 || powerFactor > 1) {
		return createErrorResult("Tehokertoimen (cos φ) täytyy olla välillä 0.01 - 1.0.");
	}

	if (efficiency <= 0 || efficiency > 100) {
		return createErrorResult("Hyötysuhteen (η) täytyy olla välillä 1% - 100%.");
	}

	const eta = efficiency / 100;
	const sqrt3 = Math.sqrt(3);
	let calcI = 0;
	let calcS_VA = 0;
	let electricalActivePowerW = 0;
	let shaftOutputPowerW = 0;

	if (calculationMode === "fromCurrent") {
		if (current <= 0) {
			return createErrorResult("Syötä voimassa oleva virta (A).");
		}
		calcI = current;
		calcS_VA = sqrt3 * voltage * calcI;
		electricalActivePowerW = calcS_VA * powerFactor;
		shaftOutputPowerW = electricalActivePowerW * eta;
	} else if (calculationMode === "fromActivePower") {
		if (activePowerKW <= 0) {
			return createErrorResult("Syötä voimassa oleva pätöteho (kW).");
		}
		if (activePowerType === "electrical") {
			electricalActivePowerW = activePowerKW * 1000;
			shaftOutputPowerW = electricalActivePowerW * eta;
		} else {
			shaftOutputPowerW = activePowerKW * 1000;
			electricalActivePowerW = shaftOutputPowerW / eta;
		}
		calcS_VA = electricalActivePowerW / powerFactor;
		calcI = calcS_VA / (sqrt3 * voltage);
	} else if (calculationMode === "fromApparentPower") {
		if (apparentPowerKVA <= 0) {
			return createErrorResult("Syötä voimassa oleva näennäisteho (kVA).");
		}
		calcS_VA = apparentPowerKVA * 1000;
		calcI = calcS_VA / (sqrt3 * voltage);
		electricalActivePowerW = calcS_VA * powerFactor;
		shaftOutputPowerW = electricalActivePowerW * eta;
	}

	const calcQ_var = Math.sqrt(
		Math.max(0, calcS_VA * calcS_VA - electricalActivePowerW * electricalActivePowerW),
	);
	const phiRad = Math.acos(Math.min(1, Math.max(-1, powerFactor)));
	const phiDegrees = (phiRad * 180) / Math.PI;
	const phaseVoltage = voltage / sqrt3;

	if (
		!isFinite(calcI) ||
		!isFinite(electricalActivePowerW) ||
		!isFinite(shaftOutputPowerW) ||
		!isFinite(calcS_VA) ||
		!isFinite(calcQ_var)
	) {
		return createErrorResult("Laskennassa tapahtui virhe syötetyillä arvoilla.");
	}

	return {
		voltageLine: Number(voltage.toFixed(2)),
		voltagePhase: Number(phaseVoltage.toFixed(2)),
		current: Number(calcI.toFixed(2)),
		electricalActivePowerW: Number(electricalActivePowerW.toFixed(2)),
		electricalActivePowerKW: Number((electricalActivePowerW / 1000).toFixed(3)),
		shaftOutputPowerW: Number(shaftOutputPowerW.toFixed(2)),
		shaftOutputPowerKW: Number((shaftOutputPowerW / 1000).toFixed(3)),
		apparentPowerVA: Number(calcS_VA.toFixed(2)),
		apparentPowerKVA: Number((calcS_VA / 1000).toFixed(3)),
		reactivePowerVar: Number(calcQ_var.toFixed(2)),
		reactivePowerKVar: Number((calcQ_var / 1000).toFixed(3)),
		powerFactor: Number(powerFactor.toFixed(3)),
		phiDegrees: Number(phiDegrees.toFixed(1)),
		efficiency: Number(efficiency.toFixed(1)),
		isValid: true,
	};
}

function createErrorResult(message: string): ThreePhasePowerResult {
	return {
		voltageLine: 0,
		voltagePhase: 0,
		current: 0,
		electricalActivePowerW: 0,
		electricalActivePowerKW: 0,
		shaftOutputPowerW: 0,
		shaftOutputPowerKW: 0,
		apparentPowerVA: 0,
		apparentPowerKVA: 0,
		reactivePowerVar: 0,
		reactivePowerKVar: 0,
		powerFactor: 0,
		phiDegrees: 0,
		efficiency: 0,
		isValid: false,
		errorMessage: message,
	};
}
