const DEFAULT_REGISTRY = "https://clawguard.sh";

export interface CheckCommandOptions {
	registry?: string;
}

/**
 * Check a skill against the ClawGuard registry API.
 */
export async function runCheck(
	skillName: string,
	options: CheckCommandOptions = {},
): Promise<void> {
	const registryUrl = options.registry ?? DEFAULT_REGISTRY;
	const url = `${registryUrl}/api/v1/check?name=${encodeURIComponent(skillName)}`;

	console.log(`\n  Checking ${skillName} against ClawGuard registry...`);
	console.log(`  \x1b[2m${url}\x1b[0m\n`);

	try {
		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === 404) {
				console.log("  \x1b[33mSkill not found in the ClawGuard registry.\x1b[0m");
				console.log(
					"  This skill has not been scanned yet. Run a local scan with:",
				);
				console.log(`  \x1b[36mnpx @yourclaw/clawguard-cli scan ./path/to/${skillName}\x1b[0m\n`);
				return;
			}
			throw new Error(`Registry returned ${response.status}: ${response.statusText}`);
		}

		const data = (await response.json()) as {
			status: string;
			trustLevel: string;
			severityScore: number;
			findings: Record<string, number>;
			recommendation: string;
			lastScanned: string;
			detailUrl: string;
			message?: string;
		};

		const statusColor =
			data.status === "passed"
				? "\x1b[32m"
				: data.status === "warning"
					? "\x1b[33m"
					: "\x1b[31m";

		console.log(`  Status:         ${statusColor}${data.status.toUpperCase()}\x1b[0m`);
		console.log(`  Trust Level:    ${data.trustLevel}`);
		console.log(`  Severity Score: ${data.severityScore}/100`);
		console.log(
			`  Findings:       ${data.findings.critical ?? 0} critical, ${data.findings.high ?? 0} high, ${data.findings.medium ?? 0} medium`,
		);
		console.log(`  Recommendation: ${data.recommendation}`);
		if (data.message) {
			console.log(`  Message:        ${data.message}`);
		}
		console.log(`  Last Scanned:   ${data.lastScanned}`);
		console.log(`  Details:        ${data.detailUrl}`);
		console.log("");
	} catch (error) {
		if (
			error instanceof TypeError &&
			error.message.includes("fetch")
		) {
			console.log(
				"  \x1b[31mCould not connect to the ClawGuard registry.\x1b[0m",
			);
			console.log("  The registry may not be running yet. Run a local scan instead:");
			console.log(`  \x1b[36mnpx @yourclaw/clawguard-cli scan ./path/to/${skillName}\x1b[0m\n`);
		} else {
			console.error(
				`  \x1b[31mError:\x1b[0m ${error instanceof Error ? error.message : String(error)}\n`,
			);
		}
	}
}
