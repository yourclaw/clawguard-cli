import type { ScanReport, Finding, Severity } from "@yourclaw/clawguard-scanner";

const SEVERITY_COLORS: Record<Severity, string> = {
	critical: "\x1b[31m", // red
	high: "\x1b[91m", // bright red
	medium: "\x1b[33m", // yellow
	low: "\x1b[36m", // cyan
	info: "\x1b[90m", // gray
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const STATUS_DISPLAY: Record<string, string> = {
	passed: "\x1b[32mPASSED\x1b[0m",
	warning: "\x1b[33mWARNING\x1b[0m",
	failed: "\x1b[31mFAILED\x1b[0m",
	blocked: "\x1b[31mBLOCKED\x1b[0m",
	error: "\x1b[91mERROR\x1b[0m",
};

function severityBadge(sev: Severity): string {
	return `${SEVERITY_COLORS[sev]}${sev.toUpperCase()}${RESET}`;
}

function formatFinding(finding: Finding, index: number): string {
	const lines: string[] = [];
	lines.push(
		`  ${DIM}${index + 1}.${RESET} ${severityBadge(finding.severity)} ${BOLD}${finding.id}${RESET}: ${finding.message}`,
	);
	if (finding.lineNumber || finding.filePath) {
		const loc = [finding.filePath, finding.lineNumber]
			.filter(Boolean)
			.join(":");
		lines.push(`     ${DIM}Location: ${loc}${RESET}`);
	}
	if (finding.evidence) {
		lines.push(`     ${DIM}Evidence: ${finding.evidence}${RESET}`);
	}
	lines.push(`     ${DIM}Scanner: ${finding.scanner} | Category: ${finding.category}${RESET}`);
	return lines.join("\n");
}

/**
 * Format a scan report for terminal output with ANSI colors.
 */
export function formatTerminal(report: ScanReport): string {
	const lines: string[] = [];

	// Header
	lines.push("");
	lines.push(`${BOLD}  ClawGuard Security Report${RESET}`);
	lines.push(`${DIM}  ========================${RESET}`);
	lines.push("");

	// Skill info
	lines.push(`  ${BOLD}Skill:${RESET}          ${report.skill.name}`);
	if (report.skill.author) {
		lines.push(`  ${BOLD}Author:${RESET}         ${report.skill.author}`);
	}
	if (report.skill.version) {
		lines.push(`  ${BOLD}Version:${RESET}        ${report.skill.version}`);
	}
	lines.push(`  ${BOLD}Status:${RESET}         ${STATUS_DISPLAY[report.status] ?? report.status}`);
	lines.push(`  ${BOLD}Score:${RESET}          ${report.score.total}/100`);
	lines.push(
		`  ${BOLD}Recommendation:${RESET} ${report.recommendation}`,
	);
	lines.push("");

	// Summary bar
	const counts = report.score;
	const parts = [
		counts.critical > 0
			? `${SEVERITY_COLORS.critical}${counts.critical} critical${RESET}`
			: null,
		counts.high > 0
			? `${SEVERITY_COLORS.high}${counts.high} high${RESET}`
			: null,
		counts.medium > 0
			? `${SEVERITY_COLORS.medium}${counts.medium} medium${RESET}`
			: null,
		counts.low > 0
			? `${SEVERITY_COLORS.low}${counts.low} low${RESET}`
			: null,
		counts.info > 0
			? `${SEVERITY_COLORS.info}${counts.info} info${RESET}`
			: null,
	].filter(Boolean);

	if (parts.length > 0) {
		lines.push(`  ${BOLD}Findings:${RESET}       ${parts.join(" | ")}`);
	} else {
		lines.push(`  ${BOLD}Findings:${RESET}       \x1b[32mNone\x1b[0m`);
	}
	lines.push("");

	// Findings detail
	if (report.findings.length > 0) {
		lines.push(`  ${BOLD}Details:${RESET}`);
		lines.push("");
		for (let i = 0; i < report.findings.length; i++) {
			lines.push(formatFinding(report.findings[i], i));
			lines.push("");
		}
	}

	// Scanners
	lines.push(`  ${DIM}Scanners: ${report.scanners.map((s) => `${s.scanner}(${s.status})`).join(", ")}${RESET}`);
	lines.push(`  ${DIM}Duration: ${report.durationMs}ms | Scanned: ${report.scannedAt}${RESET}`);
	lines.push("");

	return lines.join("\n");
}
