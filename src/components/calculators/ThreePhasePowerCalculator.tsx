import React, { useMemo, useState } from "react";
import {
	ActivePowerType,
	calculateThreePhasePower,
	ThreePhaseCalculationMode,
} from "../../lib/calculators/three-phase-power";

export default function ThreePhasePowerCalculator() {
	const [mode, setMode] = useState<ThreePhaseCalculationMode>("fromCurrent");
	const [voltage, setVoltage] = useState<string>("400");
	const [current, setCurrent] = useState<string>("16");
	const [activePower, setActivePower] = useState<string>("11");
	const [activePowerType, setActivePowerType] = useState<ActivePowerType>("shaft");
	const [apparentPower, setApparentPower] = useState<string>("15");
	const [powerFactor, setPowerFactor] = useState<string>("0.85");
	const [efficiency, setEfficiency] = useState<string>("90");

	const result = useMemo(() => {
		return calculateThreePhasePower({
			voltage: parseFloat(voltage) || 0,
			current: parseFloat(current) || 0,
			activePowerKW: parseFloat(activePower) || 0,
			activePowerType,
			apparentPowerKVA: parseFloat(apparentPower) || 0,
			powerFactor: parseFloat(powerFactor) || 0,
			efficiency: parseFloat(efficiency) || 0,
			calculationMode: mode,
		});
	}, [mode, voltage, current, activePower, activePowerType, apparentPower, powerFactor, efficiency]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			{/* Input Form */}
			<div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
				<div>
					<h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
						Valitse laskentatapa
					</h2>
					<div
						className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
						role="group"
						aria-label="Laskentatapa"
					>
						{[
							{ id: "fromCurrent", label: "Virrasta (A)" },
							{ id: "fromActivePower", label: "Tehosta (kW)" },
							{ id: "fromApparentPower", label: "Näennäistehosta (kVA)" },
						].map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => setMode(item.id as ThreePhaseCalculationMode)}
								aria-pressed={mode === item.id}
								className={`py-2 px-3 rounded-lg text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
									mode === item.id
										? "bg-blue-600 text-white shadow-sm"
										: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
								}`}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>

				<div className="space-y-4">
					{/* Voltage */}
					<div>
						<div className="flex justify-between items-center mb-1">
							<label
								htmlFor="three-phase-voltage"
								className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
							>
								Jännite (U) - Volttia [V]
							</label>
							<div className="flex gap-1" role="group" aria-label="Jännitteen esiasetukset">
								{["400", "230", "690"].map((val) => (
									<button
										key={val}
										type="button"
										onClick={() => setVoltage(val)}
										aria-pressed={voltage === val}
										aria-label={`Valitse jännitteeksi ${val} volttia`}
										className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									>
										{val} V
									</button>
								))}
							</div>
						</div>
						<input
							id="three-phase-voltage"
							type="number"
							min="0"
							step="any"
							value={voltage}
							onChange={(e) => setVoltage(e.target.value)}
							aria-describedby={!result.isValid ? "three-phase-error" : undefined}
							className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>

					{/* Conditional Input based on Mode */}
					{mode === "fromCurrent" && (
						<div>
							<label
								htmlFor="three-phase-current"
								className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
							>
								Vaihevirta (I) - Ampeeria [A]
							</label>
							<input
								id="three-phase-current"
								type="number"
								min="0"
								step="any"
								value={current}
								onChange={(e) => setCurrent(e.target.value)}
								aria-describedby={!result.isValid ? "three-phase-error" : undefined}
								className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					)}

					{mode === "fromActivePower" && (
						<div>
							<label
								htmlFor="three-phase-active-power"
								className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
							>
								{activePowerType === "shaft"
									? "Moottorin akseliteho (Pₛₕₐfₜ) - Kilowattia [kW]"
									: "Sähköinen pätöteho (Pₑ) - Kilowattia [kW]"}
							</label>
							<div
								className="grid grid-cols-2 gap-2 mb-3"
								role="group"
								aria-label="Syötettävän tehon tyyppi"
							>
								<button
									type="button"
									onClick={() => setActivePowerType("shaft")}
									aria-pressed={activePowerType === "shaft"}
									className={`min-h-11 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
										activePowerType === "shaft"
											? "bg-blue-600 text-white"
											: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									}`}
								>
									Akseliteho
								</button>
								<button
									type="button"
									onClick={() => setActivePowerType("electrical")}
									aria-pressed={activePowerType === "electrical"}
									className={`min-h-11 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
										activePowerType === "electrical"
											? "bg-blue-600 text-white"
											: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									}`}
								>
									Sähköinen pätöteho
								</button>
							</div>
							<input
								id="three-phase-active-power"
								type="number"
								min="0"
								step="any"
								value={activePower}
								onChange={(e) => setActivePower(e.target.value)}
								aria-describedby={!result.isValid ? "three-phase-error" : undefined}
								className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
							<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
								{activePowerType === "shaft"
									? "Akseliteho on moottorin hyötyteho. Laskuri huomioi hyötysuhteen ja laskee sähköverkon ottaman tehon."
									: "Sähköinen pätöteho on moottorin sähköverkosta ottama teho. Laskuri arvioi akselitehon hyötysuhteen perusteella."}
							</p>
						</div>
					)}

					{mode === "fromApparentPower" && (
						<div>
							<label
								htmlFor="three-phase-apparent-power"
								className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
							>
								Näennäisteho (S) - Kilovolttiampeeria [kVA]
							</label>
							<input
								id="three-phase-apparent-power"
								type="number"
								min="0"
								step="any"
								value={apparentPower}
								onChange={(e) => setApparentPower(e.target.value)}
								aria-describedby={!result.isValid ? "three-phase-error" : undefined}
								className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					)}

					{/* Power Factor & Efficiency */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<div className="flex justify-between items-center mb-1">
								<label
									htmlFor="three-phase-power-factor"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
								>
									Tehokerroin (cos φ)
								</label>
								{/* <div className="flex gap-1">
									{["0.80", "0.85", "0.95", "1.0"].map((val) => (
										<button
											key={val}
											type="button"
											onClick={() => setPowerFactor(val)}
											className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
										>
											{val}
										</button>
									))}
								</div> */}
							</div>
							<input
								id="three-phase-power-factor"
								type="number"
								step="0.01"
								min="0.1"
								max="1.0"
								value={powerFactor}
								onChange={(e) => setPowerFactor(e.target.value)}
								aria-describedby={!result.isValid ? "three-phase-error" : undefined}
								className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>

						<div>
							<label
								htmlFor="three-phase-efficiency"
								className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
							>
								Moottorin hyötysuhde (η %)
							</label>
							<input
								id="three-phase-efficiency"
								type="number"
								min="1"
								max="100"
								value={efficiency}
								onChange={(e) => setEfficiency(e.target.value)}
								aria-describedby={!result.isValid ? "three-phase-error" : undefined}
								className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Results Summary Card */}
			<div className="lg:col-span-5 space-y-6">
				{result.isValid ? (
					<div
						className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6"
						aria-live="polite"
						aria-atomic="true"
						role="status"
					>
							<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
								Laskennan tulokset (3-vaihe)
							</h3>

							<div className="space-y-4 font-mono">
								<div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
									<span className="text-xs text-slate-400 font-sans">Vaihevirta (I)</span>
									<span className="text-2xl font-bold text-emerald-400">
										{result.current} A
									</span>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
										<span className="text-xs text-slate-400 font-sans block">
											Sähköinen pätöteho (Pₑ)
										</span>
										<span className="text-xl font-bold text-blue-400">
											{result.electricalActivePowerKW} kW
										</span>
										<span className="text-[10px] text-slate-500 block">
											{result.electricalActivePowerW} W
										</span>
									</div>

									<div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
										<span className="text-xs text-slate-400 font-sans block">
											Akseliteho (Pₛₕₐfₜ)
										</span>
										<span className="text-xl font-bold text-teal-400">
											{result.shaftOutputPowerKW} kW
										</span>
										<span className="text-[10px] text-slate-500 block">
											{result.shaftOutputPowerW} W
										</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
										<span className="text-xs text-slate-400 font-sans block">
											Näennäisteho (S)
										</span>
										<span className="text-xl font-bold text-purple-400">
											{result.apparentPowerKVA} kVA
										</span>
										<span className="text-[10px] text-slate-500 block">
											{result.apparentPowerVA} VA
										</span>
									</div>

									<div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
										<span className="text-xs text-slate-400 font-sans block">
											Loisteho (Q)
										</span>
										<span className="text-xl font-bold text-amber-400">
											{result.reactivePowerKVar} kvar
										</span>
										<span className="text-[10px] text-slate-500 block">
											{result.reactivePowerVar} var
										</span>
									</div>
								</div>

								<div className="pt-2 border-t border-slate-800 text-xs font-sans text-slate-400 space-y-1">
									<div className="flex justify-between">
										<span>Vaihekulma (φ):</span>
										<span className="font-mono text-slate-200">
											{result.phiDegrees}° (cos φ = {result.powerFactor})
										</span>
									</div>
									<div className="flex justify-between">
										<span>Jännite (Uₗ):</span>
										<span className="font-mono text-slate-200">{result.voltageLine} V</span>
									</div>
									<div className="flex justify-between">
										<span>Vaihejännite (Uₚ):</span>
										<span className="font-mono text-slate-200">
											{result.voltagePhase} V
										</span>
									</div>
								</div>
							</div>
						</div>
				) : (
					<div
						id="three-phase-error"
						className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-6 rounded-2xl text-sm"
						role="alert"
					>
						{result.errorMessage}
					</div>
				)}
			</div>
		</div>
	);
}
