import { describe, expect, it } from "vitest";
import { calculateOhmsLaw } from "../ohms-law";

describe("Ohm's Law Calculator", () => {
	it("calculates R and P correctly when given U and I", () => {
		const res = calculateOhmsLaw({ voltage: 230, current: 10 });
		expect(res.isValid).toBe(true);
		expect(res.resistance).toBe(23);
		expect(res.power).toBe(2300);
	});

	it("calculates I and P correctly when given U and R", () => {
		const res = calculateOhmsLaw({ voltage: 12, resistance: 4 });
		expect(res.isValid).toBe(true);
		expect(res.current).toBe(3);
		expect(res.power).toBe(36);
	});

	it("calculates U and I correctly when given R and P", () => {
		const res = calculateOhmsLaw({ resistance: 100, power: 400 });
		expect(res.isValid).toBe(true);
		expect(res.voltage).toBe(200);
		expect(res.current).toBe(2);
	});

	it("rejects inputs with fewer than 2 parameters", () => {
		const res = calculateOhmsLaw({ voltage: 230 });
		expect(res.isValid).toBe(false);
		expect(res.errorMessage).toBe("Syötä täsmälleen kaksi tunnettua arvoa.");
	});

	it("rejects more than 2 parameters instead of ignoring conflicting values", () => {
		const res = calculateOhmsLaw({ voltage: 230, current: 10, resistance: 10 });
		expect(res.isValid).toBe(false);
		expect(res.errorMessage).toBe("Syötä täsmälleen kaksi tunnettua arvoa.");
	});

	it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
		"rejects non-positive or non-finite inputs (%s)",
		(value) => {
			const res = calculateOhmsLaw({ voltage: value, current: 10 });
			expect(res.isValid).toBe(false);
			expect(res.errorMessage).toBe("Anna molemmille suureille positiivinen, äärellinen arvo.");
			expect([res.voltage, res.current, res.resistance, res.power].every(Number.isFinite)).toBe(
				true,
			);
		},
	);

	it("rejects calculations that overflow", () => {
		const res = calculateOhmsLaw({
			voltage: Number.MAX_VALUE,
			current: Number.MAX_VALUE,
		});
		expect(res.isValid).toBe(false);
		expect(res.errorMessage).toBeDefined();
	});
});
