import React, { useMemo, useState } from "react";
import { calculateOhmsLaw, OhmsLawResult } from "../../lib/calculators/ohms-law";

type KnownField = "U" | "I" | "R" | "P";

export default function OhmsLawCalculator() {
	const [selectedFields, setSelectedFields] = useState<[KnownField, KnownField]>([
		"U",
		"I",
	]);
	const [valU, setValU] = useState<string>("230");
	const [valI, setValI] = useState<string>("10");
	const [valR, setValR] = useState<string>("23");
	const [valP, setValP] = useState<string>("2300");

	// Handle mode selection (which 2 parameters are user inputs)
	const isInputU = selectedFields.includes("U");
	const isInputI = selectedFields.includes("I");
	const isInputR = selectedFields.includes("R");
	const isInputP = selectedFields.includes("P");

	const result: OhmsLawResult = useMemo(() => {
		return calculateOhmsLaw({
			voltage: isInputU ? parseFloat(valU) : undefined,
			current: isInputI ? parseFloat(valI) : undefined,
			resistance: isInputR ? parseFloat(valR) : undefined,
			power: isInputP ? parseFloat(valP) : undefined,
		});
	}, [valU, valI, valR, valP, selectedFields]);

	const toggleField = (field: KnownField) => {
		if (selectedFields.includes(field)) return; // Keep at least 2 selected
		setSelectedFields([selectedFields[1], field]);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			{/* Input / Control Section */}
			<div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
				<div>
					<h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
						Valitse kaksi tunnettua suuretta
					</h2>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Valitse arvot, jotka tiedät. Laskuri laskee automaattisesti kaksi muuta.
					</p>
				</div>

				{/* Field Selector Chips */}
				<div
					className="grid grid-cols-2 sm:grid-cols-4 gap-2"
					role="group"
					aria-label="Valitse kaksi tunnettua suuretta"
				>
					{(
						[
							{ id: "U", name: "Jännite (U)", unit: "V" },
							{ id: "I", name: "Virta (I)", unit: "A" },
							{ id: "R", name: "Resistanssi (R)", unit: "Ω" },
							{ id: "P", name: "Teho (P)", unit: "W" },
						] as const
					).map((field) => {
						const isSelected = selectedFields.includes(field.id);
						return (
							<button
								key={field.id}
								type="button"
								onClick={() => toggleField(field.id)}
								aria-pressed={isSelected}
								className={`py-3 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
									isSelected
										? "bg-blue-600 text-white border-blue-600 shadow-md"
										: "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
								}`}
							>
								<span>{field.name}</span>
								<span className="opacity-80 text-[10px]">[{field.unit}]</span>
							</button>
						);
					})}
				</div>

				{/* Dynamic Input Form */}
				<div className="space-y-4 pt-2">
					{/* Voltage */}
					<div>
						<label
							htmlFor="ohms-law-voltage"
							className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
						>
							Jännite (U) - Volttia [V]
						</label>
						<input
							id="ohms-law-voltage"
							type="number"
							min="0"
							step="any"
							disabled={!isInputU}
							aria-invalid={isInputU && !result.isValid}
							aria-describedby={isInputU && !result.isValid ? "ohms-law-error" : undefined}
							value={isInputU ? valU : result.isValid ? result.voltage : ""}
							onChange={(e) => setValU(e.target.value)}
							className={`w-full px-4 py-3 rounded-xl border text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none ${
								isInputU
									? "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
									: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-blue-600 dark:text-blue-400"
							}`}
						/>
					</div>

					{/* Current */}
					<div>
						<label
							htmlFor="ohms-law-current"
							className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
						>
							Virta (I) - Ampeeria [A]
						</label>
						<input
							id="ohms-law-current"
							type="number"
							min="0"
							step="any"
							disabled={!isInputI}
							aria-invalid={isInputI && !result.isValid}
							aria-describedby={isInputI && !result.isValid ? "ohms-law-error" : undefined}
							value={isInputI ? valI : result.isValid ? result.current : ""}
							onChange={(e) => setValI(e.target.value)}
							className={`w-full px-4 py-3 rounded-xl border text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none ${
								isInputI
									? "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
									: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-blue-600 dark:text-blue-400"
							}`}
						/>
					</div>

					{/* Resistance */}
					<div>
						<label
							htmlFor="ohms-law-resistance"
							className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
						>
							Resistanssi (R) - Ohmia [Ω]
						</label>
						<input
							id="ohms-law-resistance"
							type="number"
							min="0"
							step="any"
							disabled={!isInputR}
							aria-invalid={isInputR && !result.isValid}
							aria-describedby={isInputR && !result.isValid ? "ohms-law-error" : undefined}
							value={isInputR ? valR : result.isValid ? result.resistance : ""}
							onChange={(e) => setValR(e.target.value)}
							className={`w-full px-4 py-3 rounded-xl border text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none ${
								isInputR
									? "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
									: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-blue-600 dark:text-blue-400"
							}`}
						/>
					</div>

					{/* Power */}
					<div>
						<label
							htmlFor="ohms-law-power"
							className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
						>
							Teho (P) - Wattia [W]
						</label>
						<input
							id="ohms-law-power"
							type="number"
							min="0"
							step="any"
							disabled={!isInputP}
							aria-invalid={isInputP && !result.isValid}
							aria-describedby={isInputP && !result.isValid ? "ohms-law-error" : undefined}
							value={isInputP ? valP : result.isValid ? result.power : ""}
							onChange={(e) => setValP(e.target.value)}
							className={`w-full px-4 py-3 rounded-xl border text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none ${
								isInputP
									? "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
									: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-blue-600 dark:text-blue-400"
							}`}
						/>
					</div>
				</div>
			</div>

			{/* Results Summary Card */}
			<div className="lg:col-span-5 space-y-6">
				<div
					className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6"
				>
					<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
						Kaikki arvot yhteenvedossa
					</h3>

					{result.isValid ? (
						<div aria-live="polite" aria-atomic="true">
							<div className="grid grid-cols-2 gap-4 font-mono">
								<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
									<span className="text-xs text-slate-400 block font-sans">Jännite (U)</span>
									<span className="text-2xl font-bold text-blue-400">
										{result.voltage} V
									</span>
								</div>
								<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
									<span className="text-xs text-slate-400 block font-sans">Virta (I)</span>
									<span className="text-2xl font-bold text-emerald-400">
										{result.current} A
									</span>
								</div>
								<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
									<span className="text-xs text-slate-400 block font-sans">
										Resistanssi (R)
									</span>
									<span className="text-2xl font-bold text-amber-400">
										{result.resistance} Ω
									</span>
								</div>
								<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
									<span className="text-xs text-slate-400 block font-sans">Teho (P)</span>
									<span className="text-2xl font-bold text-purple-400">
										{result.power} W
									</span>
								</div>
							</div>
						</div>
					) : (
						<p id="ohms-law-error" role="alert" className="text-sm text-rose-300">
							{result.errorMessage}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
