export interface OhmsLawInput {
	voltage?: number; // U (V)
	current?: number; // I (A)
	resistance?: number; // R (Ω)
	power?: number; // P (W)
}

export interface OhmsLawResult {
	voltage: number;
	current: number;
	resistance: number;
	power: number;
	isValid: boolean;
	errorMessage?: string;
}

/**
 * Calculates missing parameters for Ohm's Law and Power equations.
 * Expects exactly 2 known positive non-zero parameters.
 */
export function calculateOhmsLaw(input: OhmsLawInput): OhmsLawResult {
	const { voltage: U, current: I, resistance: R, power: P } = input;

	const providedValues = [U, I, R, P].filter((value) => value !== undefined);

	if (providedValues.length !== 2) {
		return {
			voltage: 0,
			current: 0,
			resistance: 0,
			power: 0,
			isValid: false,
			errorMessage: "Syötä täsmälleen kaksi tunnettua arvoa.",
		};
	}

	if (providedValues.some((value) => !Number.isFinite(value) || value <= 0)) {
		return {
			voltage: 0,
			current: 0,
			resistance: 0,
			power: 0,
			isValid: false,
			errorMessage: "Anna molemmille suureille positiivinen, äärellinen arvo.",
		};
	}

	let calcU = U ?? 0;
	let calcI = I ?? 0;
	let calcR = R ?? 0;
	let calcP = P ?? 0;

	// 1. Given U and I
	if (U && I) {
		calcR = U / I;
		calcP = U * I;
	}
	// 2. Given U and R
	else if (U && R) {
		calcI = U / R;
		calcP = (U * U) / R;
	}
	// 3. Given U and P
	else if (U && P) {
		calcI = P / U;
		calcR = (U * U) / P;
	}
	// 4. Given I and R
	else if (I && R) {
		calcU = I * R;
		calcP = I * I * R;
	}
	// 5. Given I and P
	else if (I && P) {
		calcU = P / I;
		calcR = P / (I * I);
	}
	// 6. Given R and P
	else if (R && P) {
		calcU = Math.sqrt(P * R);
		calcI = Math.sqrt(P / R);
	}

	// Safety checks against Infinity or NaN
	if (!isFinite(calcU) || !isFinite(calcI) || !isFinite(calcR) || !isFinite(calcP)) {
		return {
			voltage: 0,
			current: 0,
			resistance: 0,
			power: 0,
			isValid: false,
			errorMessage: "Laskennassa tapahtui virhe (jakolasku nollalla tai epäkelpo syöte).",
		};
	}

	return {
		voltage: Number(calcU.toFixed(3)),
		current: Number(calcI.toFixed(3)),
		resistance: Number(calcR.toFixed(3)),
		power: Number(calcP.toFixed(3)),
		isValid: true,
	};
}
