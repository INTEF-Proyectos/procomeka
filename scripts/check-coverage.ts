import { spawn } from "node:child_process";

import { buildBunTestArgs, findStandardTestFiles } from "./run-bun-suite.ts";

const THRESHOLD = 90;
const ALL_FILES_REGEX = /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/;

export function stripAnsiCodes(output: string) {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: Necesitamos parsear códigos ANSI y limpiar los logs de bun
	return output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

export function extractLineCoverage(output: string) {
	const cleanOutput = stripAnsiCodes(output);
	const match = cleanOutput.match(ALL_FILES_REGEX);
	return match?.[2] ? Number.parseFloat(match[2]) : null;
}

async function runCoverage() {
	const files = await findStandardTestFiles();

	if (files.length === 0) {
		console.error("❌ No se encontraron tests estándar para calcular coverage");
		process.exit(1);
	}

	const env = { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" };
	const proc = spawn("bun", buildBunTestArgs(files, { coverage: true }), { env });

	let output = "";

	proc.stdout.on("data", (data) => {
		output += data.toString();
		process.stdout.write(data);
	});

	proc.stderr.on("data", (data) => {
		output += data.toString();
		process.stderr.write(data);
	});

	proc.on("close", (_code) => {
		const coverage = extractLineCoverage(output);

		if (coverage !== null) {
			console.log(`\nCoverage de líneas: ${coverage}%`);

			if (coverage < THRESHOLD) {
				console.error(
					`❌ El coverage (${coverage}%) está por debajo del límite mínimo (${THRESHOLD}%)`,
				);
				process.exit(1);
			} else {
				console.log(`✅ Coverage suficiente (>= ${THRESHOLD}%)`);
				process.exit(0);
			}
		} else {
			console.error(
				"❌ No se pudo determinar el coverage de la salida de bun test --coverage",
			);
			process.exit(1);
		}
	});
}

if (import.meta.main) {
	await runCoverage();
}
