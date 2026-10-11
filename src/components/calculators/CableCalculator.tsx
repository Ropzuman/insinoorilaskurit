import React, { useMemo, useState } from "react";
import {
	CableSizingResult,
	calculateCableSizing,
	SystemVoltage,
} from "../../lib/calculators/cable-sizing";

export default function CableCalculator() {
	// Syötetilat
	const [voltage, setVoltage] = useState<SystemVoltage>(230);
	const [inputType, setInputType] = useState<"current" | "power">("current");
	const [currentInput, setCurrentInput] = useState<number>(10);
	const [powerInput, setPowerInput] = useState<number>(2300);
	const [lengthMeters, setLengthMeters] = useState<number>(15);
	const [maxAllowedDropPercent, setMaxAllowedDropPercent] = useState<number>(3);
	const [conductorMaterial, setConductorMaterial] = useState<"copper" | "aluminum">(
		"copper",
	);

	// Lasketaan virta (A) jos teho (W) on valittuna
	const effectiveCurrent = useMemo(() => {
		if (inputType === "current") return currentInput;
		if (powerInput <= 0 || voltage <= 0) return 0;

		// 3-vaihesähkössä (400V) P = sqrt(3) * U * I (oletetaan cos phi = 1)
		if (voltage === 400) {
			return powerInput / (Math.sqrt(3) * 400);
		}
		return powerInput / voltage;
	}, [inputType, currentInput, powerInput, voltage]);

	// Reaktiivinen laskenta ilman erillistä "Laske"-painiketta
	const result: CableSizingResult = useMemo(() => {
		return calculateCableSizing({
			voltage,
			currentAmperes: effectiveCurrent,
			lengthMeters,
			maxAllowedDropPercent,
			conductorMaterial,
		});
	}, [voltage, effectiveCurrent, lengthMeters, maxAllowedDropPercent, conductorMaterial]);

	// Väritilan määritys tuloskorteille
	const statusColors = {
		ok: {
			bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
			border: "border-emerald-500/30",
			text: "text-emerald-700 dark:text-emerald-400",
			badge: "bg-emerald-500 text-white",
			label: "Normaali / Turvallinen",
		},
		warning: {
			bg: "bg-amber-500/10 dark:bg-amber-500/15",
			border: "border-amber-500/30",
			text: "text-amber-700 dark:text-amber-400",
			badge: "bg-amber-500 text-white",
			label: "Varoitus: Jännitehäviö koholla",
		},
		danger: {
			bg: "bg-rose-500/10 dark:bg-rose-500/15",
			border: "border-rose-500/30",
			text: "text-rose-700 dark:text-rose-400",
			badge: "bg-rose-500 text-white",
			label: "Kriittinen: Liian suuri jännitehäviö (>5%)",
		},
	};

	const currentStatus = statusColors[result.status];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			{/* Syöteosio (Input Form) */}
			<div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
				<h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
					<span>⚙️</span> Asennuksen tiedot
				</h2>

				{/* Järjestelmän jännite */}
				<div>
					<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
						Järjestelmän jännite (U)
					</label>
					<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
						{([12, 24, 48, 230, 400] as SystemVoltage[]).map((v) => (
							<button
								key={v}
								type="button"
								onClick={() => setVoltage(v)}
								className={`py-2.5 px-3 rounded-xl text-sm font-bold min-h-[44px] transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									voltage === v
										? "bg-blue-600 text-white shadow-md"
										: "bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
								}`}
							>
								{v} V {v >= 230 ? "AC" : "DC"}
							</button>
						))}
					</div>
				</div>

				{/* Syötetapa (Virta vai Teho) */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
							Kuormitus
						</label>
						<div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-700/60">
							<button
								type="button"
								onClick={() => setInputType("current")}
								className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
									inputType === "current"
										? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
										: "text-slate-500 dark:text-slate-400"
								}`}
							>
								Virta (A)
							</button>
							<button
								type="button"
								onClick={() => setInputType("power")}
								className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
									inputType === "power"
										? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
										: "text-slate-500 dark:text-slate-400"
								}`}
							>
								Teho (W)
							</button>
						</div>
					</div>

					{inputType === "current" ? (
						<div>
							<div className="relative">
								<input
									type="number"
									min="0.1"
									step="0.5"
									value={currentInput || ""}
									onChange={(e) => setCurrentInput(parseFloat(e.target.value) || 0)}
									className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
									placeholder="Esim. 16"
								/>
								<span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
									A
								</span>
							</div>
						</div>
					) : (
						<div>
							<div className="relative">
								<input
									type="number"
									min="1"
									step="50"
									value={powerInput || ""}
									onChange={(e) => setPowerInput(parseFloat(e.target.value) || 0)}
									className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
									placeholder="Esim. 3600"
								/>
								<span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
									W
								</span>
							</div>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
								Laskettu virta:{" "}
								<span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
									{effectiveCurrent.toFixed(1)} A
								</span>
							</p>
						</div>
					)}
				</div>

				{/* Kaapelin pituus */}
				<div>
					<div className="flex justify-between items-center mb-2">
						<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
							Kaapelin pituus (m)
						</label>
						<span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
							{lengthMeters} m
						</span>
					</div>
					<input
						type="range"
						min="1"
						max="150"
						value={lengthMeters}
						onChange={(e) => setLengthMeters(parseInt(e.target.value) || 1)}
						className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
					/>
				</div>

				{/* Johtimen materiaali & Sallittu häviö */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Materiaali
						</label>
						<select
							value={conductorMaterial}
							onChange={(e) =>
								setConductorMaterial(e.target.value as "copper" | "aluminum")
							}
							className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
						>
							<option value="copper">Kupari (Cu)</option>
							<option value="aluminum">Alumiini (Al)</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Sallittu häviö (%)
						</label>
						<select
							value={maxAllowedDropPercent}
							onChange={(e) => setMaxAllowedDropPercent(parseFloat(e.target.value))}
							className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
						>
							<option value={1.5}>1.5 % (Vaativat laitteet)</option>
							<option value={3}>3.0 % (Vakiokoti/Valaistus)</option>
							<option value={5}>5.0 % (Pääsyöttöjohdot)</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tulososio (Calculation Results) */}
			<div className="lg:col-span-5 space-y-6">
				<div
					className={`rounded-2xl p-6 sm:p-8 border ${currentStatus.bg} ${currentStatus.border} shadow-lg transition-all`}
				>
					<div className="flex justify-between items-center mb-6">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Laskennan tulos
						</span>
						<span
							className={`px-3 py-1 rounded-full text-xs font-extrabold ${currentStatus.badge}`}
						>
							{currentStatus.label}
						</span>
					</div>

					{/* Päänumero: Suositeltu poikkipinta-ala */}
					<div className="mb-8">
						<div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
							Suositeltu kaapelin poikkipinta-ala
						</div>
						<div className="text-5xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
							{result.recommendedMm2}{" "}
							<span className="text-2xl text-slate-500 font-normal">mm²</span>
						</div>
					</div>

					{/* Yksityiskohtaiset tulosarvot */}
					<div className="space-y-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-6 text-sm">
						<div className="flex justify-between items-center">
							<span className="text-slate-600 dark:text-slate-400">
								Jännitehäviö (V):
							</span>
							<span className="font-mono font-bold text-slate-900 dark:text-white text-base">
								{result.voltageDropVolts} V
							</span>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-slate-600 dark:text-slate-400">
								Jännitehäviö (%):
							</span>
							<span className={`font-mono font-bold text-base ${currentStatus.text}`}>
								{result.voltageDropPercent} %
							</span>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-slate-600 dark:text-slate-400">
								Tehohäviö kaapelissa:
							</span>
							<span className="font-mono font-bold text-slate-900 dark:text-white text-base">
								{result.powerLossWatts} W
							</span>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-slate-600 dark:text-slate-400">
								Suositeltu sulakekoko:
							</span>
							<span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-base">
								{result.recommendedFuseAmperes} A
							</span>
						</div>
					</div>
				</div>

				{/* Hyödyllinen vinkki / Ohje */}
				<div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-400 space-y-2">
					<p className="font-semibold text-slate-800 dark:text-slate-200">
						💡 Hyvä tietää kaapelimitoituksesta:
					</p>
					<p>
						Standardi ST 51.12 suosittelee yleisissä sähköasennuksissa enintään **3 %**
						jännitehäviötä syöttöpisteestä kuormalle.
					</p>
				</div>
			</div>
		</div>
	);
}
