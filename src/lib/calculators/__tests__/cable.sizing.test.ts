import { describe, expect, it } from "vitest";
import { calculateCableSizing } from "../cable-sizing";

describe("Kaapelimitoituslaskuri (Cable Sizing)", () => {
	it("laskee 12V DC -järjestelmän jännitehäviön ja poikkipinta-alan oikein", () => {
		const result = calculateCableSizing({
			voltage: 12,
			currentAmperes: 10,
			lengthMeters: 5,
			maxAllowedDropPercent: 3,
		});

		expect(result.recommendedMm2).toBe(6); // 6mm² kaapeli pitää häviön alle 3%
		expect(result.voltageDropPercent).toBeLessThanOrEqual(3);
		expect(result.status).toBe("ok");
		expect(result.recommendedFuseAmperes).toBe(10);
	});

	it("käsittelee 3-vaiheisen 400V AC -asennuksen oikein", () => {
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

	it("palauttaa warning-statuksen kun jännitehäviö on 3-5% välillä", () => {
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

	it("palauttaa danger-statuksen kun jännitehäviö ylittää 5%", () => {
		const result = calculateCableSizing({
			voltage: 12,
			currentAmperes: 100,
			lengthMeters: 100, // 100 metrillä 300mm² kaapelin häviö on ~9.89%
			maxAllowedDropPercent: 3,
		});

		expect(result.voltageDropPercent).toBeGreaterThan(5);
		expect(result.status).toBe("danger");
	});
});
