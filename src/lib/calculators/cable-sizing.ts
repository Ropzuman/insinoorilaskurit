export type SystemVoltage = 12 | 24 | 48 | 230 | 400;

export interface CableSizingInput {
	voltage: SystemVoltage;
	currentAmperes: number;
	lengthMeters: number;
	maxAllowedDropPercent?: number; // Oletus: 3%
	conductorMaterial?: "copper" | "aluminum"; // Oletus: kupari
}

export interface CableSizingResult {
	voltageDropVolts: number;
	voltageDropPercent: number;
	powerLossWatts: number;
	recommendedMm2: number;
	status: "ok" | "warning" | "danger";
	recommendedFuseAmperes: number;
}

// Resistiivisyydet Ohm * mm² / m (20°C)
const RESISTIVITY = {
	copper: 0.0178,
	aluminum: 0.029,
};

// Standardit kaapelin poikkipinta-alat (mm²)
export const STANDARD_MM2 = [
	1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300,
];

// Suositellut standardisulakekoot (A)
const STANDARD_FUSES = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

export function calculateCableSizing(input: CableSizingInput): CableSizingResult {
	const {
		voltage,
		currentAmperes,
		lengthMeters,
		maxAllowedDropPercent = 3,
		conductorMaterial = "copper",
	} = input;

	// Syötteiden validointi (turvataan ettei palauteta NaN)
	const current = Math.max(0, currentAmperes || 0);
	const length = Math.max(0, lengthMeters || 0);
	const rho = RESISTIVITY[conductorMaterial];

	// Etäisyyden kertoimet (DC & 1-vaihe AC: menopaluu = 2x, 3-vaihe 400V AC: sqrt(3) ≈ 1.732)
	const distanceMultiplier = voltage === 400 ? Math.sqrt(3) : 2;

	// Etsitään pienin standardipinta-ala, joka alittaa sallitun jännitehäviön
	let recommendedMm2 = STANDARD_MM2[STANDARD_MM2.length - 1];

	for (const mm2 of STANDARD_MM2) {
		const vDrop = (distanceMultiplier * length * current * rho) / mm2;
		const dropPercent = (vDrop / voltage) * 100;

		if (dropPercent <= maxAllowedDropPercent) {
			recommendedMm2 = mm2;
			break;
		}
	}

	// Lasketaan lopulliset arvot valitulle kaapelipaksuudelle
	const voltageDropVolts = (distanceMultiplier * length * current * rho) / recommendedMm2;
	const voltageDropPercent = (voltageDropVolts / voltage) * 100;

	// Tehohäviö: P = I² * R, missä R = rho * (distanceMultiplier * length) / mm²
	const cableResistance = (rho * distanceMultiplier * length) / recommendedMm2;
	const powerLossWatts = Math.pow(current, 2) * cableResistance;

	// Määritetään status väri-indikaattoreille
	let status: "ok" | "warning" | "danger" = "ok";
	if (voltageDropPercent > 5) {
		status = "danger";
	} else if (voltageDropPercent > maxAllowedDropPercent) {
		status = "warning";
	}

	// Valitaan sopiva sulakekoko (seuraava pykälä virrasta ylöspäin)
	const recommendedFuseAmperes =
		STANDARD_FUSES.find((fuse) => fuse >= current) || Math.ceil(current);

	return {
		voltageDropVolts: Number(voltageDropVolts.toFixed(2)),
		voltageDropPercent: Number(voltageDropPercent.toFixed(2)),
		powerLossWatts: Number(powerLossWatts.toFixed(1)),
		recommendedMm2,
		status,
		recommendedFuseAmperes,
	};
}
