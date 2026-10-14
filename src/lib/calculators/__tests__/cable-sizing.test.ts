import { describe, expect, it } from "vitest";
import { calculateCableSizing } from "../cable-sizing";

describe("calculateCableSizing", () => {
	it("calculates voltage drop and cross-sectional area for a 12 V DC system", () => {
		const result = calculateCableSizing({
			voltage: 12,
			currentAmperes: 10,
			lengthMeters: 5,
			maxAllowedDropPercent: 3,
		});

		expect(result.recommendedMm2).toBe(6);
		expect(result.voltageDropPercent).toBeLessThanOrEqual(3);
		expect(result.status).toBe("ok");
		expect(result.recommendedFuseAmperes).toBe(10);
	});

	it("calculates cable sizing for a 400 V three-phase system", () => {
		const result = calculateCableSizing({
			voltage: 400,
			currentAmperes: 25,
			lengthMeters: 50,
			maxAllowedDropPercent: 3,
		});

		expect(result.recommendedMm2).toBeGreaterThanOrEqual(2.5);
		expect(result.status).toBe("ok");
		expect(result.recommendedFuseAmperes).toBe(25);
	});

	it("returns warning status when voltage drop is between 3% and 5%", () => {
		const result = calculateCableSizing({
			voltage: 12,
			currentAmperes: 100,
			lengthMeters: 50,
			maxAllowedDropPercent: 3,
		});

		expect(result.voltageDropPercent).toBeGreaterThan(3);
		expect(result.voltageDropPercent).toBeLessThanOrEqual(5);
		expect(result.status).toBe("warning");
	});

	it("returns danger status when voltage drop exceeds 5%", () => {
		const result = calculateCableSizing({
			voltage: 12,
			currentAmperes: 100,
			lengthMeters: 100,
			maxAllowedDropPercent: 3,
		});

		expect(result.voltageDropPercent).toBeGreaterThan(5);
		expect(result.status).toBe("danger");
	});
});
