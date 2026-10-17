export type ThreePhaseCalculationMode =
	| "fromCurrent"
	| "fromActivePower"
	| "fromApparentPower";

export interface ThreePhasePowerInput {
	voltage: number; // Line voltage U_L (V), e.g., 400
	current?: number; // Current I (A)
	activePowerKW?: number; // Active power P (kW)
	apparentPowerKVA?: number; // Apparent power S (kVA)
	powerFactor?: number; // cos(phi), range (0, 1]
	efficiency?: number; // eta (%), range (1, 100], default 100%
	calculationMode: ThreePhaseCalculationMode;
}

export interface ThreePhasePowerResult {
	voltageLine: number; // Line voltage U_L (V)
	voltagePhase: number; // Phase voltage U_P = U_L / sqrt(3) (V)
	current: number; // Current I (A)
	activePowerW: number; // Active power P (W)
	activePowerKW: number; // Active power P (kW)
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
 * Calculates 3-phase AC power components (P, S, Q, I, cos phi).
 * Formula: P = sqrt(3) * U_L * I * cos(phi) * eta
 * Formula: S = sqrt(3) * U_L * I
 * Formula: Q = sqrt(S^2 - P_elec^2)
 */
export function calculateThreePhasePower(
	input: ThreePhasePowerInput,
): ThreePhasePowerResult {
	const {
		voltage,
		current = 0,
		activePowerKW = 0,
		apparentPowerKVA = 0,
		powerFactor = 0.85,
		efficiency = 100,
		calculationMode,
	} = input;

	// Validation
	if (voltage <= 0) {
		return createErrorResult("Pääjännitteen (U_L) täytyy olla suurempi kuin 0 V.");
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
	let calcP_W = 0;

	if (calculationMode === "fromCurrent") {
		if (current <= 0) {
			return createErrorResult("Syötä voimassa oleva virta (A).");
		}
		calcI = current;
		calcS_VA = sqrt3 * voltage * calcI;
		calcP_W = calcS_VA * powerFactor * eta;
	} else if (calculationMode === "fromActivePower") {
		if (activePowerKW <= 0) {
			return createErrorResult("Syötä voimassa oleva pätöteho (kW).");
		}
		calcP_W = activePowerKW * 1000;
		const electricalPowerW = calcP_W / eta;
		calcS_VA = electricalPowerW / powerFactor;
		calcI = calcS_VA / (sqrt3 * voltage);
	} else if (calculationMode === "fromApparentPower") {
		if (apparentPowerKVA <= 0) {
			return createErrorResult("Syötä voimassa oleva näennäisteho (kVA).");
		}
		calcS_VA = apparentPowerKVA * 1000;
		calcI = calcS_VA / (sqrt3 * voltage);
		calcP_W = calcS_VA * powerFactor * eta;
	}

	const electricalPowerW = calcP_W / eta;
	const calcQ_var = Math.sqrt(
		Math.max(0, calcS_VA * calcS_VA - electricalPowerW * electricalPowerW),
	);
	const phiRad = Math.acos(Math.min(1, Math.max(-1, powerFactor)));
	const phiDegrees = (phiRad * 180) / Math.PI;
	const phaseVoltage = voltage / sqrt3;

	if (
		!isFinite(calcI) ||
		!isFinite(calcP_W) ||
		!isFinite(calcS_VA) ||
		!isFinite(calcQ_var)
	) {
		return createErrorResult("Laskennassa tapahtui virhe syötetyillä arvoilla.");
	}

	return {
		voltageLine: Number(voltage.toFixed(2)),
		voltagePhase: Number(phaseVoltage.toFixed(2)),
		current: Number(calcI.toFixed(2)),
		activePowerW: Number(calcP_W.toFixed(2)),
		activePowerKW: Number((calcP_W / 1000).toFixed(3)),
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
		activePowerW: 0,
		activePowerKW: 0,
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
