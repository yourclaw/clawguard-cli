import { resolve } from "node:path";
import { scanSkill, formatJSON, formatMarkdown, formatSARIF } from "@yourclaw/clawguard-scanner";
import type { ScanOptions } from "@yourclaw/clawguard-scanner";
import { formatTerminal } from "../formatters/terminal";
import { formatCI, getExitCode } from "../formatters/ci";

export type OutputFormat = "terminal" | "json" | "sarif" | "markdown" | "ci";

export interface ScanCommandOptions {
	format: OutputFormat;
	builtinOnly: boolean;
	skipAI: boolean;
	output?: string;
}

export async function runScan(
	path: string,
	options: ScanCommandOptions,
): Promise<void> {
	const skillPath = resolve(path);

	const scanOptions: ScanOptions = {
		builtinOnly: options.builtinOnly,
		skipAI: options.skipAI,
	};

	const report = await scanSkill(skillPath, scanOptions);

	let output: string;
	switch (options.format) {
		case "json":
			output = formatJSON(report);
			break;
		case "sarif":
			output = formatSARIF(report);
			break;
		case "markdown":
			output = formatMarkdown(report);
			break;
		case "ci":
			output = formatCI(report);
			break;
		default:
			output = formatTerminal(report);
			break;
	}

	if (options.output) {
		const { writeFileSync } = await import("node:fs");
		writeFileSync(options.output, output, "utf-8");
		console.log(`Report written to ${options.output}`);
	} else {
		console.log(output);
	}

	// Exit with appropriate code for CI
	const exitCode = getExitCode(report);
	if (exitCode > 0 && (options.format === "ci" || options.format === "sarif")) {
		process.exit(exitCode);
	}
}
