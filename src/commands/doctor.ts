import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

interface ToolStatus {
	name: string;
	description: string;
	installed: boolean;
	version?: string;
	installCommand: string;
}

async function checkTool(
	name: string,
	description: string,
	versionArgs: string[],
	installCommand: string,
): Promise<ToolStatus> {
	try {
		const whichCmd = process.platform === "win32" ? "where" : "which";
		await execFileAsync(whichCmd, [name]);

		let version: string | undefined;
		try {
			const result = await execFileAsync(name, versionArgs);
			version = (result.stdout || result.stderr).trim().split("\n")[0];
		} catch {
			version = "installed (version unknown)";
		}

		return { name, description, installed: true, version, installCommand };
	} catch {
		return { name, description, installed: false, installCommand };
	}
}

export async function runDoctor(): Promise<void> {
	console.log("\n  ClawGuard Doctor");
	console.log("  ================\n");
	console.log("  Checking available scanning tools...\n");

	const tools = await Promise.all([
		checkTool(
			"gitleaks",
			"Secret detection",
			["version"],
			"brew install gitleaks",
		),
		checkTool(
			"semgrep",
			"Custom SAST rules",
			["--version"],
			"pip install semgrep",
		),
		checkTool(
			"snyk",
			"SCA + SAST scanning",
			["--version"],
			"npm install -g snyk && snyk auth",
		),
		checkTool(
			"mcp-scan",
			"MCP server scanning",
			["--version"],
			"pip install mcp-scan",
		),
		checkTool(
			"npm",
			"Dependency auditing",
			["--version"],
			"(bundled with Node.js)",
		),
	]);

	const installed = tools.filter((t) => t.installed);
	const missing = tools.filter((t) => !t.installed);

	for (const tool of tools) {
		const icon = tool.installed ? "\x1b[32m+\x1b[0m" : "\x1b[31mx\x1b[0m";
		const version = tool.version ? `  \x1b[2m${tool.version}\x1b[0m` : "";
		console.log(`  ${icon} ${tool.name} — ${tool.description}${version}`);
	}

	console.log("");
	console.log(`  ${installed.length}/${tools.length} tools available`);
	console.log("");

	if (missing.length > 0) {
		console.log("  \x1b[33mMissing tools (optional):\x1b[0m");
		for (const tool of missing) {
			console.log(`    ${tool.name}: ${tool.installCommand}`);
		}
		console.log("");
	}

	console.log(
		"  \x1b[2mNote: ClawGuard works without external tools. They enhance scanning depth.\x1b[0m\n",
	);
}
