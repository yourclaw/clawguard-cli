import type { ScanReport } from "@yourclaw/clawguard-scanner";

/**
 * Format for CI/CD environments — minimal, machine-parseable.
 */
export function formatCI(report: ScanReport): string {
	const lines: string[] = [];

	lines.push(`STATUS=${report.status}`);
	lines.push(`SCORE=${report.score.total}`);
	lines.push(`RECOMMENDATION=${report.recommendation}`);
	lines.push(`CRITICAL=${report.score.critical}`);
	lines.push(`HIGH=${report.score.high}`);
	lines.push(`MEDIUM=${report.score.medium}`);
	lines.push(`LOW=${report.score.low}`);
	lines.push(`TOTAL_FINDINGS=${report.findings.length}`);

	if (report.findings.length > 0) {
		lines.push("");
		for (const f of report.findings) {
			lines.push(
				`[${f.severity.toUpperCase()}] ${f.id}: ${f.message}${f.lineNumber ? ` (line ${f.lineNumber})` : ""}`,
			);
		}
	}

	return lines.join("\n");
}

/**
 * Get the appropriate exit code for CI.
 * 0 = no findings, 1 = findings found, 2 = critical findings.
 */
export function getExitCode(report: ScanReport): number {
	if (report.score.critical > 0) return 2;
	if (report.findings.length > 0) return 1;
	return 0;
}
