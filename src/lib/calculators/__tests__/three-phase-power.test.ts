import { describe, expect, it } from "vitest";
import { calculateThreePhasePower } from "../three-phase-power";

describe("Three-Phase Power Calculator", () => {
	it("calculates P, S, Q correctly from line current", () => {
		// 400V, 10A, cos phi 0.85, eta 100%
		const res = calculateThreePhasePower({
			voltage: 400,
			current: 10,
			powerFactor: 0.85,
			efficiency: 100,
			calculationMode: "fromCurrent",
		});

		expect(res.isValid).toBe(true);
		expect(res.voltagePhase).toBeCloseTo(230.94, 1);
		expect(res.apparentPowerKVA).toBeCloseTo(6.928, 2);
		expect(res.activePowerKW).toBeCloseTo(5.889, 2);
		expect(res.reactivePowerKVar).toBeCloseTo(3.649, 2);
		expect(res.phiDegrees).toBeCloseTo(31.8, 1);
	});

	it("calculates current and S correctly from active power (kW)", () => {
		// 400V, 11 kW, cos phi 0.88, eta 90%
		const res = calculateThreePhasePower({
			voltage: 400,
			activePowerKW: 11,
			powerFactor: 0.88,
			efficiency: 90,
			calculationMode: "fromActivePower",
		});

		expect(res.isValid).toBe(true);
		expect(res.activePowerKW).toBe(11);
		expect(res.apparentPowerKVA).toBeCloseTo(13.889, 2);
		expect(res.current).toBeCloseTo(20.05, 1);
	});

	it("calculates current and P correctly from apparent power (kVA)", () => {
		// 400V, 20 kVA, cos phi 0.95, eta 100%
		const res = calculateThreePhasePower({
			voltage: 400,
			apparentPowerKVA: 20,
			powerFactor: 0.95,
			efficiency: 100,
			calculationMode: "fromApparentPower",
		});

		expect(res.isValid).toBe(true);
		expect(res.current).toBeCloseTo(28.87, 1);
		expect(res.activePowerKW).toBeCloseTo(19.0, 1);
	});

	it("handles invalid inputs gracefully", () => {
		const invalidVoltage = calculateThreePhasePower({
			voltage: 0,
			current: 10,
			calculationMode: "fromCurrent",
		});
		expect(invalidVoltage.isValid).toBe(false);
		expect(invalidVoltage.errorMessage).toContain("Pääjännitteen");

		const invalidCosPhi = calculateThreePhasePower({
			voltage: 400,
			current: 10,
			powerFactor: 1.5,
			calculationMode: "fromCurrent",
		});
		expect(invalidCosPhi.isValid).toBe(false);
		expect(invalidCosPhi.errorMessage).toContain("Tehokertoimen");
	});
});
